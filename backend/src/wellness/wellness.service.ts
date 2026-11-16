import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto, CreateEquipmentIssueDto } from './dto/wellness.dto';
import { IssueStatus } from '@prisma/client';

@Injectable()
export class WellnessService {
  constructor(private prisma: PrismaService) {}

  async getClasses(dateStr?: string, currentUserId?: string) {
    let dateFilter: any;
    if (dateStr) {
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      dateFilter = { gte: d, lt: nextDay };
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateFilter = { gte: today };
    }

    const classes = await this.prisma.wellnessClass.findMany({
      where: { scheduledDate: dateFilter },
      include: {
        bookings: {
          include: {
            user: { include: { hrRecord: true } },
          },
        },
      },
      orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
    });

    return classes.map((c) => ({
      id: c.id,
      title: c.title,
      instructorName: c.instructorName,
      scheduledDate: c.scheduledDate,
      startTime: c.startTime,
      endTime: c.endTime,
      capacity: c.capacity,
      bookedCount: c.bookings.length,
      isFull: c.bookings.length >= c.capacity,
      isBookedByMe: currentUserId
        ? c.bookings.some((b) => b.userId === currentUserId)
        : false,
      participants: c.bookings.map((b) => ({
        bookingId: b.id,
        userId: b.userId,
        employeeId: b.user.employeeId,
        fullName: b.user.hrRecord.fullName,
        department: b.user.hrRecord.department,
        photoUrl: b.user.hrRecord.photoUrl,
        attended: b.attended,
      })),
    }));
  }

  async createClass(dto: CreateClassDto) {
    return this.prisma.wellnessClass.create({
      data: {
        title: dto.title.trim(),
        instructorName: dto.instructorName.trim(),
        scheduledDate: new Date(dto.scheduledDate),
        startTime: dto.startTime.trim(),
        endTime: dto.endTime.trim(),
        capacity: dto.capacity,
      },
    });
  }

  async bookClass(classId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.waiverSigned) {
      throw new BadRequestException('You must sign the health screening & liability waiver before booking group classes');
    }

    const wClass = await this.prisma.wellnessClass.findUnique({
      where: { id: classId },
      include: { bookings: true },
    });
    if (!wClass) {
      throw new NotFoundException('Class not found');
    }

    if (wClass.bookings.some((b) => b.userId === userId)) {
      throw new ConflictException('You have already booked a spot in this class');
    }

    if (wClass.bookings.length >= wClass.capacity) {
      throw new ConflictException('This class has reached full capacity');
    }

    return this.prisma.classBooking.create({
      data: {
        classId,
        userId,
      },
      include: { class: true },
    });
  }

  async cancelBooking(classId: string, userId: string) {
    const booking = await this.prisma.classBooking.findUnique({
      where: {
        classId_userId: {
          classId,
          userId,
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.classBooking.delete({
      where: { id: booking.id },
    });
  }

  async getEquipmentIssues() {
    return this.prisma.equipmentIssue.findMany({
      orderBy: { reportedAt: 'desc' },
    });
  }

  async reportEquipmentIssue(dto: CreateEquipmentIssueDto) {
    return this.prisma.equipmentIssue.create({
      data: {
        equipmentName: dto.equipmentName.trim(),
        description: dto.description.trim(),
      },
    });
  }

  async updateIssueStatus(id: string, status: IssueStatus) {
    const issue = await this.prisma.equipmentIssue.findUnique({
      where: { id },
    });
    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    return this.prisma.equipmentIssue.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === IssueStatus.RESOLVED ? new Date() : null,
      },
    });
  }
}

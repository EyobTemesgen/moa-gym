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
    let targetDate: Date;
    let dateFilter: any;

    if (dateStr) {
      targetDate = new Date(dateStr);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      dateFilter = { gte: targetDate, lt: nextDay };
    } else {
      targetDate = new Date();
      targetDate.setHours(0, 0, 0, 0);
      dateFilter = { gte: targetDate };
    }

    // Auto-seed standard timetable for Monday-Saturday if no sessions exist for the requested day
    const checkDate = dateStr ? targetDate : new Date();
    checkDate.setHours(0, 0, 0, 0);
    const dayOfWeek = checkDate.getDay(); // 0 is Sunday

    if (dayOfWeek >= 1 && dayOfWeek <= 6) {
      const nextDay = new Date(checkDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const existingCount = await this.prisma.wellnessClass.count({
        where: { scheduledDate: { gte: checkDate, lt: nextDay } },
      });

      if (existingCount === 0) {
        await this.prisma.wellnessClass.createMany({
          data: [
            {
              title: 'Morning Aerobics & Conditioning',
              instructorName: 'Coach Henok',
              scheduledDate: checkDate,
              startTime: '06:15',
              endTime: '07:15',
              capacity: 15,
            },
            {
              title: 'Post-Work Strength & Conditioning',
              instructorName: 'Trainer Bethel',
              scheduledDate: checkDate,
              startTime: '17:30',
              endTime: '18:30',
              capacity: 18,
            },
            {
              title: 'Desk Worker Posture & Mobility',
              instructorName: 'Coach Tigist',
              scheduledDate: checkDate,
              startTime: '18:45',
              endTime: '19:45',
              capacity: 14,
            },
          ],
        });
      }
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
        fullName: b.user.hrRecord?.fullName || b.user.employeeId,
        department: b.user.hrRecord?.department || 'Ministry of Agriculture',
        photoUrl: b.user.hrRecord?.photoUrl,
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
      include: { hrRecord: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.hrRecord?.employmentStatus !== 'ACTIVE') {
      throw new BadRequestException('Your staff membership account is not active. Please consult Gym Administration.');
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

    // 1. Check if class has already concluded or started
    const toLocalDateStr = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const now = new Date();
    const classDate = new Date(wClass.scheduledDate);
    const classDateStr = toLocalDateStr(classDate);
    const todayDateStr = toLocalDateStr(now);

    if (classDateStr < todayDateStr) {
      throw new BadRequestException('Booking closed: This session date has already passed');
    }

    if (classDateStr === todayDateStr) {
      const curHours = String(now.getHours()).padStart(2, '0');
      const curMins = String(now.getMinutes()).padStart(2, '0');
      const curTime = `${curHours}:${curMins}`;
      if (wClass.startTime <= curTime) {
        throw new BadRequestException('Booking closed: This session has already started or concluded');
      }
    }

    // 2. Duplicate booking check
    if (wClass.bookings.some((b) => b.userId === userId)) {
      throw new ConflictException('You have already booked a spot in this class');
    }

    // 3. Overlapping time conflict on the same date
    const startOfDay = new Date(classDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(classDate);
    endOfDay.setHours(23, 59, 59, 999);

    const userBookingsSameDay = await this.prisma.classBooking.findMany({
      where: {
        userId,
        class: {
          scheduledDate: { gte: startOfDay, lte: endOfDay },
          id: { not: classId },
        },
      },
      include: { class: true },
    });

    for (const b of userBookingsSameDay) {
      if (wClass.startTime < b.class.endTime && b.class.startTime < wClass.endTime) {
        throw new ConflictException(
          `Time conflict: You already have a booked session ("${b.class.title}" from ${b.class.startTime} to ${b.class.endTime}) at this time`,
        );
      }
    }

    // 4. Capacity check
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

  async toggleAttendance(classId: string, attendeeUserId: string, attended: boolean) {
    const booking = await this.prisma.classBooking.findUnique({
      where: {
        classId_userId: {
          classId,
          userId: attendeeUserId,
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found for this participant in this class');
    }

    return this.prisma.classBooking.update({
      where: { id: booking.id },
      data: { attended },
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

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { BatchRegistrationDto } from './dto/batch-registration.dto';
import { EmploymentStatus } from '@prisma/client';

@Injectable()
export class RegistrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRegistrationDto, registeredBy = 'Front Desk Attendant') {
    const employeeId = dto.employeeId.trim();
    const fullName = dto.fullName.trim();
    const department = dto.department.trim();

    if (!employeeId || !fullName || !department) {
      throw new BadRequestException('Employee ID, Full Name, and Directorate (የስራ ክፍል) are required');
    }

    // Check if employee is already registered in active status
    const existing = await this.prisma.gymRegistration.findFirst({
      where: {
        employeeId,
        status: 'ACTIVE',
      },
    });

    if (existing) {
      return {
        ...existing,
        alreadyRegistered: true,
        message: `Employee "${fullName}" is already registered with Reg # ${existing.regNumber} (ተ.ቁ ${existing.regNumber}).`,
      };
    }

    // Ensure HR Roster has this employee
    await this.prisma.hrEmployeeRoster.upsert({
      where: { employeeId },
      update: {
        fullName,
        department,
        phone: dto.phone || undefined,
        email: dto.email || undefined,
        photoUrl: dto.photoUrl || undefined,
      },
      create: {
        employeeId,
        fullName,
        department,
        phone: dto.phone || '+251 91 000 0000',
        email: dto.email || undefined,
        photoUrl: dto.photoUrl || undefined,
        employmentStatus: EmploymentStatus.ACTIVE,
      },
    });

    // Calculate next sequential regNumber (ተ.ቁ) to ensure gapless registry ordering
    const maxReg = await this.prisma.gymRegistration.findFirst({
      orderBy: { regNumber: 'desc' },
      select: { regNumber: true },
    });
    const nextRegNumber = (maxReg?.regNumber || 0) + 1;

    // Create the Gym Registration record
    const registration = await this.prisma.gymRegistration.create({
      data: {
        regNumber: nextRegNumber,
        employeeId,
        fullName,
        department,
        phone: dto.phone || null,
        email: dto.email || null,
        gender: dto.gender || null,
        shiftPreference: dto.shiftPreference || 'ANY',
        registrationSource: dto.registrationSource || 'FRONT_DESK',
        registeredBy,
        signatureConfirmed: dto.signatureConfirmed ?? true,
        signatureData: dto.signatureData || null,
        status: 'ACTIVE',
        remarks: dto.remarks || null,
      },
      include: {
        hrRecord: true,
      },
    });

    return {
      ...registration,
      alreadyRegistered: false,
      message: `Successfully registered "${fullName}" under Reg # ${registration.regNumber} (ተ.ቁ ${registration.regNumber}).`,
    };
  }

  async findAll(params: {
    query?: string;
    department?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { query, department, status, page = 1, limit = 200 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (department && department !== 'ALL') {
      where.department = { contains: department, mode: 'insensitive' };
    }

    if (query && query.trim()) {
      const q = query.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { employeeId: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total, distinctDepts] = await Promise.all([
      this.prisma.gymRegistration.findMany({
        where,
        orderBy: { regNumber: 'asc' },
        skip,
        take: limit,
        include: {
          hrRecord: {
            select: {
              photoUrl: true,
              employmentStatus: true,
            },
          },
        },
      }),
      this.prisma.gymRegistration.count({ where }),
      this.prisma.gymRegistration.findMany({
        select: { department: true },
        distinct: ['department'],
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      departments: distinctDepts.map((d) => d.department).filter(Boolean).sort(),
    };
  }

  async findOne(id: string) {
    const record = await this.prisma.gymRegistration.findUnique({
      where: { id },
      include: { hrRecord: true },
    });

    if (!record) {
      throw new NotFoundException('Registration record not found');
    }

    return record;
  }

  async update(
    id: string,
    data: {
      phone?: string;
      shiftPreference?: string;
      department?: string;
      remarks?: string;
    },
  ) {
    const record = await this.prisma.gymRegistration.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Registration record not found');
    }

    return this.prisma.gymRegistration.update({
      where: { id },
      data: {
        ...(data.phone !== undefined ? { phone: data.phone?.trim() } : {}),
        ...(data.shiftPreference !== undefined ? { shiftPreference: data.shiftPreference } : {}),
        ...(data.department !== undefined ? { department: data.department?.trim() } : {}),
        ...(data.remarks !== undefined ? { remarks: data.remarks?.trim() } : {}),
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const record = await this.prisma.gymRegistration.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Registration record not found');
    }

    return this.prisma.gymRegistration.update({
      where: { id },
      data: { status },
    });
  }

  async getStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      total,
      active,
      suspended,
      depts,
      todayCount,
      departmentGroups,
      shiftGroups,
      recentList,
      activeFloorCount,
    ] = await Promise.all([
      this.prisma.gymRegistration.count(),
      this.prisma.gymRegistration.count({ where: { status: 'ACTIVE' } }),
      this.prisma.gymRegistration.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.gymRegistration.findMany({
        select: { department: true },
        distinct: ['department'],
      }),
      this.prisma.gymRegistration.count({
        where: { registeredAt: { gte: todayStart } },
      }),
      this.prisma.gymRegistration.groupBy({
        by: ['department'],
        _count: { department: true },
        orderBy: { _count: { department: 'desc' } },
        take: 8,
      }),
      this.prisma.gymRegistration.groupBy({
        by: ['shiftPreference'],
        _count: { shiftPreference: true },
      }),
      this.prisma.gymRegistration.findMany({
        take: 6,
        orderBy: { registeredAt: 'desc' },
        include: {
          hrRecord: {
            select: {
              photoUrl: true,
              employmentStatus: true,
            },
          },
        },
      }),
      this.prisma.attendance.count({
        where: { checkOutTime: null },
      }),
    ]);

    const shiftMap: Record<string, number> = {
      MORNING: 0,
      LUNCH: 0,
      EVENING: 0,
      FLEXIBLE: 0,
    };

    for (const g of shiftGroups) {
      const key = (g.shiftPreference || 'FLEXIBLE').toUpperCase();
      if (key in shiftMap) {
        shiftMap[key] += g._count.shiftPreference;
      } else {
        shiftMap.FLEXIBLE += g._count.shiftPreference;
      }
    }

    return {
      totalRegistered: total,
      activeMembers: active,
      suspendedMembers: suspended,
      totalDirectorates: depts.length,
      registeredToday: todayCount,
      activeFloorCount,
      departmentBreakdown: departmentGroups.map((d) => ({
        department: d.department,
        count: d._count.department,
      })),
      shiftBreakdown: shiftMap,
      recentRegistrations: recentList,
    };
  }

  async createBatch(dto: BatchRegistrationDto, registeredBy = 'Front Desk Attendant') {
    const results = [];
    for (const item of dto.registrations) {
      try {
        const res = await this.create(item, registeredBy);
        results.push(res);
      } catch (err: any) {
        results.push({
          employeeId: item.employeeId,
          fullName: item.fullName,
          error: err.message,
        });
      }
    }

    return {
      totalProcessed: dto.registrations.length,
      results,
    };
  }
}

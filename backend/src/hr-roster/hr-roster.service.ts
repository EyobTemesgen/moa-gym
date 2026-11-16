import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parse } from 'csv-parse/sync';
import { EmploymentStatus } from '@prisma/client';

@Injectable()
export class HrRosterService {
  constructor(private prisma: PrismaService) {}

  async parseAndUpsertCsv(csvContent: string) {
    if (!csvContent || !csvContent.trim()) {
      throw new BadRequestException('CSV file content cannot be empty');
    }

    let records: any[];
    try {
      records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (err: any) {
      throw new BadRequestException(`Malformed CSV data: ${err.message}`);
    }

    if (!records.length) {
      throw new BadRequestException('No data rows found in uploaded CSV');
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const row of records) {
      const employeeId = row.employeeId || row.EmployeeId || row['Employee ID'] || row['ID'];
      const fullName = row.fullName || row.FullName || row['Full Name'] || row['Name'];
      const department = row.department || row.Department || row['Directorate'] || 'Ministry of Agriculture';
      const phone = row.phone || row.Phone || row['Mobile'] || '';
      const email = row.email || row.Email || null;
      const photoUrl = row.photoUrl || row.PhotoUrl || null;

      let status = EmploymentStatus.ACTIVE;
      const rawStatus = (row.employmentStatus || row.Status || '').toUpperCase();
      if (rawStatus === 'INACTIVE') status = EmploymentStatus.INACTIVE;
      if (rawStatus === 'SUSPENDED') status = EmploymentStatus.SUSPENDED;

      if (!employeeId || !fullName) {
        continue;
      }

      const existing = await this.prisma.hrEmployeeRoster.findUnique({
        where: { employeeId: employeeId.trim() },
      });

      if (existing) {
        await this.prisma.hrEmployeeRoster.update({
          where: { employeeId: employeeId.trim() },
          data: {
            fullName: fullName.trim(),
            department: department.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : null,
            photoUrl: photoUrl ? photoUrl.trim() : existing.photoUrl,
            employmentStatus: status,
          },
        });
        updatedCount++;
      } else {
        await this.prisma.hrEmployeeRoster.create({
          data: {
            employeeId: employeeId.trim(),
            fullName: fullName.trim(),
            department: department.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : null,
            photoUrl: photoUrl ? photoUrl.trim() : null,
            employmentStatus: status,
          },
        });
        createdCount++;
      }
    }

    return {
      success: true,
      totalRows: records.length,
      created: createdCount,
      updated: updatedCount,
    };
  }

  async findAll(params: {
    query?: string;
    department?: string;
    status?: EmploymentStatus;
    page?: number;
    limit?: number;
  }) {
    const { query, department, status, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query && query.trim()) {
      const q = query.trim();
      where.OR = [
        { employeeId: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (department && department !== 'ALL') {
      where.department = department;
    }

    if (status) {
      where.employmentStatus = status;
    }

    const [total, items] = await Promise.all([
      this.prisma.hrEmployeeRoster.count({ where }),
      this.prisma.hrEmployeeRoster.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fullName: 'asc' },
        include: {
          userAccount: {
            select: {
              id: true,
              role: true,
              waiverSigned: true,
              waiverSignedAt: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDepartments() {
    const records = await this.prisma.hrEmployeeRoster.findMany({
      select: { department: true },
      distinct: ['department'],
      orderBy: { department: 'asc' },
    });
    return records.map((r) => r.department);
  }

  async updateStatus(employeeId: string, status: EmploymentStatus) {
    const record = await this.prisma.hrEmployeeRoster.findUnique({
      where: { employeeId },
    });
    if (!record) {
      throw new NotFoundException(`Employee ${employeeId} not found`);
    }

    return this.prisma.hrEmployeeRoster.update({
      where: { employeeId },
      data: { employmentStatus: status },
    });
  }
}

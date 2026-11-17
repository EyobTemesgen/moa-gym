import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [logs, totalRosterCount, registeredUserCount, totalEnrolledCount, config] =
      await Promise.all([
        this.prisma.attendance.findMany({
          where: { checkInTime: { gte: startDate } },
          include: {
            user: { include: { hrRecord: true } },
          },
          orderBy: { checkInTime: 'asc' },
        }),
        this.prisma.hrEmployeeRoster.count({ where: { employmentStatus: 'ACTIVE' } }),
        this.prisma.user.count(),
        this.prisma.gymRegistration.count(),
        this.prisma.systemConfig.findFirst({ where: { id: 1 } }),
      ]);

    // Directorate breakdown
    const departmentCounts: Record<string, number> = {};
    const hourCounts: Record<number, number> = {};
    for (let h = 6; h <= 21; h++) hourCounts[h] = 0;

    let autoClosedCount = 0;
    const uniqueUserSet = new Set<string>();

    for (const log of logs) {
      const dept = log.user.hrRecord.department || 'Other';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;

      const hour = new Date(log.checkInTime).getHours();
      if (hourCounts[hour] !== undefined) {
        hourCounts[hour]++;
      }

      if (log.autoClosed) {
        autoClosedCount++;
      }

      uniqueUserSet.add(log.userId);
    }

    const departmentDistribution = Object.entries(departmentCounts)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);

    const peakHours = Object.entries(hourCounts).map(([hour, count]) => ({
      hour: `${hour.padStart(2, '0')}:00`,
      visits: count,
    }));

    return {
      periodDays: days,
      summary: {
        totalVisits: logs.length,
        uniqueStaffAttendees: uniqueUserSet.size,
        activeRosterEligible: totalRosterCount,
        accountsClaimed: registeredUserCount,
        waiversCompleted: totalEnrolledCount,
        autoClosedSessions: autoClosedCount,
        facilityMaxCapacity: config?.maxCapacity ?? 40,
      },
      departmentDistribution,
      peakHours,
    };
  }

  async generateAttendanceCsv(days = 30): Promise<string> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const logs = await this.prisma.attendance.findMany({
      where: { checkInTime: { gte: startDate } },
      include: {
        user: { include: { hrRecord: true } },
      },
      orderBy: { checkInTime: 'desc' },
    });

    const header = ['Date', 'Check-In Time', 'Check-Out Time', 'Employee ID', 'Full Name', 'Directorate', 'Locker Number', 'Auto-Closed'].join(',');
    const rows = logs.map((l) => {
      const checkInDate = new Date(l.checkInTime).toLocaleDateString('en-CA');
      const checkInTime = new Date(l.checkInTime).toLocaleTimeString('en-US', { hour12: false });
      const checkOutTime = l.checkOutTime ? new Date(l.checkOutTime).toLocaleTimeString('en-US', { hour12: false }) : 'ACTIVE';
      const locker = l.lockerNumber || 'None';
      const autoClosed = l.autoClosed ? 'YES' : 'NO';

      return [
        `"${checkInDate}"`,
        `"${checkInTime}"`,
        `"${checkOutTime}"`,
        `"${l.user.employeeId}"`,
        `"${l.user.hrRecord.fullName.replace(/"/g, '""')}"`,
        `"${l.user.hrRecord.department.replace(/"/g, '""')}"`,
        `"${locker}"`,
        `"${autoClosed}"`,
      ].join(',');
    });

    return [header, ...rows].join('\r\n');
  }

  async getConfig() {
    let cfg = await this.prisma.systemConfig.findFirst({ where: { id: 1 } });
    if (!cfg) {
      cfg = await this.prisma.systemConfig.create({
        data: { id: 1, maxCapacity: 40, waiverText: 'Default MoA Gym Liability Waiver' },
      });
    }
    return cfg;
  }

  async updateConfig(data: { maxCapacity?: number; waiverText?: string }) {
    return this.prisma.systemConfig.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        maxCapacity: data.maxCapacity ?? 40,
        waiverText: data.waiverText ?? 'Default MoA Gym Liability Waiver',
      },
    });
  }
}

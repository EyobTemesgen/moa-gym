import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HrRosterModule } from './hr-roster/hr-roster.module';
import { UsersModule } from './users/users.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LockersModule } from './lockers/lockers.module';
import { WellnessModule } from './wellness/wellness.module';
import { ReportsModule } from './reports/reports.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    HealthModule,
    AuthModule,
    HrRosterModule,
    UsersModule,
    AttendanceModule,
    LockersModule,
    WellnessModule,
    ReportsModule,
    RegistrationsModule,
  ],
})
export class AppModule {}

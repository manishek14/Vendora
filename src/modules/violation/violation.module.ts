import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViolationCategory } from '../../database/entities/violation-category.entity';
import { ViolationItem } from '../../database/entities/violation-item.entity';
import { UserViolation } from '../../database/entities/user-violation.entity';
import { UserBan } from '../../database/entities/user-ban.entity';
import { BannedIdentity } from '../../database/entities/banned-identity.entity';
import { User } from '../../database/entities/user.entity';
import { ViolationService } from './violation.service';
import { ViolationController } from './violation.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ViolationCategory, ViolationItem, UserViolation, UserBan, BannedIdentity, User]), UserModule],
  providers: [ViolationService],
  controllers: [ViolationController],
  exports: [ViolationService],
})
export class ViolationModule {}
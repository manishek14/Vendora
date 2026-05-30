import { Module } from '@nestjs/common';
import { User } from '../../database/entities/user.entity';
import { Address } from '../../database/entities/address.entity';
import { Role } from '../../database/entities/role.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address, Role])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], 
})
export class UserModule {}
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Address } from '../../database/entities/address.entity';
import { Role } from '../../database/entities/role.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddressDto } from './dto/address.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  deleteUserPermanent(userId: number) {
      throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Address)
    private addressRepo: Repository<Address>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    private configService: ConfigService,
  ) {}

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['roles', 'addresses'],
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { phone },
      relations: ['roles'],
    });
  }

  async createUser(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    const defaultRole = await this.roleRepo.findOne({ where: { name: 'user' } });
    if (defaultRole) user.roles = [defaultRole];
    return this.userRepo.save(user);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);
    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.email !== undefined) {
      const existing = await this.userRepo.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== userId) {
        throw new ConflictException('ایمیل قبلاً ثبت شده است');
      }
      user.email = dto.email;
      user.isEmailVerified = false; 
    }
    return this.userRepo.save(user);
  }

  async addPhone(userId: number, phone: string): Promise<void> {
    const user = await this.findById(userId);
    const existing = await this.userRepo.findOne({ where: { phone } });
    if (existing && existing.id !== userId) {
      throw new ConflictException('شماره موبایل قبلاً ثبت شده است');
    }
    user.phone = phone;
    user.isPhoneVerified = false;
    await this.userRepo.save(user);
  }

  async verifyPhone(userId: number): Promise<void> {
    const user = await this.findById(userId);
    if (!user.phone) throw new BadRequestException('شماره موبایل ثبت نشده است');
    user.isPhoneVerified = true;
    await this.userRepo.save(user);
  }

  async addAddress(userId: number, dto: AddressDto): Promise<Address> {
    const user = await this.findById(userId);
    if (dto.isDefault) {
      await this.addressRepo.update({ user: { id: userId } }, { isDefault: false });
    }
    const address = this.addressRepo.create({ ...dto, user });
    return this.addressRepo.save(address);
  }

  async updateAddress(userId: number, addressId: number, dto: AddressDto): Promise<Address> {
    const address = await this.addressRepo.findOne({
      where: { id: addressId, user: { id: userId } },
    });
    if (!address) throw new NotFoundException('آدرس یافت نشد');
    if (dto.isDefault) {
      await this.addressRepo.update({ user: { id: userId } }, { isDefault: false });
    }
    Object.assign(address, dto);
    return this.addressRepo.save(address);
  }

  async deleteAddress(userId: number, addressId: number): Promise<void> {
    const result = await this.addressRepo.delete({ id: addressId, user: { id: userId } });
    if (result.affected === 0) throw new NotFoundException('آدرس یافت نشد');
  }

  async setPassword(userId: number, password: string): Promise<void> {
    const user = await this.findById(userId);
    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await this.userRepo.save(user);
  }

  async isFullyVerified(userId: number):Promise<any> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['addresses'],
    });
    if (!user) return false;
    return user.isPhoneVerified === true && user.addresses && user.addresses.length > 0;
  }

  async incrementTotalPurchase(userId: number, amount: number): Promise<void> {
    await this.userRepo.increment({ id: userId }, 'totalPurchaseAmount', amount);
  }
}
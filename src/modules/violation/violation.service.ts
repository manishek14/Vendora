import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ViolationCategory } from '../../database/entities/violation-category.entity';
import {
  ViolationItem,
  PunishmentType,
} from '../../database/entities/violation-item.entity';
import { UserViolation } from '../../database/entities/user-violation.entity';
import { UserBan, BanType } from '../../database/entities/user-ban.entity';
import { BannedIdentity } from '../../database/entities/banned-identity.entity';
import { User } from '../../database/entities/user.entity';
import { UserService } from '../user/user.service';
import { RegisterViolationDto } from './dto/register-violation.dto';
import { CreateViolationItemDto } from './dto/create-violation-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class ViolationService {
  constructor(
    @InjectRepository(ViolationCategory)
    private categoryRepo: Repository<ViolationCategory>,
    @InjectRepository(ViolationItem)
    private itemRepo: Repository<ViolationItem>,
    @InjectRepository(UserViolation)
    private userViolationRepo: Repository<UserViolation>,
    @InjectRepository(UserBan)
    private banRepo: Repository<UserBan>,
    @InjectRepository(BannedIdentity)
    private bannedIdentityRepo: Repository<BannedIdentity>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private userService: UserService,
  ) {}

  async createCategory(dto: CreateCategoryDto): Promise<ViolationCategory> {
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async getCategories(): Promise<ViolationCategory[]> {
    return this.categoryRepo.find({ relations: ['items'] });
  }

  async createViolationItem(
    dto: CreateViolationItemDto,
  ): Promise<ViolationItem> {
    const category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');

    const item = this.itemRepo.create({
      ...dto,
      category,
      defaultPunishmentType: dto.defaultPunishmentType as PunishmentType,
    });
    return this.itemRepo.save(item);
  }

  async getViolationItems(): Promise<ViolationItem[]> {
    return this.itemRepo.find({ relations: ['category'] });
  }

  async registerViolation(
    adminId: number,
    userId: number,
    dto: RegisterViolationDto,
  ): Promise<UserViolation> {
    const user = await this.userService.findById(userId);
    const admin = await this.userService.findById(adminId);
    const violationItem = await this.itemRepo.findOneBy({
      id: dto.violationItemId,
    });
    if (!violationItem) throw new NotFoundException('آیتم تخلف یافت نشد');

    const violation = this.userViolationRepo.create({
      user,
      violationItem,
      createdBy: admin,
      description: dto.description,
    });
    const saved = await this.userViolationRepo.save(violation);

    await this.autoApplyBan(userId, violationItem.id);
    return saved;
  }

  async getUserViolations(userId: number): Promise<UserViolation[]> {
    return this.userViolationRepo.find({
      where: { user: { id: userId } },
      relations: ['violationItem', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  private async autoApplyBan(
    userId: number,
    violationItemId: number,
  ): Promise<void> {
    const violations = await this.userViolationRepo.find({
      where: { user: { id: userId }, violationItem: { id: violationItemId } },
    });
    const violationItem = await this.itemRepo.findOneBy({
      id: violationItemId,
    });
    if (!violationItem) return;

    const count = violations.length;
    if (violationItem.limit && count >= violationItem.limit) {
      const activeBan = await this.banRepo.findOne({
        where: { user: { id: userId }, isActive: true },
      });
      if (activeBan) return;

      await this.banUser(
        userId,
        1,
        violationItem.defaultPunishmentType as unknown as BanType,
        violationItem.defaultDurationDays,
        `تخلف مکرر: ${violationItem.name}`,
        violationItemId,
      );
    }
  }

  async banUser(
    userId: number,
    adminId: number,
    punishmentType: BanType,
    durationDays: number | undefined,
    reason: string,
    violationItemId?: number,
  ): Promise<UserBan> {
    const user = await this.userService.findById(userId);
    const admin = await this.userService.findById(adminId);

    const startDate = new Date();
    let endDate: Date | null = null;
    if (punishmentType === BanType.TEMPORARY && durationDays) {
      endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
    }

    const ban = new UserBan();
    ban.user = user;
    ban.bannedBy = admin;
    ban.reason = reason;
    ban.punishmentType = punishmentType;
    ban.durationDays =
      punishmentType === BanType.TEMPORARY ? (durationDays ?? null) : null;
    ban.startDate = startDate;
    ban.endDate = endDate;
    ban.isActive = true;
    if (violationItemId) {
      ban.violationItem = { id: violationItemId } as ViolationItem;
    }

    const savedBan = await this.banRepo.save(ban);

    user.isBanned = true;
    await this.userRepo.save(user);

    if (punishmentType === BanType.PERMANENT) {
      await this.userService.deleteUserPermanent(userId);
      if (user.phone) {
        await this.bannedIdentityRepo.save({ phone: user.phone });
      }
      if (user.email) {
        await this.bannedIdentityRepo.save({ email: user.email });
      }
    }

    return savedBan;
  }

  async unbanUser(userId: number, adminId: number): Promise<void> {
    const ban = await this.banRepo.findOne({
      where: { user: { id: userId }, isActive: true },
    });
    if (!ban) throw new NotFoundException('بن فعالی برای این کاربر یافت نشد');

    ban.isActive = false;
    await this.banRepo.save(ban);

    const user = await this.userService.findById(userId);
    if (user && !user.isBanned) {
      user.isBanned = false;
      await this.userRepo.save(user);
    }
  }

  async checkBanStatus(
    userId: number,
  ): Promise<{ isBanned: boolean; remainingDays?: number; reason?: string }> {
    const ban = await this.banRepo.findOne({
      where: { user: { id: userId }, isActive: true },
      relations: ['user'],
    });
    if (!ban) return { isBanned: false };

    if (ban.punishmentType === BanType.TEMPORARY && ban.endDate) {
      const now = new Date();
      if (now > ban.endDate) {
        await this.unbanUser(userId, 1);
        return { isBanned: false };
      }
      const remainingMs = ban.endDate.getTime() - now.getTime();
      const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
      return { isBanned: true, remainingDays, reason: ban.reason };
    }

    return { isBanned: true, reason: ban.reason };
  }

  async isIdentityBanned(phone?: string, email?: string): Promise<boolean> {
    if (!phone && !email) return false;
    const banned = await this.bannedIdentityRepo.findOne({
      where: [{ phone }, { email }],
    });
    return !!banned;
  }

  async getActiveBans(): Promise<UserBan[]> {
    return this.banRepo.find({
      where: { isActive: true },
      relations: ['user', 'bannedBy', 'violationItem'],
      order: { createdAt: 'DESC' },
    });
  }

  async autoExpireBans(): Promise<void> {
    const expiredBans = await this.banRepo.find({
      where: {
        isActive: true,
        punishmentType: BanType.TEMPORARY,
        endDate: LessThan(new Date()),
      },
      relations: ['user'],
    });
    for (const ban of expiredBans) {
      ban.isActive = false;
      await this.banRepo.save(ban);
      if (ban.user) {
        ban.user.isBanned = false;
        await this.userRepo.save(ban.user);
      }
    }
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from '../../../database/entities/notification.entity';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { InternalNotificationDto } from '../dto/internal-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async sendInternal(userId: number, dto: InternalNotificationDto): Promise<Notification> {
    const notification = this.notificationRepo.create({
      user: { id: userId } as any,
      title: dto.title,
      body: dto.body,
      data: dto.data,
      type: NotificationType.INTERNAL,
      status: NotificationStatus.SENT,
      sentAt: new Date(),
    });
    return this.notificationRepo.save(notification);
  }

  async sendBroadcast(dto: InternalNotificationDto): Promise<void> {
    const users: any[] = await this.notificationRepo.manager.query('SELECT id FROM users WHERE "isBanned" = false');
    for (const user of users) {
      await this.sendInternal(user.id, dto);
    }
  }

  async getUserNotifications(userId: number, limit = 20, offset = 0) {
    const [items, total] = await this.notificationRepo.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { items, total };
  }

  async sendEmail(userId: number | null, to: string, subject: string, html: string): Promise<void> {
    const notification = this.notificationRepo.create({
      user: userId ? ({ id: userId } as any) : null,
      title: subject,
      body: html,
      type: NotificationType.EMAIL,
      status: NotificationStatus.PENDING,
    });
    const saved = await this.notificationRepo.save(notification);

    const success = await this.emailService.send(to, subject, html);
    saved.status = success ? NotificationStatus.SENT : NotificationStatus.FAILED;
    saved.sentAt = success ? new Date() : null;
    await this.notificationRepo.save(saved);
  }

  async sendSms(userId: number | null, to: string, templateId: string, params: any): Promise<void> {
    const notification = this.notificationRepo.create({
      user: userId ? ({ id: userId } as any) : null,
      title: `SMS to ${to}`,
      body: JSON.stringify(params),
      type: NotificationType.SMS,
      status: NotificationStatus.PENDING,
    });
    const saved = await this.notificationRepo.save(notification);

    const success = await this.smsService.send(to, templateId, params);
    saved.status = success ? NotificationStatus.SENT : NotificationStatus.FAILED;
    saved.sentAt = success ? new Date() : null;
    await this.notificationRepo.save(saved);
  }
}

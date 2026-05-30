import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userId: number, createTicketDto: CreateTicketDto) {
    const { replyTo, ...ticketData } = createTicketDto;
    const user = await this.userRepository.findOneByOrFail({ id: userId });

    let replyToTicket: Ticket | null = null;
    if (replyTo) {
      replyToTicket = await this.ticketRepository.findOneBy({ id: replyTo });
      if (!replyToTicket) throw new NotFoundException('تیکت مرجع یافت نشد');
    }

    const ticket = this.ticketRepository.create({
      ...ticketData,
      replyTo: replyToTicket ?? undefined,
      user,
    });

    return this.ticketRepository.save(ticket);
  }

  async findAll(userId: number, isAdmin: boolean) {
    if (isAdmin) {
      return this.ticketRepository.find({
        relations: ['user', 'replies', 'replyTo'],
        order: { createdAt: 'DESC' },
      });
    }
    return this.ticketRepository.find({
      where: { user: { id: userId }, replyTo: undefined },
      relations: ['replies'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number, isAdmin: boolean) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['user', 'replies', 'replyTo'],
    });
    if (!ticket) throw new NotFoundException('تیکت یافت نشد');
    if (!isAdmin && ticket.user.id !== userId)
      throw new ForbiddenException('دسترسی ندارید');
    return ticket;
  }

  async update(id: number, userId: number, isAdmin: boolean, updateTicketDto: UpdateTicketDto) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!ticket) throw new NotFoundException('تیکت یافت نشد');
    if (!isAdmin && ticket.user.id !== userId)
      throw new ForbiddenException('دسترسی ندارید');
    Object.assign(ticket, updateTicketDto);
    return this.ticketRepository.save(ticket);
  }

  async remove(id: number, userId: number, isAdmin: boolean) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!ticket) throw new NotFoundException('تیکت یافت نشد');
    if (!isAdmin && ticket.user.id !== userId)
      throw new ForbiddenException('دسترسی ندارید');
    await this.ticketRepository.remove(ticket);
    return { message: 'تیکت حذف شد' };
  }
}

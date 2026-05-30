import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { User } from '../../database/entities/user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockTicketRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  remove: jest.fn(),
};

const mockUserRepo = {
  findOneByOrFail: jest.fn(),
};

describe('TicketsService', () => {
  let service: TicketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: getRepositoryToken(Ticket), useValue: mockTicketRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a ticket without replyTo', async () => {
      const user = { id: 1 };
      mockUserRepo.findOneByOrFail.mockResolvedValue(user);
      mockTicketRepo.create.mockReturnValue({ title: 'test', user });
      mockTicketRepo.save.mockResolvedValue({ id: 1, title: 'test', user });

      const result = await service.create(1, { title: 'test', subject: 'sub' });
      expect(result).toHaveProperty('id', 1);
      expect(mockTicketRepo.findOneBy).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if replyTo ticket not found', async () => {
      mockUserRepo.findOneByOrFail.mockResolvedValue({ id: 1 });
      mockTicketRepo.findOneBy.mockResolvedValue(null);

      await expect(service.create(1, { title: 'test', subject: 'sub', replyTo: 99 }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if ticket not found', async () => {
      mockTicketRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(99, 1, false)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      mockTicketRepo.findOne.mockResolvedValue({ id: 1, user: { id: 2 } });
      await expect(service.findOne(1, 1, false)).rejects.toThrow(ForbiddenException);
    });

    it('should return ticket for admin regardless of ownership', async () => {
      const ticket = { id: 1, user: { id: 2 } };
      mockTicketRepo.findOne.mockResolvedValue(ticket);
      const result = await service.findOne(1, 1, true);
      expect(result).toEqual(ticket);
    });
  });

  describe('remove', () => {
    it('should remove ticket for admin', async () => {
      const ticket = { id: 1, user: { id: 2 } };
      mockTicketRepo.findOne.mockResolvedValue(ticket);
      mockTicketRepo.remove.mockResolvedValue(ticket);
      const result = await service.remove(1, 1, true);
      expect(result).toHaveProperty('message');
    });
  });
});

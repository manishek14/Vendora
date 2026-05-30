import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from '../../database/entities/review.entity';
import { Product } from '../../database/entities/product.entity';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

const mockReviewRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({ avg: '4.5' }),
  }),
};

const mockProductRepo = {
  findOneBy: jest.fn(),
  update: jest.fn(),
};

describe('ReviewService', () => {
  let service: ReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: getRepositoryToken(Review), useValue: mockReviewRepo },
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw NotFoundException if product not found', async () => {
      mockProductRepo.findOneBy.mockResolvedValue(null);
      await expect(service.create(1, 99, { rating: 5 })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if review already exists', async () => {
      mockProductRepo.findOneBy.mockResolvedValue({ id: 1 });
      mockReviewRepo.findOne.mockResolvedValue({ id: 1 });
      await expect(service.create(1, 1, { rating: 5 })).rejects.toThrow(BadRequestException);
    });

    it('should create review successfully', async () => {
      mockProductRepo.findOneBy.mockResolvedValue({ id: 1 });
      mockReviewRepo.findOne.mockResolvedValue(null);
      mockReviewRepo.create.mockReturnValue({ rating: 5 });
      mockReviewRepo.save.mockResolvedValue({ id: 1, rating: 5 });
      const result = await service.create(1, 1, { rating: 5 });
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('remove', () => {
    it('should throw ForbiddenException if not owner and not admin', async () => {
      mockReviewRepo.findOne.mockResolvedValue({ id: 1, user: { id: 2 }, product: { id: 1 } });
      await expect(service.remove(1, 1, false)).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to remove any review', async () => {
      mockReviewRepo.findOne.mockResolvedValue({ id: 1, user: { id: 2 }, product: { id: 1 } });
      mockReviewRepo.remove.mockResolvedValue({});
      mockProductRepo.update.mockResolvedValue({});
      mockReviewRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg: '4' }),
      });
      const result = await service.remove(1, 99, true);
      expect(result).toHaveProperty('message');
    });
  });
});

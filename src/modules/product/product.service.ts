import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { Category } from '../../database/entities/category.entity';
import { Brand } from '../../database/entities/brand.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Brand)
    private brandRepo: Repository<Brand>,
  ) {}

  async create(vendorId: number, dto: CreateProductDto): Promise<Product> {
    const category = dto.categoryId
      ? await this.categoryRepo.findOneBy({ id: dto.categoryId })
      : null;
    if (dto.categoryId && !category)
      throw new NotFoundException('دسته‌بندی یافت نشد');

    const brand = dto.brandId
      ? await this.brandRepo.findOneBy({ id: dto.brandId })
      : null;
    if (dto.brandId && !brand) throw new NotFoundException('برند یافت نشد');

    const slug = this.slugify(dto.title);
    const existing = await this.productRepo.findOneBy({ slug });
    if (existing)
      throw new BadRequestException('محصولی با این عنوان قبلاً ثبت شده است');

    const productData: Partial<Product> = {
      title: dto.title,
      description: dto.description,
      price: dto.price,
      stock: dto.stock,
      tags: dto.tags,
      dynamicAttributes: dto.dynamicAttributes,
      isFeatured: dto.isFeatured,
      isSpecial: dto.isSpecial,
      slug,
      vendor: { id: vendorId } as User,
      category: category || undefined,
      brand: brand || undefined,
      isApproved: false,
    };

    const product = this.productRepo.create(productData);
    return this.productRepo.save(product);
  }

  async findAll(filters: ProductFilterDto, limit : number = 10, page : number = 1) {
    const {sortBy, sortOrder, ...where } = filters;
    const query = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.vendor', 'vendor')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('product.isApproved = :approved', { approved: true });

    if (where.categoryId)
      query.andWhere('product.categoryId = :catId', {
        catId: where.categoryId,
      });
    if (where.brandId)
      query.andWhere('product.brandId = :brandId', { brandId: where.brandId });
    if (where.minPrice)
      query.andWhere('product.price >= :min', { min: where.minPrice });
    if (where.maxPrice)
      query.andWhere('product.price <= :max', { max: where.maxPrice });
    if (where.tags?.length)
      query.andWhere('product.tags && :tags', { tags: where.tags });
    if (where.search)
      query.andWhere('product.title ILIKE :search', {
        search: `%${where.search}%`,
      });
    if (where.dynamicFilters) {
      for (const [key, value] of Object.entries(where.dynamicFilters)) {
        query.andWhere(`product.dynamicAttributes->>'${key}' = :${key}`, {
          [key]: value,
        });
      }
    }

    query.orderBy(`product.${sortBy}`, sortOrder);
    query.skip((page - 1) * limit).take(limit);

    const [items, total] = await query.getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({
      where: { id, isApproved: true },
      relations: ['vendor', 'category', 'brand', 'images'],
    });
    if (!product) throw new NotFoundException('محصول یافت نشد');
    return product;
  }

  async update(
    id: number,
    vendorId: number,
    dto: UpdateProductDto,
    isAdmin: boolean,
  ) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['vendor'],
    });
    if (!product) throw new NotFoundException('محصول یافت نشد');
    if (!isAdmin && product.vendor.id !== vendorId)
      throw new ForbiddenException('شما اجازه ویرایش این محصول را ندارید');

    if (dto.title && dto.title !== product.title) {
      const newSlug = this.slugify(dto.title);
      const existing = await this.productRepo.findOneBy({ slug: newSlug });
      if (existing && existing.id !== id)
        throw new BadRequestException('عنوان تکراری است');
      product.slug = newSlug;
    }
    if (dto.categoryId) {
      const category = await this.categoryRepo.findOneBy({
        id: dto.categoryId,
      });
      if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');
      product.category = category;
    }
    if (dto.brandId) {
      const brand = await this.brandRepo.findOneBy({ id: dto.brandId });
      if (!brand) throw new NotFoundException('برند یافت نشد');
      product.brand = brand;
    }
    Object.assign(product, dto);
    if (!isAdmin) product.isApproved = false;
    return this.productRepo.save(product);
  }

  async remove(id: number, vendorId: number, isAdmin: boolean) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['vendor'],
    });
    if (!product) throw new NotFoundException('محصول یافت نشد');
    if (!isAdmin && product.vendor.id !== vendorId)
      throw new ForbiddenException('شما اجازه حذف این محصول را ندارید');
    await this.productRepo.remove(product);
  }

  async approve(productId: number, adminId: number) {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('محصول یافت نشد');
    product.isApproved = true;
    product.approvedAt = new Date();
    product.approvedBy = adminId;
    return this.productRepo.save(product);
  }

  private slugify(text: string): string {
    return text
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase();
  }
}

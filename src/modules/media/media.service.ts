import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage } from '../../database/entities/product-image.entity';
import { Product } from '../../database/entities/product.entity';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(ProductImage)
    private productImageRepo: Repository<ProductImage>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async uploadProductImage(productId: number, file: Express.Multer.File, isMain: boolean = false): Promise<ProductImage> {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('محصول یافت نشد');

    if (isMain) {
      await this.productImageRepo.update({ product: { id: productId } }, { isMain: false });
    }

    const imageUrl = `/uploads/products/${file.filename}`;
    const image = this.productImageRepo.create({
      url: imageUrl,
      isMain,
      product,
    });
    return this.productImageRepo.save(image);
  }

  async uploadMultipleImages(productId: number, files: Express.Multer.File[], mainIndex: number = 0): Promise<ProductImage[]> {
    const images: ProductImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const isMain = (i === mainIndex);
      const image = await this.uploadProductImage(productId, files[i], isMain);
      images.push(image);
    }
    return images;
  }

  async deleteImage(imageId: number, productId: number): Promise<void> {
    const image = await this.productImageRepo.findOne({
      where: { id: imageId, product: { id: productId } },
    });
    if (!image) throw new NotFoundException('تصویر یافت نشد');

    const filePath = join(process.cwd(), 'uploads', 'products', image.url.split('/').pop()!);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
    await this.productImageRepo.remove(image);
  }

  async setMainImage(imageId: number, productId: number): Promise<void> {
    const image = await this.productImageRepo.findOne({
      where: { id: imageId, product: { id: productId } },
    });
    if (!image) throw new NotFoundException('تصویر یافت نشد');

    await this.productImageRepo.update({ product: { id: productId } }, { isMain: false });
    image.isMain = true;
    await this.productImageRepo.save(image);
  }
}
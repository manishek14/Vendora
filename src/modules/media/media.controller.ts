import { Controller, Post, Put, Delete, Param, Body, UseInterceptors, UploadedFile, UploadedFiles, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import * as requestWithUserInterface from '../../common/interfaces/request-with-user.interface';
import { UploadFileDto } from './dto/upload-file.dto';

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload/product/:productId')
  @Roles('vendor', 'product_admin')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/products',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new Error('Only image files are allowed'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadSingle(
    @Param('productId', ParseIntPipe) productId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @Req() req: requestWithUserInterface.RequestWithUser,
  ) {
    const isAdmin = req.user.roles?.some(r => r.name === 'product_admin') ?? false;
    if (!isAdmin) {
    }
    return this.mediaService.uploadProductImage(productId, file, dto.isMain ?? false);
  }

  @Post('upload/product/:productId/multiple')
  @Roles('vendor', 'product_admin')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: './uploads/products',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new Error('Only image files are allowed'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadMultiple(
    @Param('productId', ParseIntPipe) productId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('mainIndex') mainIndex: string,
    @Req() req: requestWithUserInterface.RequestWithUser,
  ) {
    const idx = mainIndex ? parseInt(mainIndex) : 0;
    return this.mediaService.uploadMultipleImages(productId, files, idx);
  }

  @Put('image/:id/set-main')
  @Roles('vendor', 'product_admin')
  async setMain(
    @Param('id', ParseIntPipe) id: number,
    @Body('productId', ParseIntPipe) productId: number,
  ) {
    await this.mediaService.setMainImage(id, productId);
    return { message: 'تصویر اصلی تنظیم شد' };
  }

  @Delete('image/:id')
  @Roles('vendor', 'product_admin')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Body('productId', ParseIntPipe) productId: number,
  ) {
    await this.mediaService.deleteImage(id, productId);
    return { message: 'تصویر حذف شد' };
  }
}
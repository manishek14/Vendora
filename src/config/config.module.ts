import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { validationSchema } from './validation';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true, 
      load: [configuration],
      validationSchema,
      envFilePath: ['.env'], 
      cache: true, 
      expandVariables: true, 
    }),
  ],
  exports: [NestConfigModule], 
})
export class ConfigModule {}
import { Module } from '@nestjs/common';
import { S3Service } from './service/s3.service';
import { JwtModule } from '@nestjs/jwt';
import { ApiConfig } from './config/config';

@Module({
  imports: [
    JwtModule.register({
      secret: ApiConfig.APP_SECRET_KEY,
      signOptions: { expiresIn: '1m' },
    }),
  ],
  providers: [S3Service],
  exports: [S3Service, JwtModule],
})
export class CommonModule {}

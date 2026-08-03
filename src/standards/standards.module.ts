import { Module } from '@nestjs/common';
import { StandardsService } from './standards.service';

@Module({
  providers: [StandardsService],
  exports: [StandardsService],
})
export class StandardsModule {}

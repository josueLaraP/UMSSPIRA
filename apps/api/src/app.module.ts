import { Module } from '@nestjs/common';
import { RegistrationsModule } from './modules/registrations/registrations.module';

@Module({
  imports: [RegistrationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
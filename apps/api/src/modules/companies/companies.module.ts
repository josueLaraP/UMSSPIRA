import { Module } from '@nestjs/common';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';

import { companiesProviders } from './infrastructure/providers/companies.providers';

import { GetCompanyHeaderController } from './http/controllers/get-company-header.controller';

import { GetCompanyContactController } from './http/controllers/get-company-contact.controller';

import { UpdateCompanyProfileController } from './http/controllers/update-company-profile.controller';

// HU-03: Gestión de usuarios
import { CompanyUsersController } from './company-users.controller';
import { CompanyUsersService } from './company-users.service';

@Module({
  imports: [PrismaModule],

  controllers: [
    // Controladores existentes
    GetCompanyHeaderController,
    GetCompanyContactController,
    UpdateCompanyProfileController,

    // HU-03
    CompanyUsersController,
  ],

  providers: [
    ...companiesProviders,
    CompanyUsersService,
  ],
})
export class CompaniesModule {}
import { Test, TestingModule } from '@nestjs/testing';
import { VacantesController } from './vacantes.controller';

describe('VacantesController', () => {
  let controller: VacantesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VacantesController],
    }).compile();

    controller = module.get<VacantesController>(VacantesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

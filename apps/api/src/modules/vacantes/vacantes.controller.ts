import { Controller, Get, Patch, Param, Req } from '@nestjs/common';
import { VacantesService } from './vacantes.service';

@Controller('vacantes')
export class VacantesController {
  constructor(private readonly vacantesService: VacantesService) {}

  @Get('mis-vacantes')
  async listar(@Req() req: any) {
    const idUsuario = req.user?.id || req.user?.sub; 
    return this.vacantesService.obtenerMisVacantes(idUsuario);
  }

  @Patch(':id/cerrar')
  async cerrar(@Param('id') id: string) {
    return this.vacantesService.cerrarVacante(id);
  }
}
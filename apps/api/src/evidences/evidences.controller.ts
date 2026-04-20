import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { EvidencesService } from './evidences.service';
import { UploadEvidenceDto } from './dto/upload-evidence.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { EvidenceStage } from '@techfield/types';

@Controller('evidences')
@UseGuards(JwtAuthGuard)
export class EvidencesController {
  constructor(private readonly evidencesService: EvidencesService) {}

  /**
   * Upload an evidence photo with geotag.
   * Accepts multipart/form-data with fields: file, workOrderId, stage, latitude?, longitude?, takenAt?
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadEvidenceDto,
  ) {
    if (!file) throw new BadRequestException('Se requiere una imagen');

    return this.evidencesService.upload(
      user.id,
      dto.workOrderId,
      dto.stage as EvidenceStage,
      file,
      dto.latitude,
      dto.longitude,
      dto.takenAt,
    );
  }

  @Delete(':id')
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.evidencesService.delete(id, user.id);
  }
}

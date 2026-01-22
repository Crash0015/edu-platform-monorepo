import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MaterialsService } from '../../application/materials/materials.service';
import {
  CreateMaterialRequestDto,
  MaterialResponseDto,
  MaterialsQueryDto,
  UpdateMaterialRequestDto,
} from './dto/material.dto';

type RequestWithUser = {
  headers: Record<string, string | string[] | undefined>;
  user?: { sub?: string; roles?: string[] };
};

const getHeaderValue = (header: string | string[] | undefined): string | undefined => {
  if (!header) {
    return undefined;
  }
  if (Array.isArray(header)) {
    return header[0];
  }
  return header;
};

@ApiTags('materials')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private createContext(request: RequestWithUser): {
    correlationId: string;
    actorUserId: string | null;
    actorRoles: string[];
  } {
    const correlationId =
      getHeaderValue(request.headers['x-correlation-id']) || this.generateUUID();
    const actorUserId = request.user?.sub || getHeaderValue(request.headers['x-user-id']) || null;
    const rolesHeader = getHeaderValue(request.headers['x-user-roles']);
    const actorRoles = request.user?.roles || (rolesHeader ? rolesHeader.split(',') : []);

    return { correlationId, actorUserId, actorRoles };
  }

  @Post()
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create material (Teacher/Admin only)' })
  @ApiCreatedResponse({ type: MaterialResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  async createMaterial(
    @Body() body: CreateMaterialRequestDto,
    @Req() request: RequestWithUser,
  ): Promise<MaterialResponseDto> {
    const context = this.createContext(request);
    return this.materialsService.createMaterial(
      {
        title: body.title,
        description: body.description,
        courseId: body.courseId,
        type: body.type,
        resourceUrl: body.resourceUrl,
        thumbnailUrl: body.thumbnailUrl,
        durationMinutes: body.durationMinutes,
      },
      context,
    ) as Promise<MaterialResponseDto>;
  }

  @Get()
  @ApiOperation({ summary: 'List materials' })
  @ApiOkResponse({ type: [MaterialResponseDto] })
  async listMaterials(@Query() query: MaterialsQueryDto): Promise<MaterialResponseDto[]> {
    return this.materialsService.listMaterials(query) as Promise<MaterialResponseDto[]>;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get material by ID' })
  @ApiOkResponse({ type: MaterialResponseDto })
  @ApiNotFoundResponse({ description: 'Material not found' })
  async getMaterial(@Param('id') id: string): Promise<MaterialResponseDto> {
    return this.materialsService.getMaterial(id) as Promise<MaterialResponseDto>;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update material (Teacher/Admin only)' })
  @ApiOkResponse({ type: MaterialResponseDto })
  @ApiNotFoundResponse({ description: 'Material not found' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  async updateMaterial(
    @Param('id') id: string,
    @Body() body: UpdateMaterialRequestDto,
    @Req() request: RequestWithUser,
  ): Promise<MaterialResponseDto> {
    const context = this.createContext(request);
    return this.materialsService.updateMaterial(id, body, context) as Promise<MaterialResponseDto>;
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete material (Teacher/Admin only)' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  async deleteMaterial(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ): Promise<void> {
    const context = this.createContext(request);
    await this.materialsService.deleteMaterial(id, context);
  }

  @Post(':id/publish')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish material (Teacher/Admin only)' })
  @ApiOkResponse({ type: MaterialResponseDto })
  @ApiNotFoundResponse({ description: 'Material not found' })
  @ApiBadRequestResponse({ description: 'Material could not be published' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  async publishMaterial(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ): Promise<MaterialResponseDto> {
    const context = this.createContext(request);
    return this.materialsService.publishMaterial(id, context) as Promise<MaterialResponseDto>;
  }

  @Post('uploads')
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload material asset (Teacher/Admin only)' })
  @ApiUnauthorizedResponse({ description: 'Teacher or Admin role required' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAsset(@UploadedFile() file: Express.Multer.File, @Req() request: RequestWithUser) {
    const context = this.createContext(request);
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.materialsService.uploadAsset(
      {
        buffer: file.buffer,
        filename: file.originalname,
        mimetype: file.mimetype,
      },
      context,
    );
  }
}

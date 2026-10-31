import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto, PayWithMoMoDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Finances & Frais (Payments & APEE)')
@Controller('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Émettre un avis de paiement [ADMIN uniquement]' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Historique global des paiements [ADMIN uniquement]' })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'] })
  findAll(
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
  ) {
    return this.paymentsService.findAll({ studentId, status });
  }

  @Get('due/:studentId')
  @ApiOperation({ summary: 'Montant total restant dû pour un élève (arriérés de scolarité/APEE)' })
  getTotalDue(@Param('studentId') studentId: string) {
    return this.paymentsService.getTotalDue(studentId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Historique des paiements d’un élève' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.paymentsService.findAll({ studentId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d’un paiement' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post(':id/momo')
  @Roles('ADMIN', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Régler un paiement par MTN Mobile Money ou Orange Money' })
  payWithMoMo(@Param('id') id: string, @Body() dto: PayWithMoMoDto) {
    return this.paymentsService.payWithMobileMoney(id, dto);
  }

  @Get(':id/receipt')
  @ApiOperation({ summary: 'Télécharger / générer le reçu officiel de versement de frais' })
  getReceipt(@Param('id') id: string) {
    return this.paymentsService.getReceipt(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Mettre à jour le statut d’un paiement [ADMIN uniquement]' })
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Annuler un paiement [ADMIN uniquement]' })
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}

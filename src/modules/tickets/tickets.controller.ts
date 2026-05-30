import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import * as requestWithUserInterface from '../../common/interfaces/request-with-user.interface';

@ApiTags('tickets')
@ApiBearerAuth()
@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(
    @Req() req: requestWithUserInterface.RequestWithUser,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    return this.ticketsService.create(req.user.id, createTicketDto);
  }

  @Get()
  findAll(@Req() req: requestWithUserInterface.RequestWithUser) {
    const isAdmin = req.user.roles?.some((r) => ['support_admin', 'super_admin'].includes(r.name)) ?? false;
    return this.ticketsService.findAll(req.user.id, isAdmin);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: requestWithUserInterface.RequestWithUser,
  ) {
    const isAdmin = req.user.roles?.some((r) => ['support_admin', 'super_admin'].includes(r.name)) ?? false;
    return this.ticketsService.findOne(+id, req.user.id, isAdmin);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: requestWithUserInterface.RequestWithUser,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    const isAdmin = req.user.roles?.some((r) => ['support_admin', 'super_admin'].includes(r.name)) ?? false;
    return this.ticketsService.update(+id, req.user.id, isAdmin, updateTicketDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('support_admin', 'super_admin')
  remove(
    @Param('id') id: string,
    @Req() req: requestWithUserInterface.RequestWithUser,
  ) {
    const isAdmin = true;
    return this.ticketsService.remove(+id, req.user.id, isAdmin);
  }
}

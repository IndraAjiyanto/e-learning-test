import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Render,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CommitmentService } from './commitment.service';
import { CreateCommitmentDto } from './dto/create-commitment.dto';
import { UpdateCommitmentDto } from './dto/update-commitment.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('commitment')
@UseGuards(AuthenticatedGuard)
@Roles('super_admin')
export class CommitmentController {
  constructor(private readonly commitmentService: CommitmentService) {}

  @Post()
  async create(
    @Body() createCommitmentDto: CreateCommitmentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      createCommitmentDto.commitment_order =
        await this.commitmentService.noCommitment();
      await this.commitmentService.create(createCommitmentDto);
      req.flash('success', 'Commitment created successfully');
      res.redirect('/commitment');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to create commitment');
      res.redirect('/commitment/formCreate');
    }
  }

  @Get()
  @Render('super_admin/commitment/index')
  async findAll(@Req() req: Request) {
    const commitments = await this.commitmentService.findAll();
    return {
      user: req.user,
      commitments,
      success: req.flash('success'),
      error: req.flash('error'),
    };
  }

  @Get('formCreate')
  @Render('super_admin/commitment/create')
  formCreate(@Req() req: Request) {
    return {
      user: req.user,
      error: req.flash('error'),
    };
  }

  @Get('formEdit/:id')
  @Render('super_admin/commitment/edit')
  async formEdit(@Param('id') id: number, @Req() req: Request) {
    try {
      const commitment = await this.commitmentService.findOne(id);
      return {
        user: req.user,
        commitment,
        error: req.flash('error'),
      };
    } catch (error: any) {
      req.flash('error', error.message || 'Commitment not found');
      return { redirect: '/commitment' };
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCommitmentDto: UpdateCommitmentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.commitmentService.update(id, updateCommitmentDto);
      req.flash('success', 'Commitment updated successfully');
      res.redirect('/commitment');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to update commitment');
      res.redirect(`/commitment/formEdit/${id}`);
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.commitmentService.remove(id);
      req.flash('success', 'Commitment deleted successfully');
      res.redirect('/commitment');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to delete commitment');
      res.redirect('/commitment');
    }
  }
}

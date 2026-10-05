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
import { flashToast } from 'src/common/utils/toast.util';
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
      createCommitmentDto.commitmentOrder =
        await this.commitmentService.noCommitment();
      await this.commitmentService.create(createCommitmentDto);
      flashToast(
        req,
        'Commitment Created',
        'The commitment has been added successfully.',
      );
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
  async formEdit(@Param('id') id: string, @Req() req: Request) {
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
    @Param('id') id: string,
    @Body() updateCommitmentDto: UpdateCommitmentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.commitmentService.update(id, updateCommitmentDto);
      flashToast(
        req,
        'Commitment Updated',
        'The changes to this commitment have been saved.',
      );
      res.redirect('/commitment');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to update commitment');
      res.redirect(`/commitment/formEdit/${id}`);
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.commitmentService.remove(id);
      flashToast(
        req,
        'Commitment Deleted',
        'The commitment has been removed successfully.',
      );
      res.redirect('/commitment');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to delete commitment');
      res.redirect('/commitment');
    }
  }
}

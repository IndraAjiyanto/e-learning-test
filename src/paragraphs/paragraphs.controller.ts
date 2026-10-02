import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { ParagraphsService } from './paragraphs.service';
import { CreateParagraphsDto } from './dto/create-paragraphs.dto';
import { UpdateParagraphsDto } from './dto/update-paragraphs.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { flashToast } from 'src/common/utils/toast.util';

@UseGuards(AuthenticatedGuard)
@Controller('paragraphs')
export class ParagraphsController {
  constructor(private readonly paragraphsService: ParagraphsService) {}

  @Roles('super_admin')
  @Post()
  async create(
    @Body() createParagraphsDto: CreateParagraphsDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      createParagraphsDto.paragraphOrder =
        await this.paragraphsService.getNextOrder();
      await this.paragraphsService.create(createParagraphsDto);
      flashToast(req, 'Paragraph Created', 'The new paragraph has been added.');
      res.redirect('/paragraphs');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to create paragraph');
      res.redirect('/paragraphs');
    }
  }

  @Roles('super_admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const paragraphs = await this.paragraphsService.findAll();
    res.render('super_admin/paragraphs/index', { user: req.user, paragraphs });
  }

  @Roles('super_admin')
  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    res.render('super_admin/paragraphs/create', { user: req.user });
  }

  @Roles('super_admin')
  @Get('formEdit/:id')
  async findOne(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const paragraphs = await this.paragraphsService.findOne(id);
    res.render('super_admin/paragraphs/edit', { user: req.user, paragraphs });
  }

  @Roles('super_admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateParagraphsDto: UpdateParagraphsDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.paragraphsService.update(id, updateParagraphsDto);
      flashToast(req, 'Changes Saved', 'The paragraph has been updated.');
      res.redirect('/paragraphs');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to update paragraph');
      res.redirect('/paragraphs');
    }
  }

  @Roles('super_admin')
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.paragraphsService.remove(id);
      flashToast(
        req,
        'Paragraph Deleted',
        'The paragraph has been permanently removed.',
      );
      res.redirect('/paragraphs');
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to delete paragraph');
      res.redirect('/paragraphs');
    }
  }
}

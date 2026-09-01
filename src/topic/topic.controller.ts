import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';

@Controller('topic')
@UseGuards(AuthenticatedGuard)
@Roles('super_admin')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post()
  async create(@Res() res, @Req() req, @Body() createTopicDto: CreateTopicDto) {
    try {
      await this.topicService.create(createTopicDto);
      req.flash('success', 'Topic created successfully');
      res.redirect('/topic');
    } catch (error: any) {
      req.flash('error', 'Failed to create topic');
      res.redirect('/topic');
    }
  }

  @Get('formCreate')
  async formCreate(@Res() res, @Req() req) {
    res.render('super_admin/topic/create', { user: req.user });
  }

  @Get()
  async findAll(@Res() res, @Req() req) {
    const topic = await this.topicService.findAll();
    res.render('super_admin/topic/index', { topic, user: req.user });
  }

  @Get('formEdit/:id')
  async findOne(@Param('id') id: string, @Res() res, @Req() req) {
    const topic = await this.topicService.findOne(id);
    res.render('super_admin/topic/edit', { topic, user: req.user });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
    @Res() res,
    @Req() req,
  ) {
    try {
      await this.topicService.update(id, updateTopicDto);
      req.flash('success', 'Topic updated successfully');
      res.redirect('/topic');
    } catch (error: any) {
      req.flash('error', 'Failed to update topic');
      res.redirect('/topic');
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res, @Req() req) {
    try {
      await this.topicService.remove(id);
      req.flash('success', 'Topic removed successfully');
      res.redirect('/topic');
    } catch (error: any) {
      req.flash('error', 'Failed to remove topic');
      res.redirect('/topic');
    }
  }
}

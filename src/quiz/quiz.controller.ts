import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Roles('admin')
  @Post(':mingguId')
  async create(@Param('mingguId') mingguId:number, @Body() createQuizDto: CreateQuizDto, @Res() res:Response, @Req() req:Request) {
    try {
          createQuizDto.mingguId = mingguId;
    await this.quizService.create(createQuizDto);
    req.flash('success', 'Quiz created successfully');
    res.redirect(`/minggu/${mingguId}`);
    } catch (error) {
      console.log(error)
      req.flash('error', 'Failed to create quiz');
      res.redirect(`/minggu/${mingguId}`);
    }

  }

  @Roles('admin')
  @Get('formCreate/:mingguId')
  async formCreate(@Param('mingguId') mingguId: number, @Res() res:Response, @Req() req:Request) {
    res.render('admin/quiz/create', {mingguId, user: req.user});
  }

  @Roles('admin')
  @Get(':quizId')
  async findOne(@Param('quizId') quizId: number, @Res() res:Response, @Req() req:Request) {
    const quiz = await this.quizService.findOne(quizId);
    res.render('admin/quiz/detail', {user: req.user, quiz})
  }

  @Roles('admin')
  @Get('formEdit/:quizId')
  async formEdit(@Param('quizId') quizId:number, @Res() res:Response, @Req() req:Request){
    const quiz = await this.quizService.findOne(quizId)
    res.render('admin/quiz/edit', {user:req.user, quiz})
  }

  @Roles('admin')
  @Patch(':quizId')
  async update(@Param('quizId') quizId: number, @Body() updateQuizDto: UpdateQuizDto, @Res() res:Response, @Req() req:Request) {
    try {
      await this.quizService.update(quizId, updateQuizDto)
          req.flash('success', 'Quiz updated successfully');
    res.redirect(`/quiz/${quizId}`);
    } catch (error) {
                req.flash('error', 'Quiz failed to updated ');
    res.redirect(`/quiz/${quizId}`);
    }
  }

  @Roles('admin')
  @Delete(':quizId/:mingguId')
  async remove(@Param('mingguId') mingguId:number ,@Param('quizId') quizId: number, @Res() res:Response, @Req() req:Request) {
    try {
    await this.quizService.remove(quizId);
                req.flash('success', 'Quiz deleted successfully');
    res.redirect(`/minggu/${mingguId}`);
    } catch (error) {
                      req.flash('error', 'Quiz Failed to deleted');
    res.redirect(`/minggu/${mingguId}`);
    }
  }
}

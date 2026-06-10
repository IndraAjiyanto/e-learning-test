import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async sendContact(
    @Body(ValidationPipe) contactDto: ContactDto,
    @Res() res: Response,
  ) {
    try {
      await this.contactService.sendContactEmail(contactDto);
      res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again.',
      });
    }
  }
}

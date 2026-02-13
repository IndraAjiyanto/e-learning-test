import { Injectable } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic } from 'src/entities/topic.entity';

@Injectable()
export class TopicService {
    constructor(
      @InjectRepository(Topic)
      private topicRepository: Repository<Topic>,
    ) {}
    
  async create(createTopicDto: CreateTopicDto) {
    const topic = this.topicRepository.create(createTopicDto);
    return await this.topicRepository.save(topic);
  }

  async findAll() {
    return await this.topicRepository.find();
  }

  async findOne(id: number) {
    return await this.topicRepository.findOneBy({ id });
  }

  async update(id: number, updateTopicDto: UpdateTopicDto) {
    await this.topicRepository.update(id, updateTopicDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return await this.topicRepository.delete(id);
  }
}

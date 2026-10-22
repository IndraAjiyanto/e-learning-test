import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSyllabusDto } from './dto/create-syllabus.dto';
import { UpdateSyllabusDto } from './dto/update-syllabus.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Syllabus } from 'src/entities/syllabus.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { SyllabusProgress } from 'src/entities/syllabus_progress.entity';
import { UserCourse } from 'src/entities/user_course.entity';
import { Quiz } from 'src/entities/quiz.entity';
import { Score } from 'src/entities/score.entity';
import { Material } from 'src/entities/materials.entity';

@Injectable()
export class SyllabusService {
  constructor(
    @InjectRepository(Syllabus)
    private readonly syllabusRepository: Repository<Syllabus>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(SyllabusProgress)
    private readonly syllabusProgressRepository: Repository<SyllabusProgress>,

    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,

    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,

    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,

    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
  ) {}

  async findCourseSyllabus(courseId: string): Promise<number> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { course: { id: courseId } },
      order: { syllabusNumber: 'DESC' },
    });
    if (!syllabus) {
      return 0;
    }
    return syllabus.syllabusNumber;
  }

  async getSyllabusNumber(courseId: string): Promise<number> {
    const lastNumber = await this.findCourseSyllabus(courseId);
    return lastNumber + 1;
  }

  async create(createSyllabusDto: CreateSyllabusDto, courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const syllabusNumber =
      createSyllabusDto.syllabusNumber ??
      (await this.getSyllabusNumber(courseId));

    const hasFinal = await this.syllabusRepository.findOne({
      where: { course: { id: courseId }, isFinal: true },
    });
    if (hasFinal) {
      throw new BadRequestException(
        'Syllabus for this program is already finalized, cannot add a new syllabus',
      );
    }

    if (syllabusNumber > 1) {
      const previousSyllabus = await this.syllabusRepository.findOne({
        where: { course: { id: courseId }, syllabusNumber: syllabusNumber - 1 },
      });
      if (previousSyllabus && previousSyllabus.isFinal) {
        throw new BadRequestException(
          'Previous syllabus is already finalized, cannot add a new syllabus',
        );
      }
    }

    let parsedContent: object | string | null = null;
    if (
      typeof createSyllabusDto.content === 'string' &&
      createSyllabusDto.content.trim()
    ) {
      const trimmed = createSyllabusDto.content.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          parsedContent = JSON.parse(trimmed) as object;
        } catch {
          parsedContent = trimmed;
        }
      } else {
        parsedContent = trimmed;
      }
    } else if (
      createSyllabusDto.content &&
      typeof createSyllabusDto.content === 'object'
    ) {
      parsedContent = createSyllabusDto.content;
    }

    const isFinal =
      createSyllabusDto.isFinal === true ||
      String(createSyllabusDto.isFinal) === 'true';

    const data = this.syllabusRepository.create({
      title: createSyllabusDto.title,
      description: createSyllabusDto.description,
      content: (parsedContent ?? undefined) as object | undefined,
      syllabusNumber: syllabusNumber,
      isFinal: isFinal,
      course: course,
    });
    const syllabus = await this.syllabusRepository.save(data);

    // Buat SyllabusProgress untuk semua user yang enrolled di course ini
    const userCourses = await this.userCourseRepository.find({
      where: { course: { id: course.id }, progress: false },
      relations: ['user'],
    });
    if (userCourses.length > 0) {
      for (const userCourse of userCourses) {
        const existing = await this.syllabusProgressRepository.findOne({
          where: {
            syllabus: { id: syllabus.id },
            user: { id: userCourse.user.id },
          },
        });
        if (!existing) {
          await this.syllabusProgressRepository.save({
            syllabus: syllabus,
            user: userCourse.user,
            quiz: false,
            process: true,
          });
        }
      }
    }

    return syllabus;
  }

  async findByCourse(courseId: string) {
    const list = await this.syllabusRepository.find({
      where: { course: { id: courseId } },
      order: { syllabusNumber: 'ASC', createdAt: 'ASC' },
      relations: ['quiz', 'quiz.questions', 'quiz.scores'],
    });

    return list.map((syllabus) => {
      const isCompleted = (syllabus.quiz || []).some((quiz) => {
        const minScore = quiz.minScore ?? 0;
        return (quiz.scores || []).some(
          (score) => Number(score.score) >= minScore,
        );
      });
      return {
        ...syllabus,
        isCompleted,
      };
    });
  }

  async findOne(syllabusId: string) {
    return await this.syllabusRepository.findOne({
      where: { id: syllabusId },
      relations: ['course', 'quiz', 'quiz.questions', 'quiz.questions.answers'],
    });
  }

  async findQuiz(syllabusId: string) {
    return await this.quizRepository.find({
      where: { syllabus: { id: syllabusId } },
      relations: ['questions'],
    });
  }

  async findMaterialsByType(
    syllabusId: string,
    fileType: Material['fileType'],
  ) {
    return await this.materialRepository.find({
      where: { syllabus: { id: syllabusId }, fileType },
      order: { id: 'ASC' },
    });
  }

  async findDetailForUser(syllabusId: string, userId: string) {
    const syllabus = await this.syllabusRepository.findOne({
      where: { id: syllabusId },
      relations: ['course', 'quiz', 'quiz.questions', 'materials'],
    });
    if (!syllabus) {
      throw new NotFoundException('Syllabus not found');
    }

    const quiz = syllabus.quiz?.[0] || null;
    const minScore = quiz?.minScore ?? 80;
    const questionCount = quiz?.questions?.length ?? 0;

    let hasAttempt = false;
    let bestScore: number | null = null;
    if (quiz) {
      const scores = await this.scoreRepository.find({
        where: { user: { id: userId }, quiz: { id: quiz.id } },
      });
      hasAttempt = scores.length > 0;
      bestScore = hasAttempt
        ? Math.max(...scores.map((s) => Number(s.score)))
        : null;
    }
    const isPassed = quiz ? bestScore !== null && bestScore >= minScore : true;

    // Silabus berikutnya, agar quiz-card bisa menyebutkan tujuan setelah lulus.
    const siblings = await this.syllabusRepository.find({
      where: { course: { id: syllabus.course?.id } },
      order: { syllabusNumber: 'ASC', createdAt: 'ASC' },
      select: ['id', 'title'],
    });
    const idx = siblings.findIndex((s) => s.id === syllabus.id);
    const next = idx >= 0 ? siblings[idx + 1] || null : null;

    const formatBytes = (bytes?: number | string | null): string => {
      if (!bytes) return '';
      const num = Number(bytes);
      if (isNaN(num) || num <= 0) return '';
      if (num < 1024) return `${num} B`;
      if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
      return `${(num / (1024 * 1024)).toFixed(1)} MB`;
    };

    const toEmbedUrl = (url?: string | null): string => {
      if (!url) return '';
      const trimmed = url.trim();
      const ytMatch = trimmed.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/,
      );
      if (ytMatch && ytMatch[1]) {
        return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&enablejsapi=1&rel=0`;
      }
      return trimmed;
    };

    const materials = syllabus.materials || [];
    const pdfMaterials = materials
      .filter((m) => m.fileType === 'pdf')
      .map((m) => ({
        id: m.id,
        fileType: 'pdf' as const,
        title: m.title || 'Modul PDF',
        file: m.file,
        originalFileName: m.originalFileName || 'Modul.pdf',
        fileSizeBytes: m.fileSizeBytes,
        formattedSize: formatBytes(m.fileSizeBytes),
      }));

    const pptMaterials = materials
      .filter((m) => m.fileType === 'ppt')
      .map((m) => {
        const fileUrl = m.file || '';
        const isGoogleSlides = fileUrl.includes('docs.google.com/presentation');
        const embedUrl = isGoogleSlides
          ? fileUrl.replace('/pub?', '/pubembed?')
          : fileUrl;
        const isLocalFile =
          !isGoogleSlides &&
          (fileUrl.startsWith('/uploads/') || fileUrl.startsWith('/'));
        return {
          id: m.id,
          fileType: 'ppt' as const,
          title: m.title || 'Slide PPTX',
          file: fileUrl,
          embedUrl,
          isGoogleSlides,
          isLocalFile,
          originalFileName: m.originalFileName || 'Slide.pptx',
          fileSizeBytes: m.fileSizeBytes,
          formattedSize: formatBytes(m.fileSizeBytes),
          driveFileId: m.driveFileId,
        };
      });

    const videoMaterialRow = materials.find((m) => m.fileType === 'video');
    const rawVideoUrl = videoMaterialRow?.file || null;
    const videoDuration = videoMaterialRow?.durationSeconds || null;
    const videoTitle = videoMaterialRow?.title || 'Video Pembelajaran';

    const hasVideo = !!(rawVideoUrl && rawVideoUrl.trim().length > 0);
    const videoEmbedUrl = hasVideo ? toEmbedUrl(rawVideoUrl) : null;
    const isYoutube = !!(
      rawVideoUrl &&
      (rawVideoUrl.includes('youtube.com') || rawVideoUrl.includes('youtu.be'))
    );

    const videoMaterial = hasVideo
      ? {
          id: videoMaterialRow?.id,
          fileType: 'video' as const,
          title: videoMaterialRow?.title || 'Video Pembelajaran',
          file: rawVideoUrl,
          embedUrl: videoEmbedUrl,
          isYoutube,
          durationSeconds: videoDuration,
          originalFileName: videoMaterialRow?.originalFileName || '',
          formattedSize: formatBytes(videoMaterialRow?.fileSizeBytes),
        }
      : null;

    const hasPdf = pdfMaterials.length > 0;
    const hasPpt = pptMaterials.length > 0;
    const hasAnyMaterial = hasPdf || hasPpt || hasVideo;
    const firstPdf = pdfMaterials[0] || null;
    const firstPpt = pptMaterials[0] || null;

    return {
      syllabus,
      course: syllabus.course,
      quiz,
      questionCount,
      minScore,
      quizStatus: { hasAttempt, bestScore, isPassed },
      next,
      materials,
      pdfMaterials,
      pptMaterials,
      firstPdf,
      firstPpt,
      hasVideo,
      videoEmbedUrl,
      videoDuration,
      videoTitle,
      isYoutube,
      videoMaterial,
      hasPdf,
      hasPpt,
      hasAnyMaterial,
    };
  }

  async createQuiz(
    syllabusId: string,
    createQuizDto: {
      quizName?: string;
      title?: string;
      minScore?: number | string;
      duration?: number | string;
    },
  ) {
    const syllabus = await this.findOne(syllabusId);
    if (!syllabus) {
      throw new NotFoundException('Syllabus not found');
    }

    const quiz = this.quizRepository.create({
      quizName: createQuizDto.quizName || createQuizDto.title,
      minScore: Number(createQuizDto.minScore),
      duration: Number(createQuizDto.duration),
      syllabus: syllabus,
    });
    const newQuiz = await this.quizRepository.save(quiz);

    if (syllabus.course) {
      const userCourses = await this.userCourseRepository.find({
        where: { course: { id: syllabus.course.id } },
        relations: ['user'],
      });
      if (userCourses.length > 0) {
        for (const uc of userCourses) {
          const existingProgress =
            await this.syllabusProgressRepository.findOne({
              where: {
                syllabus: { id: syllabus.id },
                user: { id: uc.user.id },
              },
            });
          if (existingProgress) {
            existingProgress.quiz = false;
            await this.syllabusProgressRepository.save(existingProgress);
          }
        }
      }
    }

    return newQuiz;
  }
  async isSyllabusCompleted(syllabusId: string): Promise<boolean> {
    const quizzes = await this.quizRepository.find({
      where: { syllabus: { id: syllabusId } },
      relations: ['scores'],
    });

    for (const quiz of quizzes) {
      const minScore = quiz.minScore ?? 0;
      const hasPassingScore = quiz.scores?.some(
        (score) => Number(score.score) >= minScore,
      );
      if (hasPassingScore) {
        return true;
      }
    }

    return false;
  }

  async update(id: string, updateSyllabusDto: UpdateSyllabusDto) {
    const syllabus = await this.findOne(id);
    if (!syllabus) {
      throw new NotFoundException('Syllabus not found');
    }

    const isCompleted = await this.isSyllabusCompleted(id);
    if (isCompleted) {
      throw new BadRequestException(
        'Syllabus cannot be edited because it has already been completed by a user',
      );
    }

    let parsedContent: object | string | null = null;
    if (
      typeof updateSyllabusDto.content === 'string' &&
      updateSyllabusDto.content.trim()
    ) {
      const trimmed = updateSyllabusDto.content.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          parsedContent = JSON.parse(trimmed) as object;
        } catch {
          parsedContent = trimmed;
        }
      } else {
        parsedContent = trimmed;
      }
    } else if (
      updateSyllabusDto.content &&
      typeof updateSyllabusDto.content === 'object'
    ) {
      parsedContent = updateSyllabusDto.content;
    }

    const isFinal =
      updateSyllabusDto.isFinal !== undefined
        ? updateSyllabusDto.isFinal === true ||
          String(updateSyllabusDto.isFinal) === 'true'
        : syllabus.isFinal;

    Object.assign(syllabus, {
      ...updateSyllabusDto,
      ...(parsedContent !== null ? { content: parsedContent } : {}),
      isFinal,
    });
    const updatedSyllabus = await this.syllabusRepository.save(syllabus);

    return updatedSyllabus;
  }

  async remove(id: string) {
    const syllabus = await this.findOne(id);
    if (!syllabus) {
      throw new NotFoundException('Syllabus not found');
    }

    const isCompleted = await this.isSyllabusCompleted(id);
    if (isCompleted) {
      throw new BadRequestException(
        'Syllabus cannot be deleted because it has already been completed by a user',
      );
    }

    return await this.syllabusRepository.remove(syllabus);
  }
}

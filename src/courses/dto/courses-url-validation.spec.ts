import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCoursesDto } from './create-courses.dto';

describe('CreateCoursesDto URL validation', () => {
  it('passes when locationLink is not provided (optional)', async () => {
    const dto = plainToInstance(CreateCoursesDto, {
      name: 'Valid Program',
      locations: { id: 'Jakarta', en: 'Jakarta', ja: 'Jakarta' },
      description: { id: 'Desc ID', en: 'Desc EN', ja: 'Desc JA' },
    });
    const errors = await validate(dto, { skipMissingProperties: true });
    const locationError = errors.find((e) => e.property === 'locationLink');
    expect(locationError).toBeUndefined();
  });

  it('passes when locationLink is a valid URL', async () => {
    const dto = plainToInstance(CreateCoursesDto, {
      name: 'Valid Program',
      locationLink: 'https://maps.app.goo.gl/xyz',
    });
    const errors = await validate(dto, { skipMissingProperties: true });
    const locationError = errors.find((e) => e.property === 'locationLink');
    expect(locationError).toBeUndefined();
  });

  it('fails when locationLink is not a valid URL format', async () => {
    const dto = plainToInstance(CreateCoursesDto, {
      name: 'Invalid Program',
      locationLink: 'not-a-url',
    });
    const errors = await validate(dto, { skipMissingProperties: true });
    const locationError = errors.find((e) => e.property === 'locationLink');
    expect(locationError).toBeDefined();
    expect(locationError?.constraints?.isUrl).toBeDefined();
  });
});

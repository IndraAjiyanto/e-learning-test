import { capabilitiesFor, capabilitiesForCourse } from './program-type';

describe('program-type capabilities', () => {
  describe('capabilitiesFor', () => {
    it('returns correct capabilities for non_bootcamp (finalAssignment: false)', () => {
      const caps = capabilitiesFor('non_bootcamp');
      expect(caps).toEqual({
        structure: 'syllabus',
        unlockUnit: 'session',
        logbookConfigurable: true,
        quizScope: 'program',
        unitLabel: 'syllabus',
        pacing: 'self_paced',
        mentorship: 'none',
        finalAssignment: false,
      });
    });

    it('returns correct capabilities for bootcamp (finalAssignment: true)', () => {
      const caps = capabilitiesFor('bootcamp');
      expect(caps.structure).toBe('weeks');
      expect(caps.finalAssignment).toBe(true);
    });

    it('returns correct capabilities for lpk (finalAssignment: false)', () => {
      const caps = capabilitiesFor('lpk');
      expect(caps.structure).toBe('weeks');
      expect(caps.finalAssignment).toBe(false);
      expect(caps.mentorship).toBe('sensei');
    });

    it('defaults to bootcamp capabilities when type is undefined or null', () => {
      const capsUndefined = capabilitiesFor(undefined);
      expect(capsUndefined.finalAssignment).toBe(true);
      expect(capsUndefined.structure).toBe('weeks');

      const capsNull = capabilitiesFor(null);
      expect(capsNull.finalAssignment).toBe(true);
      expect(capsNull.structure).toBe('weeks');
    });
  });

  describe('capabilitiesForCourse', () => {
    it('evaluates finalAssignment: false for non_bootcamp course', () => {
      const course = {
        programType: 'non_bootcamp' as const,
        logbookRequired: true,
      };
      const caps = capabilitiesForCourse(course);
      expect(caps.finalAssignment).toBe(false);
      expect(caps.structure).toBe('syllabus');
      expect(caps.logbookEnabled).toBe(true);
    });

    it('evaluates finalAssignment: true for bootcamp course', () => {
      const course = {
        programType: 'bootcamp' as const,
        logbookRequired: true,
      };
      const caps = capabilitiesForCourse(course);
      expect(caps.finalAssignment).toBe(true);
      expect(caps.structure).toBe('weeks');
      expect(caps.logbookEnabled).toBe(true);
    });

    it('evaluates finalAssignment: false for lpk course', () => {
      const course = {
        programType: 'lpk' as const,
        logbookRequired: true,
      };
      const caps = capabilitiesForCourse(course);
      expect(caps.finalAssignment).toBe(false);
      expect(caps.structure).toBe('weeks');
    });
  });
});

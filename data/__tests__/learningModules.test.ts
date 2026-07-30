import { LEARNING_MODULES, LEARNING_MODULE_IDS } from '../learningModules';
import { QUIZ_QUESTIONS } from '../quizQuestions';
import { DOMAIN_INFO } from '../../types';

describe('LEARNING_MODULES data integrity', () => {
  it('has a LEARNING_MODULES entry for every id in LEARNING_MODULE_IDS', () => {
    for (const id of LEARNING_MODULE_IDS) {
      expect(LEARNING_MODULES[id]).toBeDefined();
      expect(LEARNING_MODULES[id].id).toBe(id);
    }
  });

  it('has a domain that exists in DOMAIN_INFO, matching the boss battle domain', () => {
    for (const id of LEARNING_MODULE_IDS) {
      const module = LEARNING_MODULES[id];
      expect(Object.keys(DOMAIN_INFO)).toContain(module.domain);
      expect(module.bossBattle.domain).toBe(module.domain);
    }
  });

  it('has at least one lesson with unique lesson ids', () => {
    for (const id of LEARNING_MODULE_IDS) {
      const module = LEARNING_MODULES[id];
      expect(module.lessons.length).toBeGreaterThan(0);
      const lessonIds = module.lessons.map(l => l.id);
      expect(new Set(lessonIds).size).toBe(lessonIds.length);
    }
  });

  it('has at least one non-empty section per lesson', () => {
    for (const id of LEARNING_MODULE_IDS) {
      for (const lesson of LEARNING_MODULES[id].lessons) {
        expect(lesson.sections.length).toBeGreaterThan(0);
        for (const section of lesson.sections) {
          expect(section.heading.trim().length).toBeGreaterThan(0);
          expect(section.body.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('has checkpointQuestionIds that reference real questions in the module\'s own domain', () => {
    for (const id of LEARNING_MODULE_IDS) {
      const module = LEARNING_MODULES[id];
      for (const lesson of module.lessons) {
        for (const questionId of lesson.checkpointQuestionIds ?? []) {
          const question = QUIZ_QUESTIONS.find(q => q.id === questionId);
          expect(question).toBeDefined();
          expect(question?.domain).toBe(module.domain);
        }
      }
    }
  });

  it('has a boss battle question count within the number of available questions for its domain', () => {
    for (const id of LEARNING_MODULE_IDS) {
      const module = LEARNING_MODULES[id];
      const available = QUIZ_QUESTIONS.filter(q => q.domain === module.domain).length;
      expect(module.bossBattle.questionCount).toBeGreaterThan(0);
      expect(module.bossBattle.questionCount).toBeLessThanOrEqual(available);
    }
  });

  it('has a boss battle pass threshold between 0 and 100', () => {
    for (const id of LEARNING_MODULE_IDS) {
      const { passThreshold } = LEARNING_MODULES[id].bossBattle;
      expect(passThreshold).toBeGreaterThan(0);
      expect(passThreshold).toBeLessThanOrEqual(100);
    }
  });
});

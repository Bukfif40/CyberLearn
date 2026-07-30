import { QUIZ_QUESTIONS } from '../quizQuestions';
import { DOMAIN_INFO } from '../../types';

describe('QUIZ_QUESTIONS data integrity', () => {
  it('is non-empty', () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThan(0);
  });

  it('has unique ids', () => {
    const ids = QUIZ_QUESTIONS.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has a correctAnswer index within the bounds of its options', () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswer).toBeLessThan(q.options.length);
    }
  });

  it('has at least two non-empty, unique options per question', () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      for (const opt of q.options) {
        expect(opt.trim().length).toBeGreaterThan(0);
      }
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it('has non-empty question text and explanation', () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.question.trim().length).toBeGreaterThan(0);
      expect(q.explanation.trim().length).toBeGreaterThan(0);
    }
  });

  it('has a difficulty of easy, medium, or hard', () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(['easy', 'medium', 'hard']).toContain(q.difficulty);
    }
  });

  it('has a domain that exists in DOMAIN_INFO', () => {
    const validDomains = Object.keys(DOMAIN_INFO);
    for (const q of QUIZ_QUESTIONS) {
      expect(validDomains).toContain(q.domain);
    }
  });

  it('has at least one question for every domain', () => {
    const domains = Object.keys(DOMAIN_INFO);
    for (const domain of domains) {
      const count = QUIZ_QUESTIONS.filter(q => q.domain === domain).length;
      expect(count).toBeGreaterThan(0);
    }
  });
});

describe('DOMAIN_INFO data integrity', () => {
  it('has weights that sum to 100', () => {
    const total = Object.values(DOMAIN_INFO).reduce((sum, info) => sum + info.weight, 0);
    expect(total).toBe(100);
  });

  it('has a positive weight for every domain', () => {
    for (const info of Object.values(DOMAIN_INFO)) {
      expect(info.weight).toBeGreaterThan(0);
    }
  });
});

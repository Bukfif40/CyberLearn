import { STUDY_RESOURCES, FREE_STUDY_RESOURCES, PAID_STUDY_RESOURCES } from '../studyResources';
import { DOMAIN_INFO } from '../../types';

describe('STUDY_RESOURCES data integrity', () => {
  it('is non-empty and combines the free and paid lists', () => {
    expect(STUDY_RESOURCES.length).toBe(FREE_STUDY_RESOURCES.length + PAID_STUDY_RESOURCES.length);
  });

  it('has unique ids', () => {
    const ids = STUDY_RESOURCES.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has a domain that is either "all" or a valid SecurityDomain', () => {
    const validDomains = new Set([...Object.keys(DOMAIN_INFO), 'all']);
    for (const r of STUDY_RESOURCES) {
      expect(validDomains.has(r.domain)).toBe(true);
    }
  });

  it('has a well-formed https url', () => {
    for (const r of STUDY_RESOURCES) {
      expect(r.url).toMatch(/^https:\/\//);
    }
  });

  it('has non-empty title and description', () => {
    for (const r of STUDY_RESOURCES) {
      expect(r.title.trim().length).toBeGreaterThan(0);
      expect(r.description.trim().length).toBeGreaterThan(0);
    }
  });

  it('marks the free flag consistently with which list the resource came from', () => {
    for (const r of FREE_STUDY_RESOURCES) {
      expect(r.free).toBe(true);
    }
    for (const r of PAID_STUDY_RESOURCES) {
      expect(r.free).toBe(false);
    }
  });
});

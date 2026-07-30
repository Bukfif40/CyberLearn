import { StudyResource } from '../types';

// Free & Open — no cost, no account required.
export const FREE_STUDY_RESOURCES: StudyResource[] = [
  {
    id: 'professor_messer_course',
    title: 'Professor Messer Security+ SY0-701 Video Course',
    type: 'video',
    domain: 'all',
    url: 'https://www.professormesser.com/sy0-701/',
    description: 'Comprehensive video course covering all Security+ exam topics. High-quality educational content.',
    free: true,
  },
  {
    id: 'professor_messer_practice',
    title: 'Professor Messer Security+ Practice Exams',
    type: 'practice_exam',
    domain: 'all',
    url: 'https://www.professormesser.com/security-plus/sy0-701/sy0-701-practice-exams/',
    description: 'Full-length practice exams to assess exam readiness and identify weak areas.',
    free: true,
  },
  {
    id: 'nist_cybersecurity',
    title: 'NIST Cybersecurity Framework',
    type: 'reading',
    domain: 'general_security_concepts',
    url: 'https://www.nist.gov/cyberframework',
    description: 'NIST framework for managing cybersecurity risks. Essential reference for Security+ concepts.',
    free: true,
  },
  {
    id: 'owasp_top_10',
    title: 'OWASP Top 10 Web Application Security Risks',
    type: 'reading',
    domain: 'threats_vulnerabilities_mitigations',
    url: 'https://owasp.org/www-project-top-ten/',
    description: 'Overview of the most critical web application security risks and mitigations.',
    free: true,
  },
  {
    id: 'mitre_attack',
    title: 'MITRE ATT&CK Framework',
    type: 'reading',
    domain: 'security_operations',
    url: 'https://attack.mitre.org/',
    description: 'Global knowledge base of adversary tactics and techniques based on real-world observations.',
    free: true,
  },
  {
    id: 'res_007',
    title: 'Cybrary Security+ (Free Tier)',
    type: 'video',
    domain: 'all',
    url: 'https://www.cybrary.it/course/comptia-security-plus',
    description: 'Free-tier video content covering Security+ topics — solid supplementary material alongside Professor Messer.',
    free: true,
  },
  {
    id: 'res_008',
    title: 'roadmap.sh — Cyber Security Expert Path',
    type: 'reading',
    domain: 'all',
    url: 'https://roadmap.sh/cyber-security',
    description: 'A free, community-maintained roadmap covering the broader field beyond Security+ — useful once you\'re ready to look past the exam toward SOC analyst, blue team, and specialist paths.',
    free: true,
  },
];

// The Armory — paid resources, clearly tagged, link only (no reproduced content).
export const PAID_STUDY_RESOURCES: StudyResource[] = [
  {
    id: 'gibson_get_certified_get_ahead',
    title: 'Security+ Get Certified Get Ahead (Darril Gibson)',
    type: 'guide',
    domain: 'all',
    url: 'https://www.getcertifiedgetahead.com/',
    description:
      'Widely recommended SY0-701 study guide by Darril Gibson, with practice questions and plain-language explanations for every domain.',
    free: false,
  },
];

// Combined list, kept for any code that still wants "all resources" in one array.
export const STUDY_RESOURCES: StudyResource[] = [...FREE_STUDY_RESOURCES, ...PAID_STUDY_RESOURCES];

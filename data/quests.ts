import { Quest } from '../types/game';

export const QUESTS: Quest[] = [
  {
    id: 'investigate-phishing',
    title: 'Something in the Wire',
    giverNpcId: 'kessler',
    description: 'Kessler wants you to check out a flagged terminal in Fringeport before it becomes a real problem.',
    objectives: [
      {
        id: 'clear-phishing-terminal',
        description: 'Investigate the suspicious email alert',
        encounterId: 'phishing-terminal',
      },
    ],
    creditReward: 25,
  },
];

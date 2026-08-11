import { Item } from '../types/game';

export const ITEMS: Item[] = [
  {
    id: 'analyst-toolkit',
    name: "Analyst's Toolkit",
    description: 'A battered but reliable diagnostic rig. Mostly for show — but every real analyst has one.',
    price: 30,
    badgeLabel: 'T',
    badgeColor: '#6C5CE7',
  },
  {
    id: 'lattice-badge',
    name: 'Lattice Access Badge',
    description: "Mira's black-market badge replica. Doesn't open anything official, but it looks the part.",
    price: 20,
    badgeLabel: 'B',
    badgeColor: '#F59E0B',
  },
  {
    id: 'signal-jammer',
    name: 'Pocket Signal Jammer',
    description: 'Cuts local Lattice chatter for a few seconds. Mira swears it once saved her life. Probably an exaggeration.',
    price: 55,
    badgeLabel: 'J',
    badgeColor: '#EF4444',
  },
];

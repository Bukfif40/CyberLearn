import { RoomMap, TileType } from '../types/game';

const WIDTH = 10;
const HEIGHT = 8;
const ROAD_Y = 6;
const ROAD_X_START = 2;
const ROAD_X_END = 7;

const buildTiles = (): TileType[][] => {
  const tiles: TileType[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: TileType[] = [];
    for (let x = 0; x < WIDTH; x++) {
      const isBorder = x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1;
      const isRoad = y === ROAD_Y && x >= ROAD_X_START && x <= ROAD_X_END;
      row.push(isBorder ? 'wall' : isRoad ? 'road' : 'floor');
    }
    tiles.push(row);
  }
  return tiles;
};

export const STARTER_ROOM: RoomMap = {
  id: 'fringeport-docks',
  name: 'Fringeport Docks',
  width: WIDTH,
  height: HEIGHT,
  tiles: buildTiles(),
  playerStart: { x: 1, y: 1 },
  npcs: [
    {
      id: 'kessler',
      name: 'Kessler',
      role: 'mentor',
      badgeLabel: 'K',
      badgeColor: '#F59E0B',
      emoji: '🧑‍💻',
      position: { x: 5, y: 3 },
      movement: { type: 'patrol', path: [{ x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }] },
      lines: [
        "You're the one who kept asking about the blackout. Good — that means you're paying attention.",
        "I used to defend the Lattice for a living. Now I do it off the books, because the city stopped reporting what really happens down here.",
        "Fringeport is where every scam in Meridian washes ashore first. There's a terminal in the corner flagging something. Go look — walk into it.",
      ],
      givesQuestId: 'investigate-phishing',
    },
    {
      id: 'vendor_mira',
      name: 'Mira',
      role: 'vendor',
      badgeLabel: '$',
      badgeColor: '#10B981',
      emoji: '🧑‍🔧',
      position: { x: 2, y: 5 },
      movement: { type: 'static' },
      lines: [],
    },
  ],
  vehicles: [
    {
      id: 'cargo-hauler',
      badgeLabel: '▮',
      badgeColor: '#9298A8',
      // Every intermediate tile, not just the endpoints — the patrol stepper
      // advances one path index per tick, so skipping tiles here would make
      // the vehicle teleport across the road instead of driving across it.
      path: Array.from({ length: ROAD_X_END - ROAD_X_START + 1 }, (_, i) => ({
        x: ROAD_X_START + i,
        y: ROAD_Y,
      })),
    },
  ],
  encounters: [
    {
      id: 'phishing-terminal',
      name: 'Suspicious Email Alert',
      emoji: '💻',
      position: { x: 7, y: 5 },
      intro:
        'The terminal flashes red. An email just landed in the district comptroller\'s inbox: "URGENT: Wire transfer approval needed within 1 hour — click here to review."',
      creditReward: 40,
      questions: [
        {
          prompt: 'What should you check first?',
          options: [
            "Click the link to see what it wants",
            "The sender's actual email address, not just the display name",
            'Forward it to the whole district as a warning',
            'Ignore it, urgent emails are usually fine',
          ],
          correctIndex: 1,
          correctFeedback:
            "Correct. Attackers spoof the display name constantly — the real sending address (and headers) is what actually tells you if it's legit.",
          incorrectFeedback:
            "Not quite. Never click first — the sender's real address is the first thing to verify.",
        },
        {
          prompt: 'The sender address is "comptroller@fringeport-finance.co" instead of "comptroller@fringeport.gov". What is this?',
          options: [
            'A normal IT migration',
            'A typosquatted / lookalike domain — a classic phishing sign',
            'Proof the email is safe',
            'A DNS error on your end',
          ],
          correctIndex: 1,
          correctFeedback:
            'Exactly — a lookalike domain designed to slip past a quick glance. That, plus urgency and a money request, is textbook Business Email Compromise.',
          incorrectFeedback:
            "That's the tell of a lookalike/typosquatted domain — a very common phishing pattern, not a coincidence.",
        },
      ],
    },
  ],
};

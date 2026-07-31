import { RoomMap, TileType } from '../types/game';

const WIDTH = 10;
const HEIGHT = 8;

const buildTiles = (): TileType[][] => {
  const tiles: TileType[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: TileType[] = [];
    for (let x = 0; x < WIDTH; x++) {
      const isBorder = x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1;
      row.push(isBorder ? 'wall' : 'floor');
    }
    tiles.push(row);
  }
  return tiles;
};

export const STARTER_ROOM: RoomMap = {
  id: 'soc-lobby',
  name: 'SOC Training Lobby',
  width: WIDTH,
  height: HEIGHT,
  tiles: buildTiles(),
  playerStart: { x: 1, y: 1 },
  npcs: [
    {
      id: 'mentor',
      name: 'Analyst Rivera',
      emoji: '🧑‍💻',
      position: { x: 5, y: 3 },
      lines: [
        "Welcome to the SOC floor, recruit.",
        "Every day we get alerts — most are noise, some are real. Your job is telling the difference.",
        "There's a terminal in the corner flagging a suspicious email. Go take a look — walk into it.",
      ],
    },
  ],
  encounters: [
    {
      id: 'phishing-terminal',
      name: 'Suspicious Email Alert',
      emoji: '💻',
      position: { x: 7, y: 5 },
      intro:
        'The terminal flashes red. An email just landed in the CFO\'s inbox: "URGENT: Wire transfer approval needed within 1 hour — click here to review."',
      questions: [
        {
          prompt: 'What should you check first?',
          options: [
            "Click the link to see what it wants",
            "The sender's actual email address, not just the display name",
            'Forward it to the whole company as a warning',
            'Ignore it, urgent emails are usually fine',
          ],
          correctIndex: 1,
          correctFeedback:
            "Correct. Attackers spoof the display name constantly — the real sending address (and headers) is what actually tells you if it's legit.",
          incorrectFeedback:
            "Not quite. Never click first — the sender's real address is the first thing to verify.",
        },
        {
          prompt: 'The sender address is "ceo@company-finance.co" instead of "ceo@company.com". What is this?',
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

const COMBAT = [
  [
    "Barbarous",
    "Bloody",
    "Brutal",
    "Crushing",
    "Deadly",
    "Fierce",
    "Gutting",
    "Merciless",
    "Ravenous",
    "Relentless",
    "Ruthless",
    "Pitiless",
    "Savage",
    "Vicious",
    "Violent",
  ],
  [
    "Ambush",
    "Assault",
    "Attack",
    "Battle",
    "Blitz",
    "Brawl",
    "Charge",
    "Encounter",
    "Fight",
    "Melee",
    "Raid",
    "Rendezvous",
    "Snare",
    "Strike",
    "Surprise",
  ],
];

export function getNameForCombat() {
  return getRandomWords(COMBAT);
}

const START = [
  [
    "Adventurer's",
    "Dark",
    "Doomed",
    "Dour",
    "Gloomy",
    "Perilous",
    "Sinister",
    "Terrible",
  ],
  [
    "Approach",
    "Arrival",
    "Beginning",
    "Birth",
    "Descent",
    "Greeting",
    "Opening",
    "Start",
  ],
];

export function getNameForStart() {
  return getRandomWords(START);
}

function getRandomWords(list) {
  return list
    .map((words) => words[Math.floor(Math.random() * words.length)])
    .join(" ");
}

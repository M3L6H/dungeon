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

const SECRET = [
  ["Hidden", "Hushed", "Secret", "Whispering"],
  ["Alcove", "Chamber", "Corner", "Room"],
];

export function getNameForSecret() {
  return getRandomWords(SECRET);
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

const TREASURE = [
  [
    "Abundant",
    "Bountiful",
    "Copious",
    "Dazzling",
    "Glittering",
    "Plentiful",
    "Priceless",
    "Radiant",
    "Shining",
    "Twinkling",
  ],
  [
    "Cache",
    "Heap",
    "Hoard",
    "Pile",
    "Reserve",
    "Stash",
    "Stockpile",
    "Treasure",
    "Trove",
    "Wealth",
  ],
];

export function getNameForTreasure() {
  return getRandomWords(TREASURE);
}

function getRandomWords(list) {
  return list
    .map((words) => words[Math.floor(Math.random() * words.length)])
    .join(" ");
}

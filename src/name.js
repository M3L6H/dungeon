const START = [
  [
    "Adventurer's",
    "Dark",
    "Doomed",
    "Gloomy",
    "Perilous",
    "Sinister",
    "Terrible",
  ],
  ["Approach", "Beginning", "Birth", "Descent", "Greeting", "Opening", "Start"],
];

export function getNameForStart() {
  return getRandomWords(START);
}

function getRandomWords(list) {
  return list
    .map((words) => words[Math.floor(Math.random() * words.length)])
    .join(" ");
}


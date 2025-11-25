const difficultyMap = {};

function getEntitiesForDifficulty(difficulty) {
  return difficultyMap[difficulty] ?? [];
}

export function getRandomEntityForDifficultyRange(min, max) {
  const entityCreators = [];
  for (let i = Math.max(0, min); i <= max; ++i) {
    entityCreators.push(...getEntitiesForDifficulty(i));
  }
  return entityCreators[Math.floor(Math.random() * entityCreators.length)];
}

export function setDifficultyForEntityCreator(difficulty, creator) {
  const arr = getEntitiesForDifficulty(difficulty);
  arr.push(creator);
  difficultyMap[difficulty] = arr;
}

const baseXpMap = {};


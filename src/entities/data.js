const difficultyMap = {};

function getEntitiesForDifficulty(difficulty) {
  return difficultyMap[difficulty] ?? [];
}

export function getRandomEntityForDifficultyRange(min, max) {
  const entityCreators = [];
  for (let i = Math.max(0, min); i <= max; ++i) {
    entityCreators.push(
      ...getEntitiesForDifficulty(i).map((creator) => [creator, i]),
    );
  }
  return (
    entityCreators[Math.floor(Math.random() * entityCreators.length)] ?? []
  );
}

export function setDifficultyForEntityCreator(difficulty, creator) {
  const arr = getEntitiesForDifficulty(difficulty);
  arr.push(creator);
  difficultyMap[difficulty] = arr;
}

const baseXpMap = {};

export function getXpValue(entity) {
  return (baseXpMap[entity.name] ?? 1) * entity.level;
}

export function setBaseXp(name, baseXp) {
  baseXpMap[name] = baseXp;
}

export function xpRequiredForLevel(level) {
  return ((level * (level + 1)) / 2) * 5;
}

const POINTS_PER_LEVEL = 2;
const levelStrategy = {};
const defaultStrategy = [0.19, 0.18, 0.18, 0.18, 0.18, 0.18];
const attrs = [
  "agility",
  "constitution",
  "endurance",
  "intelligence",
  "strength",
  "wisdom",
];

export function levelUp(entity) {
  const strategy = levelStrategy[entity.name] ?? defaultStrategy;
  for (let times = 0; times < POINTS_PER_LEVEL; ++times) {
    let r = Math.random();
    for (let i = 0; i < strategy.length; ++i) {
      if (r < strategy[i]) {
        entity[attrs[i]] += 1;
        break;
      }
      r -= strategy[i];
    }
  }
  ++entity.level;
  entity.health = entity.maxHealth;
  entity.mana = entity.maxMana;
  entity.stamina = entity.maxStamina;
  entity.statuses = [];
}

/**
 * @param {Number[]} strategy - agility, constitution, endurance, intelligence, strength, wisdom
 */
export function setLevelStrategy(name, strategy) {
  levelStrategy[name] = strategy;
}

const descriptionTable = {};

export function getDescription(entity) {
  return descriptionTable[`${entity.name}-${entity.variant}`];
}

export function setDescription(entityName, entityVariant, table) {
  descriptionTable[`${entityName}-${entityVariant}`] = table;
}

const dropTable = {};

export function getDrop(entity) {
  const table = dropTable[entity.name] ?? {};
  let r = Math.random();

  for (const chance in table) {
    if (r < chance) {
      return table[chance](entity);
    }
    r -= chance;
  }

  return undefined;
}

export function setDropTable(name, table) {
  dropTable[name] = table;
}

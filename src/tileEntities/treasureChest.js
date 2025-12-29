import { Item, emptyHand, key, spawnItem } from "../items/index.js";
import { permuteArr } from "../utils.js";
import { TileEntity } from "./tileEntity.js";

export function treasureChestCommon(x, y) {
  return createTreasureChest(0, x, y, {
    0: ({ displayName }) =>
      `The ${displayName} looks unassuming, but the promise of valuables within excites you nonetheless.`,
  });
}

export function treasureChestUncommon(x, y) {
  return createTreasureChest(1, x, y, {
    0: ({ displayName }) =>
      `The ${displayName} fills you with a sense of accomplishment as you look it over.`,
  });
}

export function treasureChestRare(x, y) {
  return createTreasureChest(2, x, y, {
    0: ({ displayName }) =>
      `The ${displayName} is a work of skilled craftsmanship, and undoubtedly the rewards held within are of surpassing value.`,
  });
}

export function treasureChestEpic(x, y) {
  return createTreasureChest(3, x, y, {
    0: ({ displayName }) =>
      `Few ever have the opportunity to look upon an ${displayName}, let alone open one, yet here you are.`,
  });
}

export function treasureChestLegendary(x, y) {
  return createTreasureChest(4, x, y, {
    0: ({ displayName }) =>
      `The journey to arrive here has been fraught with hardship, but you stand on the precipice of profit. The ${displayName} has an aura all of its own, the riches held within draw you in with a tangible gravity.`,
  });
}

const DROP_TABLES = [
  {
    0.4: () => ({ itemId: healthPotionMinor.id }),
    0.6: () => ({
      itemId: goldPile.id,
      additionalProps: {
        count: Math.floor(Math.random() * 10),
        pickup: gold,
      },
    }),
  }, 
];
const SURROUNDING_OFFSETS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
];
const VARIANTS = [
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary", 
];

function getLoot(table) {
  let r = Math.random();

  for (const chance in table) {
    if (r < chance) {
      return table[chance](entity);
    }
    r -= chance;
  }

  return undefined;
}

function dropLoot(table, x, y) {
  const loot = getLoot(table);
  spawnItem(
    Item.idToItem[loot.itemId],
    x,
    y,
    loot.additionalProps,
  );
}

/**
 * @param {number} index - Rarity of treasure chest
 */
function createTreasureChest(index, x, y, description) {
  const variant = VARIANTS[index];
  return new TileEntity({
    name: `${variant} Treasure Chest`,
    getSprite: ({ open }) =>
      `url('images/treasure-chest-${variant.toLowerCase()}-${open ? "open" : "closed"}.png')`,
    description,
    canInteract: ({ open }, _, item) =>
      !open &&
      (entity.hands ?? true) &&
      (item.id === emptyHand.id || item.id === key.id),
    isOpaque: () => false,
    isTraversable: () => false,
    initialState: {
      open: false,
      x,
      y,
    },
    onInteract: async (state, entity) => {
      state.open = true;
      const dropTable = DROP_TABLES[index];
      const count = randInRange(index + 1, index + 3);
      const pOffsets = permuteArr([...SURROUNDING_OFFSETS]);
      const { x, y } = state;
      for (let i = 0; i < count; ++i) {
        const [dx, dy] = pOffsets[i];
        dropLoot(dropTable, x + dx, y + dy);
      }
      await logActionEnd(entity, `opened the ${variant} Treasure Chest`);
      return true;
    },
  });
}

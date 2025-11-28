import { TileEntity } from "./tileEntity.js";

export function treasureChestCommon() {
  return createTreasureChest("Common", {
    0: ({ name }) =>
      `The ${name} looks unassuming, but the promise of valuables within excites you nonetheless.`,
  });
}

export function treasureChestUncommon() {
  return createTreasureChest("Uncommon", {
    0: ({ name }) =>
      `The ${name} fills you with a sense of accomplishment as you look it over.`,
  });
}

export function treasureChestRare() {
  return createTreasureChest("Rare", {
    0: (_, { name }) =>
      `The ${name} is a work of skilled craftsmanship, and undoubtedly the rewards held within are of surpassing value.`,
  });
}

export function treasureChestEpic() {
  return createTreasureChest("Epic", {
    0: (_, { name }) =>
      `Few ever have the opportunity to look upon an ${name}, let alone open one, yet here you are.`,
  });
}

export function treasureChestLegendary() {
  return createTreasureChest("Legendary", {
    0: (_, { name }) =>
      `The journey to arrive here has been fraught with hardship, but you stand on the precipice of profit. The ${name} has an aura all of its own, the riches held within draw you in with a tangible gravity.`,
  });
}

/**
 * @param {string} variant - Rarity of treasure chest
 */
function createTreasureChest(variant, description) {
  return new TileEntity({
    name: `${variant} Treasure Chest`,
    getSprite: ({ open }) =>
      `url('images/treasure-chest-${variant.toLowerCase()}-${open ? "open" : "closed"}.png')`,
    description,
    canInteract: () => false,
    isOpaque: () => false,
    isTraversable: () => false,
    initialState: {
      open: false,
    },
  });
}

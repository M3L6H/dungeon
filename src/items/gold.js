import { Item } from "./item.js";

export const gold = new Item({
  id: "gold",
  name: "Gold",
  sprite: "gold-coin",
});

export const goldPile = new Item({
  id: "gold-pile",
  name: "Pile of Gold",
  sprite: "gold-pile",
});

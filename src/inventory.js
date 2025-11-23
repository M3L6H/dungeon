import { getPlayer } from "./gameState.js";
import { Item } from "./items/item.js";

const inventoryElt = document.getElementById("inventory");
let contentsElt;
let initialCount = 0;

export function hideInventory() {
  inventoryElt.classList.add("hidden");
}

export function showInventory(onSelect, showFinger = false) {
  inventoryElt.classList.remove("hidden");

  if (showFinger) {
    inventoryElt.querySelector(".empty-hand").classList.remove("hidden");
  } else {
    inventoryElt.querySelector(".empty-hand").classList.add("hidden");
  }

  const { inventory } = getPlayer();
  let i = initialCount;

  for (const item in inventory) {
    const count = inventory[item];
    if (count <= 0) continue;
    createOrUpdateInventoryItem(i, Item.idToItem[item], count);
    ++i;
  }

  for (; i < contentsElt.children.length; ++i) {
    contentsElt.children[i].classList.add("hidden");
  }

  contentsElt.querySelectorAll(".inventory-button").forEach((btn) => {
    btn.onclick = () => onSelect(btn.dataset.item);
  });
}

export function setupInventory() {
  inventoryElt.querySelector(".close-button")?.addEventListener("click", () => {
    hideInventory();
  });
  contentsElt = inventoryElt.querySelector(".contents");
  initialCount = contentsElt.children.length;
}

function createInventoryItem() {
  const inventoryItemElt = document.createElement("span");
  inventoryItemElt.classList.add("inventory-button");
  return inventoryItemElt;
}

function createOrUpdateInventoryItem(i, { id, sprite }, count) {
  let inventoryItemElt;

  if (i >= contentsElt.children.length) {
    inventoryItemElt = createInventoryItem();
    contentsElt.appendChild(inventoryItemElt);
  } else {
    inventoryItemElt = contentsElt.children[i];
  }

  inventoryItemElt.classList.remove("hidden");
  inventoryItemElt.style.backgroundImage = sprite;
  if (count > 1) inventoryItemElt.dataset.count = count;
  inventoryItemElt.dataset.item = id;
}

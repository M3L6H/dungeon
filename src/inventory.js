const inventoryElt = document.getElementById("inventory");

export function hideInventory() {
  inventoryElt.classList.add("hidden");
}

export function showInventory(onSelect, showFinger = false) {
  inventoryElt.classList.remove("hidden");
  
  if (showFinger) {
    inventoryElt.querySelector(".pointing-finger").classList.remove("hidden");
  } else {
    inventoryElt.querySelector(".pointing-finger").classList.add("hidden");
  }
}

export function setupInventory() {
  inventoryElt.querySelector(".close-button")?.addEventListener("click", () => {
    hideInventory();
  });
}

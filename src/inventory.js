export const inventoryElt = document.getElementById("inventory");

export function setupInventory() {
  inventoryElt.querySelector(".close-button")?.addEventListener("click", () => {
    inventoryElt.classList.add("hidden");
  });
}

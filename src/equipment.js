const equipmentElt = document.getElementById("equipment");

export function hideEquipment() {
  equipmentElt.classList.add("hidden");
}

export function showEquipment() {
  equipmentElt.classList.remove("hidden");
}

export function setUpEquipment() {
  equipmentElt.querySelector(".close-button").onclick = () => {
    hideEquipment();
  };
}

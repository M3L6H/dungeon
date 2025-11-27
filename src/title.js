const titleElt = document.getElementById("title");

export function showRoomNameEntering(name) {
  titleElt.querySelector("span").textContent = "Now Entering...";
  showRoomName(name);
}

export function showRoomNameLeaving(name) {
  titleElt.querySelector("span").textContent = "Now Leaving...";
  showRoomName(name);
}

function showRoomName(name) {
  titleElt.querySelector("h1").textContent = name;
  titleElt.classList.remove("fade", "hidden");
  void titleElt.offsetWidth;
  titleElt.classList.add("fade");
}

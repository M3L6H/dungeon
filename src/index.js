import { setUpActions } from "./actions.js";
import { setUpMainMenu } from "./mainMenu.js";
import { setUpNewGame } from "./newGame.js";
import { setUpPauseMenu } from "./pauseMenu.js";
import { setUpSettingsMenu } from "./settingsMenu.js";
import { setUpSkills } from "./skills.js";
import { setUpStats } from "./stats.js";
import { setUpVersion } from "./version.js";
import { setUpViewport } from "./viewport.js";

const mainElt = document.getElementById("main");

function setSize() {
  const main = document.getElementById("main");
  const width = Math.min(
    window.innerWidth,
    Math.floor((window.innerHeight / 16) * 9),
  );
  main.style.width = `${width}px`;
}

async function init() {
  setSize();
  setUpActions();
  setUpMainMenu();
  setUpNewGame();
  setUpPauseMenu();
  setUpSettingsMenu();
  setUpSkills();
  setUpStats();
  setUpVersion();
  setUpViewport();

  mainElt.classList.remove("hidden");
}

addEventListener("load", async () => await init());
addEventListener("resize", () => setSize());

// Disable double tap zoom

const drags = new Set(); //set of all active drags
document.addEventListener("touchmove", function (event) {
  if (!event.isTrusted) return; //don't react to fake touches
  Array.from(event.changedTouches).forEach(function (touch) {
    drags.add(touch.identifier); //mark this touch as a drag
  });
});

document.addEventListener("touchend", function (event) {
  if (!event.isTrusted) return;
  let isDrag = false;
  Array.from(event.changedTouches).forEach(function (touch) {
    if (drags.has(touch.identifier)) {
      isDrag = true;
    }
    drags.delete(touch.identifier); //touch ended, so delete it
  });
  if (!isDrag && document.activeElement == document.body) {
    //note that double-tap only happens when the body is active
    event.preventDefault(); //don't zoom
    event.stopPropagation(); //don't relay event
    event.target.focus(); //in case it's an input element
    event.target.click(); //in case it has a click handler
    //dispatch a copy of this event (for other touch handlers)
    event.target.dispatchEvent(new TouchEvent("touchend", event));
  }
});

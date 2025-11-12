import { getTime } from "./gameState.js";

const logsElt = document.getElementById("logs");

export function addLog(msg) {
  const logElt = document.createElement("p");
  logElt.classList.add("log");
  logElt.textContent = `${getTime()}: ${msg}`;
  logsElt.appendChild(logElt);
  logsElt.scrollTop = logsElt.scrollHeight;
}


import { getLogs, getTime } from "./gameState.js";
import { highlight } from "./viewport.js";

const logsElt = document.getElementById("logs");

export function addLog(msg) {
  const logs = getLogs();
  const log = `${getTime()}: ${msg}`;
  logs.push(log);
  const logElt = document.createElement("p");
  logElt.classList.add("log");
  logElt.innerHTML = log;
  logsElt.appendChild(logElt);
  while (logsElt.children.length > 500) {
    logsElt.removeChild(logsElt.firstElementChild);
  }
  logsElt.scrollTop = logsElt.scrollHeight;
  return logElt;
}

export function addDangerLog(msg) {
  const logElt = addLog(msg);
  logElt.classList.add("danger");
  return logElt;
}

export function addSafeLog(msg) {
  const logElt = addLog(msg);
  logElt.classList.add("safe");
  return logElt;
}

export function addStartLog(msg) {
  const logElt = addLog(msg);
  logElt.classList.add("start");
  return logElt;
}

export function addEndLog(msg) {
  const logElt = addLog(msg);
  logElt.classList.add("end");
  return logElt;
}

export function addWarnLog(msg) {
  const logElt = addLog(msg);
  logElt.classList.add("warn");
  return logElt;
}

function init() {
  logsElt.addEventListener("click", (e) => {
    const elt = e.target;

    if (!(elt instanceof HTMLAnchorElement)) return;
    if (elt.dataset.id === undefined) return;
    highlight(elt.dataset.id);
  });
}

document.addEventListener("DOMContentLoaded", init);

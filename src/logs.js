import { getLogs, getSettings, getTime } from "./gameState.js";
import {
  highlight,
  renderViewport,
  toggleHighlightOff,
  toggleHighlightOn,
} from "./viewport.js";

const logsElt = document.getElementById("logs");

/**
 * Append a log to the log window.
 * @param {string} msg - The log message to print
 * @param {boolean} wait - Whether to wait with a delay
 * @returns {HTMLParagraphElement | Promise<HTMLParagraphElement>} A promise that resolves to the logElt if wait is true, otherwise the logElt is returned directly
 */
export function addLog(msg, wait = true) {
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
  if (!wait) return logElt;
  renderViewport();
  return waitForReading(logElt, msg);
}

export function addDangerLog(msg, wait = true) {
  return addStyledLog(msg, "danger", wait);
}

export function addSafeLog(msg, wait = true) {
  return addStyledLog(msg, "safe", wait);
}

export function addStartLog(msg, wait = true) {
  return addStyledLog(msg, "start", wait);
}

export function addEndLog(msg, wait = true) {
  return addStyledLog(msg, "end", wait);
}

export function addWarnLog(msg, wait = true) {
  return addStyledLog(msg, "warn", wait);
}

export async function waitForReading(logElt, msg) {
  return new Promise((resolve) => {
    const elts = logElt.querySelectorAll("[data-id]");
    if (elts.length > 0) {
      elts.forEach((elt) => toggleHighlightOn(elt.dataset.id));
    }
    setTimeout(() => {
      resolve(logElt);
      if (elts.length > 0) {
        elts.forEach((elt) => toggleHighlightOff(elt.dataset.id));
      }
    }, getSettings().gameSpeed * 5);
  });
}

/**
 * @returns {Promise<HTMLParagraphElement>|HTMLParagraphElement}
 */
function addStyledLog(msg, style, wait = true) {
  const logElt = addLog(msg, false);
  logElt.classList.add(style);
  if (wait) {
    renderViewport();
    return waitForReading(logElt, msg);
  }
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

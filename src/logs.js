import { getLogs, getTime } from "./gameState.js";

const logsElt = document.getElementById("logs");

export function addLog(msg) {
  const logs = getLogs();
  logs.push(`${getTime()}: ${msg}`);
  logsElt.innerHTML = logs.slice(-100).map(log => (
    `<p class='log'>${log}</p>`
  )).join();
  logsElt.scrollTop = logsElt.scrollHeight;
  return logsElt.children[logsElt.children.length - 1];
}

export function addStartLog(msg) {
  const logElt = addLog(msg);
  logElt.classList.add('start');
  return logElt;
}

export function addEndLog(msg) {
  const logElt = addLog(msg);
  logElt.classList.add('end');
  return logElt;
}

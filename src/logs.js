import { getLogs, getTime } from "./gameState.js";

const logsElt = document.getElementById("logs");

export function addLog(msg) {
  const logs = getLogs();
  logs.push(`${getTime()}: ${msg}`);
  logsElt.textContent = logs.slice(-100).join("\r\n");
  logsElt.scrollTop = logsElt.scrollHeight;
}

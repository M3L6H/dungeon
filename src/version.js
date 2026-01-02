export const VERSION = "1.1.0-alpha";

export function setUpVersion() {
  document.querySelectorAll(".version").forEach((elt) => {
    elt.textContent = VERSION;
  });
}

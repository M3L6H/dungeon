export const VERSION = "1.2.0-alpha";

export function setUpVersion() {
  document.querySelectorAll(".version").forEach((elt) => {
    elt.textContent = VERSION;
  });
}

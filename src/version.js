const VERSION_KEY = "version";

export const VERSION = "1.3.2-alpha";

export function isVersionCompatible() {
  const savedVersion = localStorage.getItem(VERSION_KEY) ?? "0.0.0-none";
  const [savedNumber, savedSuffix] = savedVersion.split("-");
  const [savedMajor, savedMinor, savedPatch] = savedNumber.split(".");
  const [currentNumber, currentSuffix] = VERSION.split("-");
  const [currentMajor, currentMinor, currentPatch] = currentNumber.split(".");
  const validPatch = savedPatch <= currentPatch || savedMinor < currentMinor;
  const validMinor = savedMinor <= currentMinor;
  return (
    savedSuffix === currentSuffix &&
    savedMajor === currentMajor &&
    validMinor &&
    validPatch
  );
}

export function saveVersion() {
  localStorage.setItem(VERSION_KEY, VERSION);
}

export function setUpVersion() {
  document.querySelectorAll(".version").forEach((elt) => {
    elt.textContent = VERSION;
  });
}

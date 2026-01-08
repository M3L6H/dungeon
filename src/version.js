const VERSION_KEY = "version";

export const VERSION = "2.2.5-alpha";

export function getVersion() {
  return localStorage.getItem(VERSION_KEY) ?? "0.0.0-none";
}

export function isVersionCompatible() {
  const [savedMajor, savedMinor, savedPatch, savedSuffix] =
    splitVersion(getVersion());
  const [currentMajor, currentMinor, currentPatch, currentSuffix] =
    splitVersion(VERSION);
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

function splitVersion(version) {
  const [number, suffix] = version.split("-");
  const [major, minor, patch] = number.split(".");
  return [major, minor, patch, suffix];
}

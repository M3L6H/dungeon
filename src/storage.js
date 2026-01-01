export function loadItemData(key) {
  const data = localStorage.getItem(key);

  if (!data) return undefined;

  return JSON.parse(data);
}

export function saveItemData(key, itemData) {
  localStorage.setItem(key, JSON.stringify(itemData));
}


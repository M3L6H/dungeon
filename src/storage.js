export function loadItemData(key, itemClass) {
  return itemClass.fromData(JSON.parse(localStorage.get(key)));
}

export function saveItemData(key, item) {
  localStorage.setItem(key, JSON.stringify(item.toData());
}
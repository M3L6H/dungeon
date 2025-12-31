const descriptionTable = {};

export function getDescription(tileEntity) {
  return descriptionTable[tileEntity.name];
}

export function setDescription(tileEntityName, table) {
  descriptionTable[tileEntityName] = table;
}

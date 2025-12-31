/**
 * Functions cannot be serialized, so we register and call them indirectly instead.
 */
 
const functions = {};

export function registerFn(namespace, name, fn) {
  const key = `${namespace}:${name}`;
  functions[key] = fn;
  return key;
}

export async function call(key, ...args) {
  if (!functions[key]) {
    console.error(`Tried to call unregistered function: ${key}`);
    return;
  }
  return await functions[key](...args);
}
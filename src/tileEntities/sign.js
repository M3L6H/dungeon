import { TileEntity } from "./tileEntity.js";

export function sign(description, dir) {
  return new TileEntity({
    name: "Sign",
    getSprite: () => `url('images/sign-${dir}.png')`,
    description,
    canInteract: () => false,
    isOpaque: () => false,
    isTraversable: () => true,
    initialState: {},
  });
}

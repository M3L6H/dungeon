import { registerFn } from "../functions.js";
import { setDescription } from "./data.js";
import { TileEntity } from "./tileEntity.js";

const NAMESPACE = "sign";

const name = "Sign";
const getSprite = registerFn(
  NAMESPACE,
  "getSprite",
  ({ dir }) => `url('images/sign-${dir}.png')`,
);
const canInteract = registerFn(NAMESPACE, "canInteract", () => false);
const isOpaque = registerFn(NAMESPACE, "isOpaque", () => false);
const isTraversable = registerFn(NAMESPACE, "isTraversable", () => true);
export function sign(descriptionText, dir) {
  return new TileEntity({
    name,
    getSprite,
    canInteract,
    isOpaque,
    isTraversable,
    initialState: {
      descriptionText,
      dir,
    },
  });
}
setDescription(name, {
  0: ({ descriptionText }) => descriptionText,
});

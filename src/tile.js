import { call, registerFn } from "./functions.js";

const NAMESPACE = "tile";

const descriptionTable = {};

export function getDescription(tile) {
  return descriptionTable[tile.name];
}

export function setDescription(tileName, table) {
  descriptionTable[tileName] = table;
}

const defaultIsTraversable = registerFn(
  NAMESPACE,
  "defaultIsTraversable",
  () => true,
);
const defaultIsOpaque = registerFn(NAMESPACE, "defaultIsOpaque", () => false);

export class Tile {
  static idToTile = [];

  static floor = new Tile({
    name: "Dungeon Floor",
    url: "url('images/floor.png')",
    description: {
      0: () =>
        Math.random() < 0.5
          ? "The dungeon floor is plain; large, smooth tiles make up its surface."
          : "The dungeon floor is wholly unremarkable save for its indestructible nature.",
    },
  });

  static secretWall = new Tile({
    name: "Dungeon Wall",
    url: "url('images/dungeon-wall-secret.png')",
    description: {
      0: (_, { perception }) => {
        if (perception >= 5) return "Something looks odd about this wall";
        return Math.random() < 0.5
          ? "The dungeon wall is made of solid dark stone."
          : "The dungeon wall is slightly damp. Moss grows in the cracks between bricks.";
      },
    },
    isTraversable: registerFn(NAMESPACE, "secretWallIsTraversable", () => true),
    isOpaque: registerFn(NAMESPACE, "secretWallIsOpaque", () => true),
  });

  static wall = new Tile({
    name: "Dungeon Wall",
    url: "url('images/dungeon-wall.png')",
    description: {
      0: () =>
        Math.random() < 0.5
          ? "The dungeon wall is made of solid dark stone."
          : "The dungeon wall is slightly damp. Moss grows in the cracks between bricks.",
    },
    isTraversable: registerFn(NAMESPACE, "wallIsTraversable", () => false),
    isOpaque: registerFn(NAMESPACE, "wallIsOpaque", () => true),
  });

  static nameToTile = {
    [this.floor.name]: this.floor,
    [this.secretWall.name]: this.secretWall,
    [this.wall.name]: this.wall,
  };

  constructor(props) {
    this.id = Tile.idToTile.length;
    this.name = props.name;
    this.url = props.url ?? "none";

    setDescription(
      this.name,
      props.description ?? {
        0: () => `You see nothing interesting about ${this.name}`,
      },
    );

    this._isOpaque = props.isOpaque ?? defaultIsOpaque;
    this._isTraversable = props.isTraversable ?? defaultIsTraversable;

    Tile.idToTile.push(this);
  }

  examine(entity) {
    const { perception } = entity;
    const details = [];
    const description = getDescription(this);
    for (const threshold in description) {
      if (perception >= threshold) {
        details.push(description[threshold](this, entity));
      }
    }
    return details.join("\r\n");
  }

  isOpaque(entity) {
    return call(this._isOpaque, entity);
  }

  isTraversable(entity) {
    return call(this._isTraversable, entity);
  }
}

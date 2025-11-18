import { addLog } from "./logs.js";

export class Tile {
  static floor = new Tile({
    name: "Dungeon Floor",
    url: "url('images/floor.png')",
    description: {
      0: () => (Math.random() < 0.5 ? "The dungeon floor is plain; large, smooth tiles make up its surface." : "The dungeon floor is wholly unremarkable save for its indestructible nature."),
    },
    indestructible: true,
  });

  static wall = new Tile({
    name: "Dungeon Wall",
    url: "url('images/wall.png')",
    description: {
      0: () => (Math.random() < 0.5 ? "The dungeon wall is made of solid dark stone." : "The dungeon wall is slightly damp. Moss grows in the cracks between bricks."),
    },
    indestructible: true,
    obstructing: true,
    opaque: true,
  });

  static nameToTile = {
    [this.floor.name]: this.floor,
    [this.wall.name]: this.wall,
  };

  constructor(props) {
    this.name = props.name ?? "Unknown";
    this.url = props.url ?? "none";

    this.description = props.description ?? {
      0: () => `You see nothing interesting about ${this.name}`,
    };

    this.indestructible = props.indestructible ?? false;
    this.obstructing = props.obstructing ?? false;
    this.opaque = props.opaque ?? false;
  }
  
  examine({ perception }) {
    for (const threshold in this.description) {
      if (perception >= threshold) {
        addLog(this.description[threshold](this));
      }
    }
  }
  
  get isOpaque() {
    return this.opaque;
  }

  get isTraversable() {
    return !this.obstructing;
  }
}

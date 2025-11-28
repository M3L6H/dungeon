export class Tile {
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
      0: ({ perception }) => {
        if (perception >= 5) return "Something looks odd about this wall";
        return Math.random() < 0.5
          ? "The dungeon wall is made of solid dark stone."
          : "The dungeon wall is slightly damp. Moss grows in the cracks between bricks.";
      },
    },
    isTraversable: () => true,
    isOpaque: () => true,
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
    isTraversable: () => false,
    isOpaque: () => true,
  });

  static nameToTile = {
    [this.floor.name]: this.floor,
    [this.secretWall.name]: this.secretWall,
    [this.wall.name]: this.wall,
  };

  constructor(props) {
    this.name = props.name ?? "Unknown";
    this.url = props.url ?? "none";

    this.description = props.description ?? {
      0: () => `You see nothing interesting about ${this.name}`,
    };

    this.isTraversable = props.isTraversable ?? (() => true);
    this.isOpaque = props.isOpaque ?? (() => false);
  }

  examine(entity) {
    const { perception } = entity;
    const details = [];
    for (const threshold in this.description) {
      if (perception >= threshold) {
        details.push(this.description[threshold](entity, this));
      }
    }
    return details.join("\r\n");
  }
}

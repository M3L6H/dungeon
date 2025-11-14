export class Tile {
  static floor = new Tile({
    name: "Dungeon Floor",
    url: "url('images/floor.png')",
    indestructible: true,
  });

  static wall = new Tile({
    name: "Dungeon Wall",
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

    this.looksLike = props.looksLike ?? "nothing interesting";
    this.feelsLike = props.feelsLike;
    this.smellsLike = props.smellsLike;
    this.soundsLike = props.soundsLike;
    this.tastesLike = props.tastesLike;

    this.indestructible = props.indestructible ?? false;
    this.obstructing = props.obstructing ?? false;
    this.opaque = props.opaque ?? false;
  }

  get isTraversable() {
    return !this.obstructing;
  }
}

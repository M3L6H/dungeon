import { Item } from "./item.js";

export class Equipment extends Item {
  constructor(props) {
    super(props);

    this.isEquipment = true;

    this.attackRangeMod = props.attackRangeMod ?? 0;
    this.attackDelayMod = props.attackDelayMod ?? 0;
    this.accuracyMod = props.accuracyMod ?? 0;
    this.damageMod = props.damageMod ?? 0;
    this.defenseMod = props.defenseMod ?? 0;
    this.dodgeMod = props.dodgeMod ?? 0;
    this.speedMod = props.speedMod ?? 0;

    this.magiResMod = props.magiResMod ?? 0;
    this.physResMod = props.physResMod ?? 0;

    this.maxHealthMod = props.maxHealthMod ?? 0;
    this.maxManaMod = props.maxManaMod ?? 0;
    this.maxStaminaMod = props.maxStaminaMod ?? 0;
  }
}

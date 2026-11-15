// Part classes for the contraption builder.
// Nothing imports this file yet; see the notes in the chat for how to wire it in.

export class SpacecraftPart {
  constructor({ id, name, dryMass, width, height, attachNodes }) {
    this.id = id;
    this.name = name;
    this.dryMass = dryMass;
    this.width = width;
    this.height = height;
    this.attachNodes = attachNodes; // e.g., { top: true, bottom: true, left: false, right: false }
  }
  getTotalMass() { return this.dryMass; }
}

export class FuelTank extends SpacecraftPart {
  constructor(config) {
    super(config);
    this.fuelType = config.fuelType;
    this.maxFuel = config.maxFuel;
    this.currentFuel = config.maxFuel;
    this.fuelDensity = config.fuelDensity ?? 5; // kg per unit
  }
  getTotalMass() {
    return this.dryMass + this.currentFuel * this.fuelDensity;
  }
}

export class RocketEngine extends SpacecraftPart {
  constructor(config) {
    super(config);
    this.maxThrust = config.maxThrust;
    this.isp = config.isp;
    this.gimbalRange = config.gimbalRange ?? 0;
    this.throttle = 0;
  }
  getCurrentThrust() {
    return this.maxThrust * this.throttle;
  }
}
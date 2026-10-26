class House {
  constructor() {
    this.app = null;
    this.meshes = [];
    this.grid = null;
    this.houseGroup = null;
  }

  async run(env) {
    // Delegate to primary House implementation
    if (globalThis.House && globalThis.House !== House) {
      const inst = new globalThis.House();
      return await inst.run(env);
    }
  }

  destroy() {
    if (this.app && typeof this.app.destroy === 'function') {
      try { this.app.destroy(); } catch (e) {}
    }
  }
}

globalThis.House = House;
if (typeof module !== 'undefined' && module.exports) module.exports = House;
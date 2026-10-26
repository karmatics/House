class Simple3dShapes {
  constructor() {}

  static buildPrimitives(app, scene) {
    return Simple3dShapes.buildPrimitives ? Simple3dShapes.buildPrimitives(app, scene) : null;
  }
}

globalThis.Simple3dShapes = Simple3dShapes;
if (typeof module !== 'undefined' && module.exports) module.exports = Simple3dShapes;
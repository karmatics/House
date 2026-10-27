class RoofBuilder {
  constructor() {}

  static getRoofConfig(customConfig = {}) {
    return Object.assign({
      ridgeY: 10.40,
      ridgeZ: -1.55,
      eaveY: 6.45,
      frontEaveZ: 1.85,
      rearEaveZ: -5.85,
      leftX: -5.60,
      rightX: 7.60,
      leftOverhangX: -6.00,
      // Left Wing: Flat wall with window & angled skirt roof below it
      leftGableCenterX: -3.70,
      leftGableWidth: 3.40,
      leftWallZ: 0.60,
      leftSkirtTopY: 7.80,    // Top of angled skirt / sill of vertical wall
      leftGableApexY: 10.20,  // Apex of left gable
      leftWindowW: 1.40,
      leftWindowH: 1.10,
      // Front Lunette Gable: Lower apex so it does NOT bend the main ridge
      gableApexY: 9.50,       // Lower than main ridge 10.40!
      gableWallZ: 2.80,
      gableRakeZ: 3.15,
      gableLeftX: 1.00,
      gableRightX: 6.80,
      windowSillY: 6.65,      // Window placed lower down
      windowRadius: 1.35,
      // Triangular Dormer: OFF TO THE SIDE of left chimney & BIGGER
      dormerCenterX: -0.45,   // Shifted off to the side (chimney is at -1.85)
      dormerFrontZ: 0.40,
      dormerWidth: 2.00,      // Bigger
      dormerApexY: 9.85,      // Taller
      dormerNotchW: 0.48,
      dormerNotchH: 0.30
    }, customConfig);
  }

  static getPlaneEquations(cfg) {
    const frontDz = cfg.frontEaveZ - cfg.ridgeZ;
    const frontDy = cfg.eaveY - cfg.ridgeY;
    const frontSlope = frontDy / frontDz;

    const rearDz = cfg.rearEaveZ - cfg.ridgeZ;
    const rearDy = cfg.eaveY - cfg.ridgeY;
    const rearSlope = rearDy / rearDz;

    return {
      getFrontY: (z) => cfg.ridgeY + frontSlope * (z - cfg.ridgeZ),
      getFrontZ: (y) => cfg.ridgeZ + (y - cfg.ridgeY) / frontSlope,
      getRearY: (z) => cfg.ridgeY + rearSlope * (z - cfg.ridgeZ),
      getRearZ: (y) => cfg.ridgeZ + (y - cfg.ridgeY) / rearSlope,
      getY: (z) => z >= cfg.ridgeZ ? (cfg.ridgeY + frontSlope * (z - cfg.ridgeZ)) : (cfg.ridgeY + rearSlope * (z - cfg.ridgeZ)),
      frontSlope,
      rearSlope,
      cfg
    };
  }

  static buildRoof(partBuckets, solidBuckets, THREE, customConfig = {}) {
    const cfg = RoofBuilder.getRoofConfig(customConfig);
    const plane = RoofBuilder.getPlaneEquations(cfg);

    const addWire = (id, p1, p2) => {
      if (!partBuckets[id]) partBuckets[id] = [];
      partBuckets[id].push(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
    };

    const addSolidTri = (id, p0, p1, p2) => {
      if (!solidBuckets[id]) solidBuckets[id] = [];
      solidBuckets[id].push(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
    };

    const addSolidQuad = (id, p0, p1, p2, p3) => {
      addSolidTri(id, p0, p1, p2);
      addSolidTri(id, p0, p2, p3);
    };

    const rY = cfg.ridgeY;
    const rZ = cfg.ridgeZ;
    const eY = cfg.eaveY;
    const fZ = cfg.frontEaveZ;
    const bZ = cfg.rearEaveZ;

    // 1. MAIN UNBROKEN HORIZONTAL RIDGE LINE (y = 10.40)
    const mainRidgeL = [cfg.leftX, rY, rZ];
    const mainRidgeR = [cfg.rightX, rY, rZ];
    addWire('roof_main_ridge', mainRidgeL, mainRidgeR);

    // 2. REAR ROOF SLOPE
    const rearEaveL = [cfg.leftOverhangX, eY, bZ];
    const rearEaveR = [cfg.rightX, eY, bZ];
    addWire('roof_main_rear', rearEaveL, rearEaveR);
    addWire('roof_main_rear', mainRidgeL, rearEaveL);
    addWire('roof_main_rear', mainRidgeR, rearEaveR);
    addSolidQuad('roof_main_rear', rearEaveL, rearEaveR, mainRidgeR, mainRidgeL);

    // 3. LEFT WING: FLAT VERTICAL WALL + SQUARE WINDOW + ANGLED SKIRT ROOF
    const lCX = cfg.leftGableCenterX;           // -3.70
    const lHW = cfg.leftGableWidth * 0.5;       // 1.70
    const lWallZ = cfg.leftWallZ;               // 0.60
    const lSkirtTopY = cfg.leftSkirtTopY;       // 7.80
    const lApexY = cfg.leftGableApexY;          // 10.20
    const lIntZ = plane.getFrontZ(lApexY);

    const pLeftWallBL = [lCX - lHW, lSkirtTopY, lWallZ];
    const pLeftWallBR = [lCX + lHW, lSkirtTopY, lWallZ];
    const pLeftApex = [lCX, lApexY, lWallZ];
    const pLeftRidgeInt = [lCX, lApexY, lIntZ];

    // Left Upper Gable Wall
    addWire('roof_left_gable', pLeftWallBL, pLeftApex);
    addWire('roof_left_gable', pLeftApex, pLeftWallBR);
    addWire('roof_left_gable', pLeftWallBL, pLeftWallBR);
    addWire('roof_left_gable', pLeftApex, pLeftRidgeInt);
    addSolidTri('roof_left_gable', pLeftWallBL, pLeftWallBR, pLeftApex);

    // Square Window in the Flat Wall
    const wHW = cfg.leftWindowW * 0.5;          // 0.70
    const wH = cfg.leftWindowH;                // 1.10
    const wCenterY = (lSkirtTopY + lApexY) * 0.5 - 0.20;
    const wZ = lWallZ + 0.02;

    const pW_BL = [lCX - wHW, wCenterY - wH * 0.5, wZ];
    const pW_BR = [lCX + wHW, wCenterY - wH * 0.5, wZ];
    const pW_TR = [lCX + wHW, wCenterY + wH * 0.5, wZ];
    const pW_TL = [lCX - wHW, wCenterY + wH * 0.5, wZ];

    addWire('roof_left_window', pW_BL, pW_BR);
    addWire('roof_left_window', pW_BR, pW_TR);
    addWire('roof_left_window', pW_TR, pW_TL);
    addWire('roof_left_window', pW_TL, pW_BL);
    // Window mullions cross
    addWire('roof_left_window', [lCX, wCenterY - wH * 0.5, wZ], [lCX, wCenterY + wH * 0.5, wZ]);
    addWire('roof_left_window', [lCX - wHW, wCenterY, wZ], [lCX + wHW, wCenterY, wZ]);
    addSolidQuad('roof_left_window', pW_BL, pW_BR, pW_TR, pW_TL);

    // Angled Skirt Roof below the window:
    // Slopes down from [lWallZ, lSkirtTopY] to [fZ, eY] where bottom aligns with all other roofs
    const pSkirtBotL = [cfg.leftOverhangX, eY, fZ];
    const pSkirtBotR = [lCX + lHW, eY, fZ];
    addWire('roof_left_skirt', pLeftWallBL, pSkirtBotL);
    addWire('roof_left_skirt', pLeftWallBR, pSkirtBotR);
    addWire('roof_left_skirt', pSkirtBotL, pSkirtBotR);
    addSolidQuad('roof_left_skirt', pSkirtBotL, pSkirtBotR, pLeftWallBR, pLeftWallBL);

    // Left side rake/hip tying into left overhang
    const pLeftEaveRear = [cfg.leftOverhangX, eY, bZ];
    addWire('roof_left_slope', mainRidgeL, pSkirtBotL);
    addWire('roof_left_slope', mainRidgeL, pLeftEaveRear);
    addWire('roof_left_slope', pSkirtBotL, pLeftEaveRear);
    addSolidTri('roof_left_slope', mainRidgeL, pSkirtBotL, pLeftEaveRear);

    // 4. LUNETTE GABLE (APEX IS LOWER THAN MAIN RIDGE -> NO BENDING OF RIDGE!)
    const gApexX = (cfg.gableLeftX + cfg.gableRightX) * 0.5; // 3.90
    const gApexY = cfg.gableApexY;                          // 9.50 (< 10.40)
    const gWallZ = cfg.gableWallZ;                          // 2.80
    const gRakeZ = cfg.gableRakeZ;                          // 3.15

    const gIntZ = plane.getFrontZ(gApexY);                  // ~ -0.78 (well in front of ridge -1.55!)
    const pGableApexFront = [gApexX, gApexY, gRakeZ];
    const pGableRidgeInt = [gApexX, gApexY, gIntZ];

    const pGableEaveL = [cfg.gableLeftX, eY, gRakeZ];
    const pGableEaveR = [cfg.gableRightX, eY, gRakeZ];
    const pValleyL = [cfg.gableLeftX, eY, fZ];
    const pValleyR = [cfg.gableRightX, eY, fZ];

    // Lunette Gable Rakes & Valleys
    addWire('roof_lunette_gable_l', pGableEaveL, pGableApexFront);
    addWire('roof_lunette_gable_l', pGableApexFront, pGableRidgeInt);
    addWire('roof_lunette_gable_l', pGableRidgeInt, pValleyL);
    addWire('roof_lunette_gable_l', pGableEaveL, pValleyL);
    addSolidQuad('roof_lunette_gable_l', pGableEaveL, pValleyL, pGableRidgeInt, pGableApexFront);

    addWire('roof_lunette_gable_r', pGableApexFront, pGableEaveR);
    addWire('roof_lunette_gable_r', pGableApexFront, pGableRidgeInt);
    addWire('roof_lunette_gable_r', pGableRidgeInt, pValleyR);
    addWire('roof_lunette_gable_r', pGableEaveR, pValleyR);
    addSolidQuad('roof_lunette_gable_r', pGableApexFront, pGableRidgeInt, pValleyR, pGableEaveR);

    // Tympanum Wall
    const pTympL = [cfg.gableLeftX, eY, gWallZ];
    const pTympR = [cfg.gableRightX, eY, gWallZ];
    const pTympApex = [gApexX, gApexY, gWallZ];
    addWire('roof_lunette_tymp', pTympL, pTympApex);
    addWire('roof_lunette_tymp', pTympApex, pTympR);
    addWire('roof_lunette_tymp', pTympL, pTympR);
    addSolidTri('roof_lunette_tymp', pTympL, pTympR, pTympApex);

    // Semicircular Lunette Window (Lowered near eave line)
    const winSillY = cfg.windowSillY;                       // 6.65
    const arcRadius = cfg.windowRadius;                     // 1.35
    const arcCenter = [gApexX, winSillY, gWallZ + 0.02];
    const arcSegments = 16;
    const arcPts = [];
    for (let i = 0; i <= arcSegments; i++) {
      const th = Math.PI * (i / arcSegments);
      arcPts.push([
        arcCenter[0] + arcRadius * Math.cos(th),
        arcCenter[1] + arcRadius * Math.sin(th) * 0.85,
        arcCenter[2]
      ]);
    }
    addWire('roof_lunette_window', arcPts[0], arcPts[arcSegments]);
    for (let i = 0; i < arcSegments; i++) {
      addWire('roof_lunette_window', arcPts[i], arcPts[i + 1]);
      if (i > 0 && i % 2 === 0) {
        addWire('roof_lunette_window', arcCenter, arcPts[i]);
      }
    }

    // 5. TALL & BIG DORMER (OFF TO THE SIDE AT x = -0.45)
    const dCX = cfg.dormerCenterX;          // -0.45 (OFF TO THE SIDE OF TOWER AT -1.85)
    const dHW = cfg.dormerWidth * 0.5;      // 1.00 (BIGGER)
    const dFrontZ = cfg.dormerFrontZ;       // 0.40
    const dBaseY = plane.getFrontY(dFrontZ); // ~8.15
    const dApexY = cfg.dormerApexY;         // 9.85
    const dIntZ = plane.getFrontZ(dApexY);  // Valley intersection into roof

    const pDormerApexFront = [dCX, dApexY, dFrontZ];
    const pDormerRidgeInt = [dCX, dApexY, dIntZ];
    const pDormerBaseL = [dCX - dHW, dBaseY, dFrontZ];
    const pDormerBaseR = [dCX + dHW, dBaseY, dFrontZ];

    addWire('roof_dormer_l', pDormerBaseL, pDormerApexFront);
    addWire('roof_dormer_l', pDormerApexFront, pDormerRidgeInt);
    addWire('roof_dormer_l', pDormerRidgeInt, pDormerBaseL);
    addSolidTri('roof_dormer_l', pDormerBaseL, pDormerApexFront, pDormerRidgeInt);

    addWire('roof_dormer_r', pDormerApexFront, pDormerBaseR);
    addWire('roof_dormer_r', pDormerApexFront, pDormerRidgeInt);
    addWire('roof_dormer_r', pDormerRidgeInt, pDormerBaseR);
    addSolidTri('roof_dormer_r', pDormerApexFront, pDormerBaseR, pDormerRidgeInt);

    // Dormer Front Frame & Cutout Notch with Vertical Cheek Lines
    const nHW = cfg.dormerNotchW * 0.5;     // 0.24
    const nH = cfg.dormerNotchH;           // 0.30
    const pSillL = [dCX - dHW, dBaseY, dFrontZ];
    const pNotchBL = [dCX - nHW, dBaseY, dFrontZ];
    const pNotchTL = [dCX - nHW, dBaseY + nH, dFrontZ];
    const pNotchTR = [dCX + nHW, dBaseY + nH, dFrontZ];
    const pNotchBR = [dCX + nHW, dBaseY, dFrontZ];
    const pSillR = [dCX + dHW, dBaseY, dFrontZ];

    addWire('roof_dormer_face', pSillL, pNotchBL);
    addWire('roof_dormer_face', pNotchBL, pNotchTL);
    addWire('roof_dormer_face', pNotchTL, pNotchTR);
    addWire('roof_dormer_face', pNotchTR, pNotchBR);
    addWire('roof_dormer_face', pNotchBR, pSillR);

    // Recessed Window inside Dormer
    const dRecessZ = dFrontZ - 0.20;
    const pRecessL = [dCX - dHW * 0.72, dBaseY + nH, dRecessZ];
    const pRecessR = [dCX + dHW * 0.72, dBaseY + nH, dRecessZ];
    const pRecessApex = [dCX, dApexY - 0.28, dRecessZ];
    addWire('roof_dormer_recess', pRecessL, pRecessApex);
    addWire('roof_dormer_recess', pRecessApex, pRecessR);
    addWire('roof_dormer_recess', pRecessR, pRecessL);
    addSolidTri('roof_dormer_recess', pRecessL, pRecessR, pRecessApex);

    // 6. CONTINUOUS WATERTIGHT FRONT MAIN ROOF
    // Right of Lunette Gable
    const pFrontEaveFarR = [cfg.rightX, eY, fZ];
    addWire('roof_main_front_r', pValleyR, pFrontEaveFarR);
    addWire('roof_main_front_r', pFrontEaveFarR, mainRidgeR);
    addSolidQuad('roof_main_front_r', pValleyR, pFrontEaveFarR, mainRidgeR, [gApexX, rY, rZ]);
    addSolidTri('roof_main_front_r', pGableRidgeInt, [gApexX, rY, rZ], pValleyR);

    // Middle slope between Left Skirt and Lunette Gable
    addWire('roof_main_front_l', pSkirtBotR, pValleyL);
    addSolidQuad('roof_main_front_l', pSkirtBotR, pValleyL, pGableRidgeInt, [lCX + lHW, rY, rZ]);
    addSolidTri('roof_main_front_l', pGableRidgeInt, [gApexX, rY, rZ], [lCX + lHW, rY, rZ]);

    return { plane, cfg };
  }
}

globalThis.RoofBuilder = RoofBuilder;
if (typeof module !== 'undefined' && module.exports) module.exports = RoofBuilder;
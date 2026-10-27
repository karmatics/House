class TowerBuilder {
  constructor() {}

  static drawSingleTower(partBuckets, solidBuckets, opts = {}, roofPlane = null) {
    const {
      prefix = 'tower_l',
      displayName = 'Left Chimney',
      cx = -1.50,
      cz = -1.55,           // Centered on ridge
      shaftHeight = 2.45,
      width = 0.62,          // More slender, matching reference photo
      depth = 0.68,
      channelWidth = 0.16,
      channelDepth = 0.07,
      step1Height = 0.14,
      step1Flare = 0.05,
      step2Height = 0.14,
      corniceFlare = 0.12,
      capPitchH = 0.95,
      roofThickness = 0.065,
      frameWidth = 0.11,
      triRecessDepth = 0.12,
      eaveOverhangX = 0.14,
      eaveOverhangZ = 0.10
    } = opts;

    const add = (subId, p1, p2) => {
      const fullId = prefix + '_' + subId;
      if (!partBuckets[fullId]) partBuckets[fullId] = [];
      partBuckets[fullId].push(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
    };

    const addSolidTri = (subId, p0, p1, p2) => {
      const fullId = prefix + '_' + subId;
      if (!solidBuckets[fullId]) solidBuckets[fullId] = [];
      solidBuckets[fullId].push(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
    };

    const addSolidQuad = (subId, p0, p1, p2, p3) => {
      addSolidTri(subId, p0, p1, p2);
      addSolidTri(subId, p0, p2, p3);
    };

    const hw = width * 0.5;
    const hd = depth * 0.5;

    // SADDLE INTERSECTION SOLVER:
    // Slices dynamically across front and rear roof planes if straddling ridge
    const getRoofY = (z) => {
      if (roofPlane && typeof roofPlane.getY === 'function') {
        return roofPlane.getY(z);
      }
      return 10.40 - Math.abs(z - (-1.55)) * 1.18;
    };

    const shaftTopY = 10.40 + shaftHeight;

    const zColF = cz + hd;
    const zColB = cz - hd;
    const yBaseFront = getRoofY(zColF);
    const yBaseRear = getRoofY(zColB);
    const yBaseRidge = getRoofY(roofPlane ? roofPlane.cfg.ridgeZ : cz);

    const chHW = Math.min(hw - 0.03, Math.max(0.03, channelWidth * 0.5));
    const frontChannelBackZ = cz + hd - channelDepth;
    const rearChannelBackZ = cz - hd + channelDepth;
    const yBaseFrontCh = getRoofY(frontChannelBackZ);
    const yBaseRearCh = getRoofY(rearChannelBackZ);

    const xL = cx - hw;
    const xR = cx + hw;
    const xCutL = cx - chHW;
    const xCutR = cx + chHW;

    // 1. FLASHING SKIRT COLLAR
    const fL = xL - 0.05;
    const fR = xR + 0.05;
    const fF = zColF + 0.05;
    const fB = zColB - 0.05;
    const yF_Front = getRoofY(fF) + 0.02;
    const yF_Rear = getRoofY(fB) + 0.02;

    add('flashing', [fL, yF_Front, fF], [fR, yF_Front, fF]);
    add('flashing', [fR, yF_Front, fF], [fR, yF_Rear, fB]);
    add('flashing', [fR, yF_Rear, fB], [fL, yF_Rear, fB]);
    add('flashing', [fL, yF_Rear, fB], [fL, yF_Front, fF]);
    addSolidQuad('flashing', [fL, yF_Front, fF], [fR, yF_Front, fF], [fR, yF_Rear, fB], [fL, yF_Rear, fB]);

    // 2. SHAFT BODY CHOPPED BY ROOF SADDLE
    // Outer Side Walls
    addSolidQuad('shaft_body', [xR, yBaseFront, zColF], [xR, yBaseRear, zColB], [xR, shaftTopY, zColB], [xR, shaftTopY, zColF]);
    addSolidQuad('shaft_body', [xL, yBaseRear, zColB], [xL, yBaseFront, zColF], [xL, shaftTopY, zColF], [xL, shaftTopY, zColB]);
    add('shaft_body', [xL, yBaseFront, zColF], [xL, shaftTopY, zColF]);
    add('shaft_body', [xR, yBaseFront, zColF], [xR, shaftTopY, zColF]);
    add('shaft_body', [xR, yBaseRear, zColB], [xR, shaftTopY, zColB]);
    add('shaft_body', [xL, yBaseRear, zColB], [xL, shaftTopY, zColB]);

    // Front Face & Vertical Channel
    addSolidQuad('shaft_body', [xL, yBaseFront, zColF], [xCutL, yBaseFront, zColF], [xCutL, shaftTopY, zColF], [xL, shaftTopY, zColF]);
    addSolidQuad('shaft_body', [xCutR, yBaseFront, zColF], [xR, yBaseFront, zColF], [xR, shaftTopY, zColF], [xCutR, shaftTopY, zColF]);
    addSolidQuad('shaft_body', [xCutL, yBaseFront, zColF], [xCutL, yBaseFrontCh, frontChannelBackZ], [xCutL, shaftTopY, frontChannelBackZ], [xCutL, shaftTopY, zColF]);
    addSolidQuad('shaft_body', [xCutR, yBaseFrontCh, frontChannelBackZ], [xCutR, yBaseFront, zColF], [xCutR, shaftTopY, zColF], [xCutR, shaftTopY, frontChannelBackZ]);
    addSolidQuad('shaft_body', [xCutL, yBaseFrontCh, frontChannelBackZ], [xCutR, yBaseFrontCh, frontChannelBackZ], [xCutR, shaftTopY, frontChannelBackZ], [xCutL, shaftTopY, frontChannelBackZ]);

    add('shaft_body', [xCutL, yBaseFront, zColF], [xCutL, shaftTopY, zColF]);
    add('shaft_body', [xCutR, yBaseFront, zColF], [xCutR, shaftTopY, zColF]);
    add('shaft_body', [xCutL, yBaseFrontCh, frontChannelBackZ], [xCutL, shaftTopY, frontChannelBackZ]);
    add('shaft_body', [xCutR, yBaseFrontCh, frontChannelBackZ], [xCutR, shaftTopY, frontChannelBackZ]);

    // Rear Face & Vertical Channel
    addSolidQuad('shaft_body', [xCutL, yBaseRear, zColB], [xL, yBaseRear, zColB], [xL, shaftTopY, zColB], [xCutL, shaftTopY, zColB]);
    addSolidQuad('shaft_body', [xR, yBaseRear, zColB], [xCutR, yBaseRear, zColB], [xCutR, shaftTopY, zColB], [xR, shaftTopY, zColB]);
    addSolidQuad('shaft_body', [xCutL, yBaseRearCh, rearChannelBackZ], [xCutL, yBaseRear, zColB], [xCutL, shaftTopY, zColB], [xCutL, shaftTopY, rearChannelBackZ]);
    addSolidQuad('shaft_body', [xCutR, yBaseRear, zColB], [xCutR, yBaseRearCh, rearChannelBackZ], [xCutR, shaftTopY, rearChannelBackZ], [xCutR, shaftTopY, zColB]);
    addSolidQuad('shaft_body', [xCutR, yBaseRearCh, rearChannelBackZ], [xCutL, yBaseRearCh, rearChannelBackZ], [xCutL, shaftTopY, rearChannelBackZ], [xCutR, shaftTopY, rearChannelBackZ]);

    add('shaft_body', [xCutL, yBaseRear, zColB], [xCutL, shaftTopY, zColB]);
    add('shaft_body', [xCutR, yBaseRear, zColB], [xCutR, shaftTopY, zColB]);
    add('shaft_body', [xCutL, yBaseRearCh, rearChannelBackZ], [xCutL, shaftTopY, rearChannelBackZ]);
    add('shaft_body', [xCutR, yBaseRearCh, rearChannelBackZ], [xCutR, shaftTopY, rearChannelBackZ]);

    // 3. STEPPED ABACUS CAPITAL (Step 1 & Step 2)
    const drawCutStep = (yBottom, yTop, hwStep, hdStep) => {
      const xStepL = cx - hwStep;
      const xStepR = cx + hwStep;
      const zStepF = cz + hdStep;
      const zStepB = cz - hdStep;

      const ring = (y) => [
        [xStepL, y, zStepB], [xCutL, y, zStepB], [xCutL, y, rearChannelBackZ],
        [xCutR, y, rearChannelBackZ], [xCutR, y, zStepB], [xStepR, y, zStepB],
        [xStepR, y, zStepF], [xCutR, y, zStepF], [xCutR, y, frontChannelBackZ],
        [xCutL, y, frontChannelBackZ], [xCutL, y, zStepF], [xStepL, y, zStepF]
      ];

      const bPts = ring(yBottom);
      const tPts = ring(yTop);

      for (let i = 0; i < bPts.length; i++) {
        const next = (i + 1) % bPts.length;
        add('cornice', bPts[i], bPts[next]);
        add('cornice', tPts[i], tPts[next]);
        add('cornice', bPts[i], tPts[i]);
        addSolidQuad('cornice', bPts[i], bPts[next], tPts[next], tPts[i]);
      }
      return { bPts, tPts, zStepF, zStepB, xStepL, xStepR };
    };

    const yStep1Bottom = shaftTopY;
    const yStep1Top = yStep1Bottom + step1Height;
    const hw1 = hw + step1Flare;
    const hd1 = hd + step1Flare;
    const s1 = drawCutStep(yStep1Bottom, yStep1Top, hw1, hd1);

    const yStep2Bottom = yStep1Top;
    const yStep2Top = yStep2Bottom + step2Height;
    const hw2 = hw + corniceFlare;
    const hd2 = hd + corniceFlare;
    const s2 = drawCutStep(yStep2Bottom, yStep2Top, hw2, hd2);

    addSolidQuad('cornice', [s2.xStepL, yStep2Top, frontChannelBackZ], [xCutL, yStep2Top, frontChannelBackZ], [xCutL, yStep2Top, s2.zStepF], [s2.xStepL, yStep2Top, s2.zStepF]);
    addSolidQuad('cornice', [xCutR, yStep2Top, frontChannelBackZ], [s2.xStepR, yStep2Top, frontChannelBackZ], [s2.xStepR, yStep2Top, s2.zStepF], [xCutR, yStep2Top, s2.zStepF]);
    addSolidQuad('cornice', [s2.xStepL, yStep2Top, s2.zStepB], [xCutL, yStep2Top, s2.zStepB], [xCutL, yStep2Top, rearChannelBackZ], [s2.xStepL, yStep2Top, rearChannelBackZ]);
    addSolidQuad('cornice', [xCutR, yStep2Top, s2.zStepB], [s2.xStepR, yStep2Top, s2.zStepB], [s2.xStepR, yStep2Top, rearChannelBackZ], [xCutR, yStep2Top, rearChannelBackZ]);

    // 4. SOLID GABLE ROOF
    const yFloor = yStep2Top;
    const W_soffit = hw2 + eaveOverhangX;
    const H_soffit = capPitchH;
    const slope = H_soffit / W_soffit;
    const theta = Math.atan(slope);
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const zFrontBarge = cz + hd2 + eaveOverhangZ;
    const zRearBarge = cz - hd2 - eaveOverhangZ;
    const zFrontWall = cz + hd2;
    const zRearWall = cz - hd2;

    const dYApex = roofThickness / cosT;
    const yApexTop = yFloor + H_soffit + dYApex;
    const yApexSoffit = yFloor + H_soffit;
    const dxEave = roofThickness * sinT;
    const dyEave = roofThickness * cosT;

    const xTopEaveL = cx - W_soffit - dxEave;
    const xTopEaveR = cx + W_soffit + dxEave;
    const yTopEave = yFloor + dyEave;
    const xSoffEaveL = cx - W_soffit;
    const xSoffEaveR = cx + W_soffit;
    const ySoffEave = yFloor;

    const pTopApexF = [cx, yApexTop, zFrontBarge];
    const pTopApexR = [cx, yApexTop, zRearBarge];
    const pTopLF = [xTopEaveL, yTopEave, zFrontBarge];
    const pTopLR = [xTopEaveL, yTopEave, zRearBarge];
    const pTopRF = [xTopEaveR, yTopEave, zFrontBarge];
    const pTopRR = [xTopEaveR, yTopEave, zRearBarge];

    addSolidQuad('cap_roof', pTopLF, pTopLR, pTopApexR, pTopApexF);
    addSolidQuad('cap_roof', pTopApexF, pTopApexR, pTopRR, pTopRF);
    addSolidQuad('cap_roof', pTopLF, [xSoffEaveL, ySoffEave, zFrontBarge], [xSoffEaveL, ySoffEave, zRearBarge], pTopLR);
    addSolidQuad('cap_roof', pTopRR, [xSoffEaveR, ySoffEave, zRearBarge], [xSoffEaveR, ySoffEave, zFrontBarge], pTopRF);

    [
      { zB: zFrontBarge, zW: zFrontWall, isF: true },
      { zB: zRearBarge, zW: zRearWall, isF: false }
    ].forEach(({ zB, zW, isF }) => {
      const aT = [cx, yApexTop, zB];
      const lT = [xTopEaveL, yTopEave, zB];
      const rT = [xTopEaveR, yTopEave, zB];
      const aS = [cx, yApexSoffit, zB];
      const lS = [xSoffEaveL, ySoffEave, zB];
      const rS = [xSoffEaveR, ySoffEave, zB];

      if (isF) {
        addSolidQuad('cap_roof', lT, lS, aS, aT);
        addSolidQuad('cap_roof', aT, aS, rS, rT);
      } else {
        addSolidQuad('cap_roof', lS, lT, aT, aS);
        addSolidQuad('cap_roof', aS, aT, rT, rS);
      }
      addSolidQuad('cap_roof', lS, [xSoffEaveL, ySoffEave, zW], [cx, yApexSoffit, zW], aS);
      addSolidQuad('cap_roof', aS, [cx, yApexSoffit, zW], [xSoffEaveR, ySoffEave, zW], rS);

      add('cap_roof', lT, aT); add('cap_roof', rT, aT);
      add('cap_roof', lS, aS); add('cap_roof', rS, aS);
      add('cap_roof', lT, lS); add('cap_roof', rT, rS);
    });

    add('cap_roof', pTopApexF, pTopApexR);
    add('cap_roof', pTopLF, pTopLR);
    add('cap_roof', pTopRF, pTopRR);

    // 5. MOTIF HOOD & RECESSED TYMPANUM
    const maxT = (H_soffit / (1 + 1 / cosT)) * 0.85;
    const T = Math.min(maxT, Math.max(0.04, frameWidth));
    const yInnerApex = yFloor + H_soffit - (T / cosT);
    const cotHalfTheta = (1 + cosT) / sinT;
    const xCornerDist = W_soffit - (T * cotHalfTheta);

    const drawMotifGable = (isFront) => {
      const signZ = isFront ? 1 : -1;
      const zW = isFront ? zFrontWall : zRearWall;
      const zTymp = zW - signZ * triRecessDepth;

      const pOutApex = [cx, yApexSoffit, zW];
      const pOutL = [cx - W_soffit, yFloor, zW];
      const pOutR = [cx + W_soffit, yFloor, zW];
      const pInApex = [cx, yInnerApex, zW];
      const pInCornerL = [cx - xCornerDist, yFloor + T, zW];
      const pInCornerR = [cx + xCornerDist, yFloor + T, zW];
      const pSillBotL = [xCutL, yFloor, zW];
      const pSillBotR = [xCutR, yFloor, zW];
      const pSillTopL = [xCutL, yFloor + T, zW];
      const pSillTopR = [xCutR, yFloor + T, zW];

      if (isFront) {
        addSolidQuad('opening_hood', pOutL, pSillBotL, pSillTopL, pInCornerL);
        addSolidQuad('opening_hood', pSillBotR, pOutR, pInCornerR, pSillTopR);
        addSolidQuad('opening_hood', pOutL, pInCornerL, pInApex, pOutApex);
        addSolidQuad('opening_hood', pInCornerR, pOutR, pOutApex, pInApex);
      } else {
        addSolidQuad('opening_hood', pSillBotL, pOutL, pInCornerL, pSillTopL);
        addSolidQuad('opening_hood', pOutR, pSillBotR, pSillTopR, pInCornerR);
        addSolidQuad('opening_hood', pInCornerL, pOutL, pOutApex, pInApex);
        addSolidQuad('opening_hood', pOutR, pInCornerR, pInApex, pOutApex);
      }

      add('opening_hood', pOutL, pOutApex); add('opening_hood', pOutR, pOutApex);
      add('opening_hood', pOutL, pSillBotL); add('opening_hood', pOutR, pSillBotR);
      add('opening_hood', pOutL, pInCornerL); add('opening_hood', pOutR, pInCornerR);
      add('opening_hood', pInApex, pOutApex);
      add('opening_hood', pInCornerL, pInApex); add('opening_hood', pInCornerR, pInApex);
      add('opening_hood', pInCornerL, pSillTopL); add('opening_hood', pInCornerR, pSillTopR);
      add('opening_hood', pSillBotL, pSillTopL); add('opening_hood', pSillBotR, pSillTopR);

      const pB_Apex = [cx, yInnerApex, zTymp];
      const pB_CornerL = [cx - xCornerDist, yFloor + T, zTymp];
      const pB_CornerR = [cx + xCornerDist, yFloor + T, zTymp];
      const pB_SillTopL = [xCutL, yFloor + T, zTymp];
      const pB_SillTopR = [xCutR, yFloor + T, zTymp];
      const pB_SillBotL = [xCutL, yFloor, zTymp];
      const pB_SillBotR = [xCutR, yFloor, zTymp];

      if (isFront) {
        addSolidTri('motif_back', pB_CornerL, pB_CornerR, pB_Apex);
        addSolidQuad('motif_back', pB_SillBotL, pB_SillBotR, pB_SillTopR, pB_SillTopL);
        addSolidQuad('opening_hood', pInCornerL, pB_CornerL, pB_Apex, pInApex);
        addSolidQuad('opening_hood', pInApex, pB_Apex, pB_CornerR, pInCornerR);
        addSolidQuad('opening_hood', pSillTopL, pInCornerL, pB_CornerL, pB_SillTopL);
        addSolidQuad('opening_hood', pInCornerR, pSillTopR, pB_SillTopR, pB_CornerR);
        addSolidQuad('opening_hood', pSillBotL, pSillTopL, pB_SillTopL, pB_SillBotL);
        addSolidQuad('opening_hood', pSillTopR, pSillBotR, pB_SillBotR, pB_SillTopR);
      } else {
        addSolidTri('motif_back', pB_CornerR, pB_CornerL, pB_Apex);
        addSolidQuad('motif_back', pB_SillBotR, pB_SillBotL, pB_SillTopL, pB_SillTopR);
        addSolidQuad('opening_hood', pB_CornerL, pInCornerL, pInApex, pB_Apex);
        addSolidQuad('opening_hood', pB_Apex, pInApex, pInCornerR, pB_CornerR);
        addSolidQuad('opening_hood', pInCornerL, pSillTopL, pB_SillTopL, pB_CornerL);
        addSolidQuad('opening_hood', pSillTopR, pInCornerR, pB_CornerR, pB_SillTopR);
        addSolidQuad('opening_hood', pSillTopL, pSillBotL, pB_SillBotL, pB_SillTopL);
        addSolidQuad('opening_hood', pSillBotR, pSillTopR, pB_SillTopR, pB_SillBotR);
      }

      add('motif_back', pB_CornerL, pB_Apex); add('motif_back', pB_CornerR, pB_Apex);
      add('motif_back', pB_CornerL, pB_SillTopL); add('motif_back', pB_CornerR, pB_SillTopR);
      add('motif_back', pB_SillTopL, pB_SillBotL); add('motif_back', pB_SillBotR, pB_SillBotR);
    };

    drawMotifGable(true);
    drawMotifGable(false);
  }

  static drawTowers(partBuckets, solidBuckets, THREE, customConfig = {}, roofPlane = null) {
      const config = Object.assign({
        towerLeftX: -1.85,    // Chimney sits back at -1.85, dormer is off to side at -0.45
        towerLeftZ: -1.55,
        towerRightX: 1.85,
        towerRightZ: -1.55,
        width: 0.60,
        depth: 0.66,
        shaftHeight: 2.35,
        channelWidth: 0.16,
        channelDepth: 0.07,
        step1Height: 0.14,
        step1Flare: 0.05,
        step2Height: 0.14,
        corniceFlare: 0.12,
        capPitchH: 0.95,
        roofThickness: 0.065,
        frameWidth: 0.11,
        triRecessDepth: 0.12,
        eaveOverhangX: 0.14,
        eaveOverhangZ: 0.10
      }, customConfig);

      // Left Chimney (Positioned at x = -1.85)
      TowerBuilder.drawSingleTower(partBuckets, solidBuckets, {
        prefix: 'tower_l',
        displayName: 'Left Chimney',
        cx: config.towerLeftX,
        cz: config.towerLeftZ,
        ...config
      }, roofPlane);

      // Right Chimney (Positioned at x = 1.85)
      TowerBuilder.drawSingleTower(partBuckets, solidBuckets, {
        prefix: 'tower_r',
        displayName: 'Right Chimney',
        cx: config.towerRightX,
        cz: config.towerRightZ,
        ...config
      }, roofPlane);
    }
}

globalThis.TowerBuilder = TowerBuilder;
if (typeof module !== 'undefined' && module.exports) module.exports = TowerBuilder;
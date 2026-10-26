class Simple3dShapes {
  constructor() {}

  static buildPrimitives(app, scene, towerConfig = {}) {
    const THREE = app.THREE;
    const meshes = [];
    const solidMeshes = [];

    // Wireframe line buckets
    const partBuckets = {
      cap_roof: [],
      opening_hood: [],
      cornice: [],
      shaft_body: [],
      shaft_panels: [],
      flashing: [],
      house_roof: [],
      house_massing: [],
      house_openings: [],
      house_pergola: [],
      house_stairs: [],
      house_ground: []
    };

    // Solid polygon face buckets
    const solidBuckets = {
      cap_roof: [],
      opening_hood: [],
      cornice: [],
      shaft_body: [],
      flashing: []
    };

    const addSeg = (bucketKey, p1, p2) => {
      if (!partBuckets[bucketKey]) partBuckets[bucketKey] = [];
      partBuckets[bucketKey].push(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
    };

    const addBoxLines = (bucketKey, x1, y1, z1, x2, y2, z2) => {
      addSeg(bucketKey, [x1, y1, z1], [x2, y1, z1]);
      addSeg(bucketKey, [x2, y1, z1], [x2, y1, z2]);
      addSeg(bucketKey, [x2, y1, z2], [x1, y1, z2]);
      addSeg(bucketKey, [x1, y1, z2], [x1, y1, z1]);
      addSeg(bucketKey, [x1, y2, z1], [x2, y2, z1]);
      addSeg(bucketKey, [x2, y2, z1], [x2, y2, z2]);
      addSeg(bucketKey, [x2, y2, z2], [x1, y2, z2]);
      addSeg(bucketKey, [x1, y2, z2], [x1, y2, z1]);
      addSeg(bucketKey, [x1, y1, z1], [x1, y2, z1]);
      addSeg(bucketKey, [x2, y1, z1], [x2, y2, z1]);
      addSeg(bucketKey, [x2, y1, z2], [x2, y2, z2]);
      addSeg(bucketKey, [x1, y1, z2], [x1, y2, z2]);
    };

    // 1. PRIMARY MASSING
    addBoxLines('house_massing', -5.0, 0.0, -5.5, 0.8, 3.2, 1.2);
    addBoxLines('house_massing', -5.0, 3.2, -5.5, 0.8, 6.2, 1.2);
    addBoxLines('house_massing', 0.8, 0.0, -5.5, 7.0, 3.2, 1.2);
    addBoxLines('house_massing', 0.8, 3.2, -5.5, 7.0, 6.2, 1.2);
    addBoxLines('house_massing', -5.0, -2.6, -5.5, 7.0, 0.0, 1.2);
    addBoxLines('house_massing', 1.0, 0.0, 1.2, 5.4, 3.2, 2.8);
    addBoxLines('house_massing', 1.0, 3.2, 1.2, 5.4, 6.2, 2.8);
    addBoxLines('house_massing', 1.0, -2.6, 1.2, 5.4, 0.0, 2.8);

    const addSlabProfile = (yLevel) => {
      addSeg('house_massing', [-5.1, yLevel, 1.3], [1.0, yLevel, 1.3]);
      addSeg('house_massing', [1.0, yLevel, 1.3], [1.0, yLevel, 2.9]);
      addSeg('house_massing', [1.0, yLevel, 2.9], [5.4, yLevel, 2.9]);
      addSeg('house_massing', [5.4, yLevel, 2.9], [5.4, yLevel, 1.3]);
      addSeg('house_massing', [5.4, yLevel, 1.3], [7.1, yLevel, 1.3]);
    };
    addSlabProfile(0.0);
    addSlabProfile(3.2);
    addSlabProfile(6.2);

    addBoxLines('house_massing', -5.4, 3.15, 1.2, -1.2, 3.25, 2.2);
    addSeg('house_massing', [-5.4, 4.15, 1.2], [-5.4, 4.15, 2.2]);
    addSeg('house_massing', [-5.4, 4.15, 2.2], [-1.2, 4.15, 2.2]);
    addSeg('house_massing', [-1.2, 4.15, 2.2], [-1.2, 4.15, 1.2]);
    addSeg('house_massing', [1.0, 4.15, 2.95], [5.4, 4.15, 2.95]);

    // 2. MAIN HOUSE ROOF LINES
    const ridgeY = 10.4;
    const ridgeZ = -1.6;
    const mainRidgeLeft = [-5.6, ridgeY, ridgeZ];
    const mainRidgeRight = [7.6, ridgeY, ridgeZ];
    addSeg('house_roof', mainRidgeLeft, mainRidgeRight);

    const eaveY = 6.2;
    const frontEaveZ = 1.7;
    const rearEaveZ = -6.0;
    addSeg('house_roof', [-5.6, eaveY, frontEaveZ], [-3.8, eaveY, frontEaveZ]);
    addSeg('house_roof', [-1.0, eaveY, frontEaveZ], [1.0, eaveY, frontEaveZ]);
    addSeg('house_roof', [5.4, eaveY, frontEaveZ], [7.6, eaveY, frontEaveZ]);
    addSeg('house_roof', [-5.6, eaveY, rearEaveZ], [7.6, eaveY, rearEaveZ]);
    addSeg('house_roof', [-5.6, eaveY, frontEaveZ], mainRidgeLeft);
    addSeg('house_roof', [-5.6, eaveY, rearEaveZ], mainRidgeLeft);
    addSeg('house_roof', [7.6, eaveY, frontEaveZ], mainRidgeRight);
    addSeg('house_roof', [7.6, eaveY, rearEaveZ], mainRidgeRight);

    // Front Gable
    const gableApex = [4.2, 11.2, 3.4];
    addSeg('house_roof', [1.0, 6.4, 3.4], gableApex);
    addSeg('house_roof', [5.6, 6.4, 3.4], gableApex);
    addSeg('house_roof', [1.0, 6.4, 3.4], [5.6, 6.4, 3.4]);
    addSeg('house_roof', gableApex, [4.2, 11.2, ridgeZ]);
    addSeg('house_roof', [1.0, 6.4, frontEaveZ], [4.2, 11.2, ridgeZ]);
    addSeg('house_roof', [5.6, 6.4, frontEaveZ], [4.2, 11.2, ridgeZ]);

    // Arched Lunette Window
    const arcCenter = [4.2, 8.6, 3.38];
    const arcRadius = 1.0;
    const arcPts = [];
    for (let i = 0; i <= 12; i++) {
      const th = Math.PI * (i / 12);
      arcPts.push([arcCenter[0] + arcRadius * Math.cos(th), arcCenter[1] + arcRadius * Math.sin(th) * 0.85, arcCenter[2]]);
    }
    addSeg('house_roof', arcPts[0], arcPts[12]);
    for (let i = 0; i < 12; i++) addSeg('house_roof', arcPts[i], arcPts[i + 1]);

    // Left Dormer
    const dormerApex = [-2.4, 9.4, 1.9];
    addSeg('house_roof', [-3.8, 6.6, 1.9], dormerApex);
    addSeg('house_roof', [-1.0, 6.6, 1.9], dormerApex);
    addSeg('house_roof', [-3.8, 6.6, 1.9], [-1.0, 6.6, 1.9]);
    addSeg('house_roof', dormerApex, [-2.4, 9.4, 0.0]);
    addSeg('house_roof', [-3.8, 6.6, 1.9], [-2.4, 9.4, 0.0]);
    addSeg('house_roof', [-1.0, 6.6, 1.9], [-2.4, 9.4, 0.0]);

    // BUILD THE TOWERS
    Simple3dShapes.drawTowers(partBuckets, solidBuckets, THREE, towerConfig);

    // 3. PERGOLA & DECK
    addBoxLines('house_pergola', -10.6, -0.25, -3.0, -4.9, 0.0, 3.2);
    addSeg('house_pergola', [-10.6, 1.0, -3.0], [-10.6, 1.0, 3.2]);
    addSeg('house_pergola', [-10.6, 1.0, 3.2], [-4.9, 1.0, 3.2]);
    addBoxLines('house_pergola', -10.6, 2.65, 2.88, -4.8, 2.85, 3.12);
    addBoxLines('house_pergola', -10.6, 2.65, -2.92, -4.8, 2.85, -2.68);
    for (let i = 0; i < 9; i++) {
      const rx = -10.4 + i * (5.3 / 8);
      addBoxLines('house_pergola', rx - 0.04, 2.85, -3.3, rx + 0.04, 3.02, 3.5);
    }

    // 4. WINDOW OPENINGS
    [1.2, 2.2, 3.2, 4.2, 5.2].forEach(mx => {
      addSeg('house_openings', [mx, 0.0, 2.8], [mx, 3.2, 2.8]);
      addSeg('house_openings', [mx, 3.2, 2.8], [mx, 6.2, 2.8]);
    });
    addSeg('house_openings', [1.0, 2.1, 2.8], [5.4, 2.1, 2.8]);
    addSeg('house_openings', [1.0, 5.2, 2.8], [5.4, 5.2, 2.8]);

    // 5. STAIRCASE
    const startPt = [6.2, 0.0, 1.5];
    const endPt = [9.4, -2.6, 6.8];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const x = startPt[0] + (endPt[0] - startPt[0]) * t;
      const y = startPt[1] + (endPt[1] - startPt[1]) * t;
      const z = startPt[2] + (endPt[2] - startPt[2]) * t;
      addSeg('house_stairs', [x, y, z], [x - 1.1, y, z + 1.1]);
    }
    addSeg('house_stairs', [startPt[0], 0.9, startPt[2]], [endPt[0], -1.7, endPt[2]]);

    // 6. LOOSE GROUND
    addSeg('house_ground', [7.0, -0.1, -5.5], [11.5, -0.5, 0.0]);
    addSeg('house_ground', [11.5, -0.5, 0.0], [10.2, -1.4, 3.5]);
    addSeg('house_ground', [-6.0, -2.6, 7.5], [11.0, -2.6, 7.5]);

    // REFINED PART DEFINITIONS
    const definitions = [
      { id: 'cap_roof', name: 'Gable Roof & Shingles', color: 0x00f2fe, solidColor: 0x3d4852, isTower: true },
      { id: 'opening_hood', name: 'Recessed Triangle Motif', color: 0xffb74d, solidColor: 0xd4a373, isTower: true },
      { id: 'cornice', name: 'Stepped Abacus with Cutout', color: 0x2ecc71, solidColor: 0xe6e4db, isTower: true },
      { id: 'shaft_body', name: 'Shaft with Vertical Channel', color: 0xdfe6e9, solidColor: 0xdcdde1, isTower: true },
      { id: 'shaft_panels', name: 'Recessed X-Brace Panels', color: 0xa29bfe, solidColor: 0xb2bec3, isTower: true },
      { id: 'flashing', name: 'Roof Flashing Skirt', color: 0xfd79a8, solidColor: 0x718093, isTower: true },
      { id: 'house_roof', name: 'Main House Roof', color: 0x58a6ff, isTower: false },
      { id: 'house_massing', name: 'House Volumes & Slabs', color: 0x8b949e, isTower: false },
      { id: 'house_openings', name: 'House Glazing & Mullions', color: 0x79c0ff, isTower: false },
      { id: 'house_pergola', name: 'Pergola & Cantilever Deck', color: 0xd29922, isTower: false },
      { id: 'house_stairs', name: 'Exterior Staircase & Rail', color: 0x3fb950, isTower: false },
      { id: 'house_ground', name: 'Loose Ground Slope', color: 0x484f58, isTower: false }
    ];

    const houseGroup = new THREE.Group();
    houseGroup.name = 'HouseWireframe';

    // Build Solid Meshes
    definitions.forEach(def => {
      const tris = solidBuckets[def.id];
      if (!tris || tris.length === 0) return;

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(tris, 3));
      geom.computeVertexNormals();

      const mat = new THREE.MeshLambertMaterial({
        color: def.solidColor || 0xcccccc,
        transparent: true,
        opacity: 0.94,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.name = def.name + ' [Solid]';
      mesh.userData = {
        partId: def.id,
        partName: def.name,
        baseColor: def.color,
        isSolid: true,
        isTower: def.isTower
      };

      houseGroup.add(mesh);
      solidMeshes.push(mesh);
    });

    // Build Wireframe Line Meshes
    definitions.forEach(def => {
      const lineData = partBuckets[def.id];
      if (!lineData || lineData.length === 0) return;

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(lineData, 3));
      const mat = new THREE.LineBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: def.id === 'house_ground' ? 0.4 : 0.95,
        linewidth: def.isTower ? 1.5 : 1
      });

      const lineMesh = new THREE.LineSegments(geom, mat);
      lineMesh.name = def.name + ' [Wire]';
      lineMesh.userData = {
        partId: def.id,
        partName: def.name,
        baseColor: def.color,
        isSolid: false,
        isTower: def.isTower
      };

      houseGroup.add(lineMesh);
      meshes.push(lineMesh);
    });

    scene.add(houseGroup);

    const grid = new THREE.GridHelper(24, 24, 0x30363d, 0x161b22);
    grid.position.y = -2.61;
    grid.visible = true;
    scene.add(grid);

    return { meshes, solidMeshes, grid, houseGroup };
  }

  static drawSingleTower(partBuckets, solidBuckets, opts = {}) {
    const {
      cx = 0,
      cyBase = 9.15,
      cz = -0.75,
      width = 0.84,          // Shaft width (X)
      depth = 0.88,          // Shaft depth (Z)
      shaftHeight = 2.45,    // Shaft height from base to capital
      channelWidth = 0.22,   // Width of the continuous vertical channel
      channelDepth = 0.08,   // Depth of the channel cutting into front face
      step1Height = 0.16,    // Height of lower abacus collar (Step 1)
      step1Flare = 0.08,     // Flare projection of Step 1
      step2Height = 0.18,    // Height of upper abacus shelf (Step 2)
      corniceFlare = 0.16,   // Total flare projection of Step 2
      capPitchH = 1.15,      // Gable roof apex height above abacus
      roofThickness = 0.08,  // Perpendicular thickness of the 3D roof slab
      frameWidth = 0.12,     // Uniform width of the Christmas tree frame on all 3 sides
      splitHeight = 0.18,    // Height of the split cut into base of motif
      triRecessDepth = 0.08, // Inward recess depth of the tympanum back wall
      eaveOverhangX = 0.18,  // Roof side eave overhang X
      eaveOverhangZ = 0.14   // Roof bargeboard rake overhang Z
    } = opts;

    // --- Wireframe line helper ---
    const add = (partId, p1, p2) => {
      if (!partBuckets[partId]) partBuckets[partId] = [];
      partBuckets[partId].push(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
    };

    // --- Solid polygon helpers (CCW order) ---
    const addSolidTri = (partId, p0, p1, p2) => {
      if (!solidBuckets[partId]) solidBuckets[partId] = [];
      solidBuckets[partId].push(
        p0[0], p0[1], p0[2],
        p1[0], p1[1], p1[2],
        p2[0], p2[1], p2[2]
      );
    };

    const addSolidQuad = (partId, p0, p1, p2, p3) => {
      addSolidTri(partId, p0, p1, p2);
      addSolidTri(partId, p0, p2, p3);
    };

    const hw = width * 0.5;
    const hd = depth * 0.5;
    const shaftTopY = cyBase + shaftHeight;

    // Central continuous vertical channel geometry
    const chHW = Math.min(hw - 0.04, Math.max(0.04, channelWidth * 0.5));
    const channelBackZ = cz + hd - channelDepth;

    // -------------------------------------------------------------------------
    // 1. FLASHING SKIRT (ID: "flashing")
    // -------------------------------------------------------------------------
    const flashFrontY = cyBase;
    const flashRearY = cyBase + depth * 0.42;
    const fL = cx - hw - 0.06;
    const fR = cx + hw + 0.06;
    const fF = cz + hd + 0.06;
    const fB = cz - hd - 0.06;

    add('flashing', [fL, flashFrontY, fF], [fR, flashFrontY, fF]);
    add('flashing', [fR, flashFrontY, fF], [fR, flashRearY, fB]);
    add('flashing', [fR, flashRearY, fB], [fL, flashRearY, fB]);
    add('flashing', [fL, flashRearY, fB], [fL, flashFrontY, fF]);

    addSolidQuad('flashing', [fL, flashFrontY, fF], [fR, flashFrontY, fF], [fR, flashRearY, fB], [fL, flashRearY, fB]);

    // -------------------------------------------------------------------------
    // 2. SHAFT BODY WITH CONTINUOUS RECESSED CHANNEL (ID: "shaft_body")
    // -------------------------------------------------------------------------
    add('shaft_body', [cx - hw, flashFrontY, cz + hd], [cx - hw, shaftTopY, cz + hd]);
    add('shaft_body', [cx + hw, flashFrontY, cz + hd], [cx + hw, shaftTopY, cz + hd]);
    add('shaft_body', [cx + hw, flashRearY, cz - hd], [cx + hw, shaftTopY, cz - hd]);
    add('shaft_body', [cx - hw, flashRearY, cz - hd], [cx - hw, shaftTopY, cz - hd]);

    // Sides & back solid faces
    addSolidQuad('shaft_body', [cx + hw, flashFrontY, cz + hd], [cx + hw, flashRearY, cz - hd], [cx + hw, shaftTopY, cz - hd], [cx + hw, shaftTopY, cz + hd]);
    addSolidQuad('shaft_body', [cx + hw, flashRearY, cz - hd], [cx - hw, flashRearY, cz - hd], [cx - hw, shaftTopY, cz - hd], [cx + hw, shaftTopY, cz - hd]);
    addSolidQuad('shaft_body', [cx - hw, flashRearY, cz - hd], [cx - hw, flashFrontY, cz + hd], [cx - hw, shaftTopY, cz + hd], [cx - hw, shaftTopY, cz - hd]);

    // Front face with recessed channel
    const xL = cx - hw;
    const xR = cx + hw;
    const xCutL = cx - chHW;
    const xCutR = cx + chHW;
    const zColF = cz + hd;

    addSolidQuad('shaft_body', [xL, flashFrontY, zColF], [xCutL, flashFrontY, zColF], [xCutL, shaftTopY, zColF], [xL, shaftTopY, zColF]);
    addSolidQuad('shaft_body', [xCutR, flashFrontY, zColF], [xR, flashFrontY, zColF], [xR, shaftTopY, zColF], [xCutR, shaftTopY, zColF]);

    addSolidQuad('shaft_body', [xCutL, flashFrontY, zColF], [xCutL, flashFrontY, channelBackZ], [xCutL, shaftTopY, channelBackZ], [xCutL, shaftTopY, zColF]);
    addSolidQuad('shaft_body', [xCutR, flashFrontY, channelBackZ], [xCutR, flashFrontY, zColF], [xCutR, shaftTopY, zColF], [xCutR, shaftTopY, channelBackZ]);
    addSolidQuad('shaft_body', [xCutL, flashFrontY, channelBackZ], [xCutR, flashFrontY, channelBackZ], [xCutR, shaftTopY, channelBackZ], [xCutL, shaftTopY, channelBackZ]);

    add('shaft_body', [xCutL, flashFrontY, zColF], [xCutL, shaftTopY, zColF]);
    add('shaft_body', [xCutR, flashFrontY, zColF], [xCutR, shaftTopY, zColF]);
    add('shaft_body', [xCutL, flashFrontY, channelBackZ], [xCutL, shaftTopY, channelBackZ]);
    add('shaft_body', [xCutR, flashFrontY, channelBackZ], [xCutR, shaftTopY, channelBackZ]);

    // -------------------------------------------------------------------------
    // 3. STEPPED CAPITAL (STEP 1 & STEP 2) WITH UNIFIED CUTOUT (ID: "cornice")
    // -------------------------------------------------------------------------
    const drawCutStep = (yBottom, yTop, hwStep, hdStep) => {
      const xStepL = cx - hwStep;
      const xStepR = cx + hwStep;
      const zStepF = cz + hdStep;
      const zStepB = cz - hdStep;

      const ring = (y) => [
        [xStepL, y, zStepB],
        [xStepR, y, zStepB],
        [xStepR, y, zStepF],
        [xCutR, y, zStepF],
        [xCutR, y, channelBackZ],
        [xCutL, y, channelBackZ],
        [xCutL, y, zStepF],
        [xStepL, y, zStepF]
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

    // STEP 1
    const yStep1Bottom = shaftTopY;
    const yStep1Top = yStep1Bottom + step1Height;
    const hw1 = hw + step1Flare;
    const hd1 = hd + step1Flare;
    const step1Geom = drawCutStep(yStep1Bottom, yStep1Top, hw1, hd1);

    addSolidQuad('cornice', [step1Geom.xStepL, yStep1Bottom, step1Geom.zStepB], [step1Geom.xStepR, yStep1Bottom, step1Geom.zStepB], [xR, yStep1Bottom, cz - hd], [xL, yStep1Bottom, cz - hd]);
    addSolidQuad('cornice', [step1Geom.xStepL, yStep1Bottom, step1Geom.zStepB], [xL, yStep1Bottom, cz - hd], [xL, yStep1Bottom, zColF], [step1Geom.xStepL, yStep1Bottom, step1Geom.zStepF]);
    addSolidQuad('cornice', [xR, yStep1Bottom, cz - hd], [step1Geom.xStepR, yStep1Bottom, step1Geom.zStepB], [step1Geom.xStepR, yStep1Bottom, step1Geom.zStepF], [xR, yStep1Bottom, zColF]);
    addSolidQuad('cornice', [step1Geom.xStepL, yStep1Bottom, zColF], [xCutL, yStep1Bottom, zColF], [xCutL, yStep1Bottom, step1Geom.zStepF], [step1Geom.xStepL, yStep1Bottom, step1Geom.zStepF]);
    addSolidQuad('cornice', [xCutR, yStep1Bottom, zColF], [step1Geom.xStepR, yStep1Bottom, zColF], [step1Geom.xStepR, yStep1Bottom, step1Geom.zStepF], [xCutR, yStep1Bottom, step1Geom.zStepF]);

    // STEP 2
    const yStep2Bottom = yStep1Top;
    const yStep2Top = yStep2Bottom + step2Height;
    const hw2 = hw + corniceFlare;
    const hd2 = hd + corniceFlare;
    const step2Geom = drawCutStep(yStep2Bottom, yStep2Top, hw2, hd2);

    addSolidQuad('cornice', [step2Geom.xStepL, yStep2Bottom, step2Geom.zStepB], [step2Geom.xStepR, yStep2Bottom, step2Geom.zStepB], [step1Geom.xStepR, yStep2Bottom, step1Geom.zStepB], [step1Geom.xStepL, yStep2Bottom, step1Geom.zStepB]);
    addSolidQuad('cornice', [step2Geom.xStepL, yStep2Bottom, step2Geom.zStepB], [step1Geom.xStepL, yStep2Bottom, step1Geom.zStepB], [step1Geom.xStepL, yStep2Bottom, step1Geom.zStepF], [step2Geom.xStepL, yStep2Bottom, step2Geom.zStepF]);
    addSolidQuad('cornice', [step1Geom.xStepR, yStep2Bottom, step1Geom.zStepB], [step2Geom.xStepR, yStep2Bottom, step2Geom.zStepB], [step2Geom.xStepR, yStep2Bottom, step2Geom.zStepF], [step1Geom.xStepR, yStep2Bottom, step1Geom.zStepF]);
    addSolidQuad('cornice', [step2Geom.xStepL, yStep2Bottom, step1Geom.zStepF], [xCutL, yStep2Bottom, step1Geom.zStepF], [xCutL, yStep2Bottom, step2Geom.zStepF], [step2Geom.xStepL, yStep2Bottom, step2Geom.zStepF]);
    addSolidQuad('cornice', [xCutR, yStep2Bottom, step1Geom.zStepF], [step2Geom.xStepR, yStep2Bottom, step1Geom.zStepF], [step2Geom.xStepR, yStep2Bottom, step2Geom.zStepF], [xCutR, yStep2Bottom, step2Geom.zStepF]);

    addSolidQuad('cornice', [step2Geom.xStepL, yStep2Top, step2Geom.zStepB], [step2Geom.xStepR, yStep2Top, step2Geom.zStepB], [step2Geom.xStepR, yStep2Top, channelBackZ], [step2Geom.xStepL, yStep2Top, channelBackZ]);
    addSolidQuad('cornice', [step2Geom.xStepL, yStep2Top, channelBackZ], [xCutL, yStep2Top, channelBackZ], [xCutL, yStep2Top, step2Geom.zStepF], [step2Geom.xStepL, yStep2Top, step2Geom.zStepF]);
    addSolidQuad('cornice', [xCutR, yStep2Top, channelBackZ], [step2Geom.xStepR, yStep2Top, channelBackZ], [step2Geom.xStepR, yStep2Top, step2Geom.zStepF], [xCutR, yStep2Top, step2Geom.zStepF]);

    // =========================================================================
    // 4. SOLID GABLE ROOF WITH 90° SQUARE-CUT EAVES & THICKNESS (ID: "cap_roof")
    // =========================================================================
    const yFloor = yStep2Top;
    const W_soffit = hw2 + eaveOverhangX;
    const H_soffit = capPitchH;

    // Exact pitch angle: slope = H_soffit / W_soffit
    const slope = H_soffit / W_soffit;
    const theta = Math.atan(slope);
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const zFrontBarge = cz + hd2 + eaveOverhangZ;
    const zRearBarge = cz - hd2 - eaveOverhangZ;
    const zFrontWall = cz + hd2;
    const zRearWall = cz - hd2;

    // True 90° square-cut roof board thickness
    // Top apex raises vertically by t / cosT so that top rake is EXACTLY parallel to soffit rake
    const dYApex = roofThickness / cosT;
    const yApexTop = yFloor + H_soffit + dYApex;
    const yApexSoffit = yFloor + H_soffit;

    // Eave ends cut square at 90° to the roof pitch:
    // Offset from soffit eave point by t * normal = t * (-sinT, cosT)
    const dxEave = roofThickness * sinT;
    const dyEave = roofThickness * cosT;

    const xTopEaveL = cx - W_soffit - dxEave;
    const xTopEaveR = cx + W_soffit + dxEave;
    const yTopEave = yFloor + dyEave;

    const xSoffEaveL = cx - W_soffit;
    const xSoffEaveR = cx + W_soffit;
    const ySoffEave = yFloor;

    // Top shingle pitch points
    const pTopApexF = [cx, yApexTop, zFrontBarge];
    const pTopApexR = [cx, yApexTop, zRearBarge];
    const pTopLF = [xTopEaveL, yTopEave, zFrontBarge];
    const pTopLR = [xTopEaveL, yTopEave, zRearBarge];
    const pTopRF = [xTopEaveR, yTopEave, zFrontBarge];
    const pTopRR = [xTopEaveR, yTopEave, zRearBarge];

    // Soffit pitch points
    const pSoffApexF = [cx, yApexSoffit, zFrontWall];
    const pSoffApexR = [cx, yApexSoffit, zRearWall];
    const pSoffLF = [xSoffEaveL, ySoffEave, zFrontWall];
    const pSoffLR = [xSoffEaveL, ySoffEave, zRearWall];
    const pSoffRF = [xSoffEaveR, ySoffEave, zFrontWall];
    const pSoffRR = [xSoffEaveR, ySoffEave, zRearWall];

    // Top Shingle Planes (Solid)
    addSolidQuad('cap_roof', pTopLF, pTopLR, pTopApexR, pTopApexF);
    addSolidQuad('cap_roof', pTopApexF, pTopApexR, pTopRR, pTopRF);

    // Eave End Returns (Square 90° Cut to the roof pitch)
    addSolidQuad('cap_roof', pTopLF, [xSoffEaveL, ySoffEave, zFrontBarge], [xSoffEaveL, ySoffEave, zRearBarge], pTopLR);
    addSolidQuad('cap_roof', pTopRR, [xSoffEaveR, ySoffEave, zRearBarge], [xSoffEaveR, ySoffEave, zFrontBarge], pTopRF);

    // Front & Rear Bargeboards (Solid Thick Fascias)
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

      // Bargeboard soffit return to wall
      addSolidQuad('cap_roof', lS, [xSoffEaveL, ySoffEave, zW], [cx, yApexSoffit, zW], aS);
      addSolidQuad('cap_roof', aS, [cx, yApexSoffit, zW], [xSoffEaveR, ySoffEave, zW], rS);

      // Crisp wireframe rakes
      add('cap_roof', lT, aT);
      add('cap_roof', rT, aT);
      add('cap_roof', lS, aS);
      add('cap_roof', rS, aS);
      add('cap_roof', lT, lS);
      add('cap_roof', rT, rS);
    });

    // Longitudinal roof wireframe edges
    add('cap_roof', pTopApexF, pTopApexR);
    add('cap_roof', pTopLF, pTopLR);
    add('cap_roof', pTopRF, pTopRR);
    add('cap_roof', [xSoffEaveL, ySoffEave, zFrontBarge], [xSoffEaveL, ySoffEave, zRearBarge]);
    add('cap_roof', [xSoffEaveR, ySoffEave, zFrontBarge], [xSoffEaveR, ySoffEave, zRearBarge]);

    // =========================================================================
    // 5. CHRISTMAS TREE MOTIF: EQUAL TRIM WIDTH (T) ON ALL 3 SIDES & SAME ANGLE
    // =========================================================================
    // 1. The outer triangle sits directly under the soffit:
    //    Slope of left rake is EXACTLY +slope (atan(slope) = theta)
    //    Slope of right rake is EXACTLY -slope
    //    Base is horizontal at y = yFloor
    const yTriApex = yFloor + H_soffit;
    const W_motif = W_soffit; // Exact flush fit with roof soffit
    const zTympanum = zFrontWall - triRecessDepth;

    // 2. Uniform trim width T on all 3 sides:
    //    Clamp T so inner triangle cannot exceed available height
    const maxT = (H_soffit / (1 + 1 / sinT)) * 0.88;
    const T = Math.min(maxT, Math.max(0.03, frameWidth));

    // 3. Exact geometric offset for uniform margin T:
    //    - Left rake is offset perpendicularly by T
    //    - Right rake is offset perpendicularly by T
    //    - Bottom sill is offset vertically by T (y = yFloor + T)
    //    Inner Apex drops vertically by T / sinT:
    const yInnerApex = yTriApex - (T / sinT);

    //    At any height y, the distance of the inner rake from center is:
    //    x_inner(y) = (yInnerApex - y) / slope
    //    Notice: dx/dy = 1 / slope everywhere, IDENTICAL to the outer roof!
    const yInnerBase = yFloor + T;
    const xInnerBaseHalfW = (yInnerApex - yInnerBase) / slope;

    // Split notch height: must cut through bottom sill (yFloor to ySplit)
    const ySplit = Math.min(yInnerApex - 0.05, Math.max(yFloor + T, yFloor + splitHeight));

    // Key 2D profile points on the front face (z = zFrontWall)
    const pOutApex = [cx, yTriApex, zFrontWall];
    const pOutL = [cx - W_motif, yFloor, zFrontWall];
    const pOutR = [cx + W_motif, yFloor, zFrontWall];

    const pSplitBotL = [xCutL, yFloor, zFrontWall];
    const pSplitBotR = [xCutR, yFloor, zFrontWall];
    const pSplitTopL = [xCutL, ySplit, zFrontWall];
    const pSplitTopR = [xCutR, ySplit, zFrontWall];

    const pInApex = [cx, yInnerApex, zFrontWall];
    const pInBaseL = [cx - xInnerBaseHalfW, yInnerBase, zFrontWall];
    const pInBaseR = [cx + xInnerBaseHalfW, yInnerBase, zFrontWall];

    // Where the vertical split meets the inner triangle
    // At height ySplit, inner rake X is:
    const xAtSplitHalfW = (yInnerApex - ySplit) / slope;
    const pInSplitL = [cx - Math.max(chHW, xAtSplitHalfW), ySplit, zFrontWall];
    const pInSplitR = [cx + Math.max(chHW, xAtSplitHalfW), ySplit, zFrontWall];

    // Front Solid Facets of the Christmas Tree Frame:
    // Left horizontal sill block (height T)
    addSolidQuad('opening_hood', pOutL, pSplitBotL, [xCutL, yInnerBase, zFrontWall], pInBaseL);
    // Right horizontal sill block (height T)
    addSolidQuad('opening_hood', pInBaseR, [xCutR, yInnerBase, zFrontWall], pSplitBotR, pOutR);

    // Split notch side extensions if ySplit > yInnerBase
    if (ySplit > yInnerBase) {
      addSolidQuad('opening_hood', pInBaseL, [xCutL, yInnerBase, zFrontWall], pSplitTopL, pInSplitL);
      addSolidQuad('opening_hood', pInSplitR, pSplitTopR, [xCutR, yInnerBase, zFrontWall], pInBaseR);
    }

    // Left & right sloping rake bands (strictly parallel to roof)
    addSolidQuad('opening_hood', pInSplitL, pInApex, pOutApex, pOutL);
    addSolidQuad('opening_hood', pOutR, pOutApex, pInApex, pInSplitR);

    // Wireframe lines of the Christmas Tree Motif:
    // Outer perimeter (slopes match roof rake exactly)
    add('opening_hood', pOutL, pOutApex);
    add('opening_hood', pOutR, pOutApex);
    add('opening_hood', pOutL, pSplitBotL);
    add('opening_hood', pOutR, pSplitBotR);

    // Vertical split notch lines
    add('opening_hood', pSplitBotL, pSplitTopL);
    add('opening_hood', pSplitBotR, pSplitTopR);

    // Inner triangle perimeter (strictly parallel to roof rakes & horizontal sill)
    if (ySplit <= yInnerBase) {
      add('opening_hood', pSplitTopL, pSplitTopR);
      add('opening_hood', pInBaseL, pInBaseR);
      add('opening_hood', pInBaseL, pInApex);
      add('opening_hood', pInBaseR, pInApex);
    } else {
      add('opening_hood', pSplitTopL, pInSplitL);
      add('opening_hood', pSplitTopR, pInSplitR);
      add('opening_hood', pInBaseL, [xCutL, yInnerBase, zFrontWall]);
      add('opening_hood', pInBaseR, [xCutR, yInnerBase, zFrontWall]);
      add('opening_hood', pInSplitL, pInApex);
      add('opening_hood', pInSplitR, pInApex);
    }

    // Solid Recessed Flat Tympanum Back Wall
    const pBackApex = [cx, yInnerApex, zTympanum];
    const pBackL = [pInSplitL[0], ySplit, zTympanum];
    const pBackR = [pInSplitR[0], ySplit, zTympanum];

    addSolidTri('opening_hood', pBackL, pBackR, pBackApex);

    // Solid Inner Jambs / Reveals to Recessed Back Wall
    addSolidQuad('opening_hood', pInSplitL, pBackL, pBackApex, pInApex); // Left inner rake reveal
    addSolidQuad('opening_hood', pInApex, pBackApex, pBackR, pInSplitR); // Right inner rake reveal

    // Split notch interior walls
    addSolidQuad('opening_hood', pSplitBotL, [xCutL, yFloor, channelBackZ], [xCutL, ySplit, channelBackZ], pSplitTopL);
    addSolidQuad('opening_hood', pSplitTopR, [xCutR, ySplit, channelBackZ], [xCutR, yFloor, channelBackZ], pSplitBotR);
    addSolidQuad('opening_hood', [xCutL, yFloor, channelBackZ], [xCutR, yFloor, channelBackZ], [xCutR, ySplit, channelBackZ], [xCutL, ySplit, channelBackZ]);

    // Jamb reveals wireframe
    add('opening_hood', pInApex, pBackApex);
    add('opening_hood', pInSplitL, pBackL);
    add('opening_hood', pInSplitR, pBackR);
    add('opening_hood', pBackL, pBackApex);
    add('opening_hood', pBackR, pBackApex);
    add('opening_hood', pBackL, pBackR);

    // Rear wall closure of the gable
    const pRearL = [cx - W_soffit, yFloor, zRearWall];
    const pRearR = [cx + W_soffit, yFloor, zRearWall];
    const pRearA = [cx, yApexSoffit, zRearWall];
    addSolidTri('opening_hood', pRearL, pRearR, pRearA);
    add('opening_hood', pRearL, pRearA);
    add('opening_hood', pRearR, pRearA);
    add('opening_hood', pRearL, pRearR);
  }

  static drawTowers(partBuckets, solidBuckets, THREE, customConfig = {}) {
    const config = Object.assign({
      width: 0.84,
      depth: 0.88,
      shaftHeight: 2.45,
      channelWidth: 0.22,
      channelDepth: 0.08,
      step1Height: 0.16,
      step1Flare: 0.08,
      step2Height: 0.18,
      corniceFlare: 0.16,
      capPitchH: 1.15,
      roofThickness: 0.08,
      frameWidth: 0.12,
      splitHeight: 0.18,
      triRecessDepth: 0.08,
      eaveOverhangX: 0.18,
      eaveOverhangZ: 0.14
    }, customConfig);

    // Left Tower
    Simple3dShapes.drawSingleTower(partBuckets, solidBuckets, {
      cx: -1.75,
      cyBase: 9.15,
      cz: -0.75,
      ...config
    });

    // Right Tower
    Simple3dShapes.drawSingleTower(partBuckets, solidBuckets, {
      cx: 2.35,
      cyBase: 9.30,
      cz: -0.75,
      ...config
    });
  }
}

globalThis.Simple3dShapes = Simple3dShapes;
if (typeof module !== 'undefined' && module.exports) module.exports = Simple3dShapes;
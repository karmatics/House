class Simple3dShapes {
  constructor() {}

  static buildPrimitives(app, scene, customConfig = {}) {
        const THREE = app.THREE;
        const meshes = [];
        const solidMeshes = [];

        const partBuckets = {};
        const solidBuckets = {};

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

        // 1. PRIMARY MASSING & WALLS
        addBoxLines('house_massing', -5.0, 0.0, -5.5, 0.8, 3.2, 1.2);
        addBoxLines('house_massing', -5.0, 3.2, -5.5, 0.8, 6.2, 1.2);
        addBoxLines('house_massing', 0.8, 0.0, -5.5, 7.0, 3.2, 1.2);
        addBoxLines('house_massing', 0.8, 3.2, -5.5, 7.0, 6.2, 1.2);
        addBoxLines('house_massing', -5.0, -2.6, -5.5, 7.0, 0.0, 1.2);

        // 2. CANTED 45° BAY WINDOW PAVILION (Under Lunette Gable)
        const addCantedBaySlab = (y) => {
          addSeg('house_canted_bay', [1.0, y, 1.2], [2.4, y, 2.8]);
          addSeg('house_canted_bay', [2.4, y, 2.8], [5.4, y, 2.8]);
          addSeg('house_canted_bay', [5.4, y, 2.8], [6.8, y, 1.2]);
          addSeg('house_canted_bay', [6.8, y, 1.2], [1.0, y, 1.2]);
        };

        addCantedBaySlab(-2.6);
        addCantedBaySlab(0.0);
        addCantedBaySlab(3.2);
        addCantedBaySlab(6.2);

        // Canted Bay Corner Posts
        [[1.0, 1.2], [2.4, 2.8], [5.4, 2.8], [6.8, 1.2]].forEach(([x, z]) => {
          addSeg('house_canted_bay', [x, -2.6, z], [x, 6.2, z]);
        });

        // Canted Bay Glazing & Mullions
        [0.0, 3.2].forEach(yBase => {
          const yTop = yBase + 3.0;
          addSeg('house_openings', [1.7, yBase, 2.0], [1.7, yTop, 2.0]);
          addSeg('house_openings', [3.4, yBase, 2.8], [3.4, yTop, 2.8]);
          addSeg('house_openings', [4.4, yBase, 2.8], [4.4, yTop, 2.8]);
          addSeg('house_openings', [6.1, yBase, 2.0], [6.1, yTop, 2.0]);
          addSeg('house_openings', [1.0, yBase + 2.1, 1.2], [2.4, yBase + 2.1, 2.8]);
          addSeg('house_openings', [2.4, yBase + 2.1, 2.8], [5.4, yBase + 2.1, 2.8]);
          addSeg('house_openings', [5.4, yBase + 2.1, 2.8], [6.8, yBase + 2.1, 1.2]);
        });

        // Balcony Railings
        addSeg('house_canted_bay', [1.0, 4.15, 1.2], [2.4, 4.15, 2.85]);
        addSeg('house_canted_bay', [2.4, 4.15, 2.85], [5.4, 4.15, 2.85]);
        addSeg('house_canted_bay', [5.4, 4.15, 2.85], [6.8, 4.15, 1.2]);

        addBoxLines('house_massing', -5.4, 3.15, 1.2, -1.2, 3.25, 2.2);
        addSeg('house_massing', [-5.4, 4.15, 1.2], [-5.4, 4.15, 2.2]);
        addSeg('house_massing', [-5.4, 4.15, 2.2], [-1.2, 4.15, 2.2]);
        addSeg('house_massing', [-1.2, 4.15, 2.2], [-1.2, 4.15, 1.2]);

        // 3. BUILD ROOF & DYNAMIC PLANES
        const roofResult = RoofBuilder.buildRoof(partBuckets, solidBuckets, THREE, customConfig);

        // 4. BUILD CHIMNEYS & ATTACH TO ROOF SADDLE
        TowerBuilder.drawTowers(partBuckets, solidBuckets, THREE, customConfig, roofResult.plane);

        // 5. PERGOLA & DECK
        addBoxLines('house_pergola', -10.6, -0.25, -3.0, -4.9, 0.0, 3.2);
        addSeg('house_pergola', [-10.6, 1.0, -3.0], [-10.6, 1.0, 3.2]);
        addSeg('house_pergola', [-10.6, 1.0, 3.2], [-4.9, 1.0, 3.2]);
        addBoxLines('house_pergola', -10.6, 2.65, 2.88, -4.8, 2.85, 3.12);
        addBoxLines('house_pergola', -10.6, 2.65, -2.92, -4.8, 2.85, -2.68);
        for (let i = 0; i < 9; i++) {
          const rx = -10.4 + i * (5.3 / 8);
          addBoxLines('house_pergola', rx - 0.04, 2.85, -3.3, rx + 0.04, 3.02, 3.5);
        }

        // 6. STAIRCASE
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

        // 7. GROUND GRADE
        addSeg('house_ground', [7.0, -0.1, -5.5], [11.5, -0.5, 0.0]);
        addSeg('house_ground', [11.5, -0.5, 0.0], [10.2, -1.4, 3.5]);
        addSeg('house_ground', [-6.0, -2.6, 7.5], [11.0, -2.6, 7.5]);

        // SUB-COMPONENT REGISTRY FOR IDENTIFICATION & RAYCASTING
        const definitions = [
          // Roof Sub-components
          { id: 'roof_main_ridge', name: 'Main Roof — Straight Ridge Peak', color: 0x00f2fe, solidColor: 0x3d4852, isTower: false },
          { id: 'roof_main_rear', name: 'Main Roof — Rear Slope', color: 0x58a6ff, solidColor: 0x3d4852, isTower: false },
          { id: 'roof_main_front_l', name: 'Main Roof — Front Left Slope', color: 0x58a6ff, solidColor: 0x3d4852, isTower: false },
          { id: 'roof_main_front_r', name: 'Main Roof — Front Right Slope', color: 0x58a6ff, solidColor: 0x3d4852, isTower: false },
          { id: 'roof_left_gable', name: 'Left Wing — Upper Gable Wall', color: 0xe67e22, solidColor: 0x8a5d3b, isTower: false },
          { id: 'roof_left_window', name: 'Left Wing — Square Bedroom Window', color: 0x00f2fe, solidColor: 0x111827, isTower: false },
          { id: 'roof_left_skirt', name: 'Left Wing — Angled Skirt Roof', color: 0x58a6ff, solidColor: 0x3d4852, isTower: false },
          { id: 'roof_left_slope', name: 'Left Wing — Side Hipped Slope', color: 0x58a6ff, solidColor: 0x3d4852, isTower: false },
          { id: 'roof_lunette_gable_l', name: 'Lunette Gable — Left Rake Pitch', color: 0x79c0ff, solidColor: 0x485460, isTower: false },
          { id: 'roof_lunette_gable_r', name: 'Lunette Gable — Right Rake Pitch', color: 0x79c0ff, solidColor: 0x485460, isTower: false },
          { id: 'roof_lunette_tymp', name: 'Lunette Gable — Tympanum Wall', color: 0xe67e22, solidColor: 0x8a5d3b, isTower: false },
          { id: 'roof_lunette_window', name: 'Lunette Gable — Arched Sunburst Window', color: 0x00f2fe, solidColor: 0x1f2937, isTower: false },
          { id: 'roof_dormer_l', name: 'Triangular Dormer — Left Pitch', color: 0xffb74d, solidColor: 0x4b5563, isTower: false },
          { id: 'roof_dormer_r', name: 'Triangular Dormer — Right Pitch', color: 0xffb74d, solidColor: 0x4b5563, isTower: false },
          { id: 'roof_dormer_face', name: 'Triangular Dormer — Notched Cutout Frame', color: 0xffd166, solidColor: 0xd4a373, isTower: false },
          { id: 'roof_dormer_recess', name: 'Triangular Dormer — Recessed Window Wall', color: 0x06d6a0, solidColor: 0x111827, isTower: false },
          // Chimneys
          { id: 'tower_l_cap_roof', name: 'Left Chimney — Gable Cap & Rakes', color: 0x00f2fe, solidColor: 0x2d3436, isTower: true },
          { id: 'tower_l_opening_hood', name: 'Left Chimney — Motif Trim Frame', color: 0xffb74d, solidColor: 0xd4a373, isTower: true },
          { id: 'tower_l_motif_back', name: 'Left Chimney — Recessed Tympanum', color: 0xe67e22, solidColor: 0x785338, isTower: true },
          { id: 'tower_l_cornice', name: 'Left Chimney — Stepped Abacus Capital', color: 0x2ecc71, solidColor: 0xe6e4db, isTower: true },
          { id: 'tower_l_shaft_body', name: 'Left Chimney — Shaft & Vertical Channel', color: 0xdfe6e9, solidColor: 0xdcdde1, isTower: true },
          { id: 'tower_l_flashing', name: 'Left Chimney — Roof Flashing Collar', color: 0xfd79a8, solidColor: 0x636e72, isTower: true },
          { id: 'tower_r_cap_roof', name: 'Right Chimney — Gable Cap & Rakes', color: 0x00f2fe, solidColor: 0x2d3436, isTower: true },
          { id: 'tower_r_opening_hood', name: 'Right Chimney — Motif Trim Frame', color: 0xffb74d, solidColor: 0xd4a373, isTower: true },
          { id: 'tower_r_motif_back', name: 'Right Chimney — Recessed Tympanum', color: 0xe67e22, solidColor: 0x785338, isTower: true },
          { id: 'tower_r_cornice', name: 'Right Chimney — Stepped Abacus Capital', color: 0x2ecc71, solidColor: 0xe6e4db, isTower: true },
          { id: 'tower_r_shaft_body', name: 'Right Chimney — Shaft & Vertical Channel', color: 0xdfe6e9, solidColor: 0xdcdde1, isTower: true },
          { id: 'tower_r_flashing', name: 'Right Chimney — Roof Flashing Collar', color: 0xfd79a8, solidColor: 0x636e72, isTower: true },
          // Massing & Openings
          { id: 'house_canted_bay', name: 'Canted 45° Bay Window Pavilion', color: 0x79c0ff, isTower: false },
          { id: 'house_massing', name: 'House Volumes & Slabs', color: 0x8b949e, isTower: false },
          { id: 'house_openings', name: 'House Glazing & Mullions', color: 0x79c0ff, isTower: false },
          { id: 'house_pergola', name: 'Pergola & Cantilever Deck', color: 0xd29922, isTower: false },
          { id: 'house_stairs', name: 'Exterior Staircase & Rail', color: 0x3fb950, isTower: false },
          { id: 'house_ground', name: 'Loose Ground Slope', color: 0x484f58, isTower: false }
        ];

        const houseGroup = new THREE.Group();
        houseGroup.name = 'HouseWireframe';

        definitions.forEach(def => {
          const tris = solidBuckets[def.id];
          if (!tris || tris.length === 0) return;

          const geom = new THREE.BufferGeometry();
          geom.setAttribute('position', new THREE.Float32BufferAttribute(tris, 3));
          geom.computeVertexNormals();

          const mat = new THREE.MeshLambertMaterial({
            color: def.solidColor || 0xcccccc,
            transparent: true,
            opacity: 0.92,
            side: THREE.DoubleSide
          });

          const mesh = new THREE.Mesh(geom, mat);
          mesh.name = def.name + ' [Solid]';
          mesh.userData = {
            partId: def.id,
            partName: def.name,
            baseColor: def.color,
            baseSolidColor: def.solidColor || 0xcccccc,
            isSolid: true,
            isTower: def.isTower
          };

          houseGroup.add(mesh);
          solidMeshes.push(mesh);
        });

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

        const grid = new THREE.GridHelper(30, 30, 0x30363d, 0x161b22);
        grid.position.y = -2.61;
        grid.visible = true;
        scene.add(grid);

        return { meshes, solidMeshes, grid, houseGroup };
    }
  static drawSingleTower(partBuckets, solidBuckets, opts = {}) {
      return TowerBuilder.drawSingleTower(partBuckets, solidBuckets, opts);
    }

  static drawTowers(partBuckets, solidBuckets, THREE, customConfig = {}) {
      return TowerBuilder.drawTowers(partBuckets, solidBuckets, THREE, customConfig);
    }
}

globalThis.Simple3dShapes = Simple3dShapes;
if (typeof module !== 'undefined' && module.exports) module.exports = Simple3dShapes;
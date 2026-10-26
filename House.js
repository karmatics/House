class House {
  constructor() {
    this.app = null;
    this.meshes = [];
    this.grid = null;
    this.houseGroup = null;
    this.raycastingEnabled = true;
    this.intersected = null;
    this.loadedModel = null;
    this.currentThemeIndex = 0;
  }

  getLineThemes() {
    return [
      {
        name: 'Architectural Blueprint',
        bg: '#0d1117',
        roof: 0x58a6ff,
        massing: 0xffffff,
        openings: 0x79c0ff,
        pergola: 0xffb74d,
        stairs: 0xa5d6a7,
        ground: 0x484f58
      },
      {
        name: 'Monochrome Ink CAD',
        bg: '#f6f8fa',
        roof: 0x1f2328,
        massing: 0x24292f,
        openings: 0x57606a,
        pergola: 0x656d76,
        stairs: 0x24292f,
        ground: 0x8c959f
      },
      {
        name: 'Dark Studio Wire',
        bg: '#14161b',
        roof: 0x00f2fe,
        massing: 0xe6edf3,
        openings: 0x4facfe,
        pergola: 0xf6d365,
        stairs: 0x43e97b,
        ground: 0x30363d
      }
    ];
  }

  _buildPrimitives() {
    // Ensure soft lighting exists for solid shaded surfaces
    if (this.app && this.app.scene) {
      if (!this.app.scene.getObjectByName('towerAmbientLight')) {
        const amb = new this.app.THREE.AmbientLight(0xffffff, 0.75);
        amb.name = 'towerAmbientLight';
        this.app.scene.add(amb);
      }
      if (!this.app.scene.getObjectByName('towerDirLight')) {
        const dir = new this.app.THREE.DirectionalLight(0xffffff, 0.65);
        dir.name = 'towerDirLight';
        dir.position.set(12, 24, 18);
        this.app.scene.add(dir);
      }
    }

    const result = Simple3dShapes.buildPrimitives(this.app, this.app.scene, this.towerConfig || {});
    this.meshes = result.meshes;
    this.solidMeshes = result.solidMeshes || [];
    this.grid = result.grid;
    this.houseGroup = result.houseGroup;
    this._applyLineTheme(0);
  }
  _applyLineTheme(index) {
    this.currentThemeIndex = index;
    const theme = this.getLineThemes()[index];
    if (!theme) return;

    if (this.rootElement) {
      this.rootElement.style.background = theme.bg;
    }
    if (this.app && this.app.renderer) {
      this.app.renderer.setClearColor(theme.bg, 1.0);
    }

    this.meshes.forEach(m => {
      const lid = m.userData?.layerId;
      if (lid && theme[lid] !== undefined && m.material) {
        m.material.color.setHex(theme[lid]);
        m.material.needsUpdate = true;
      }
    });
  }

  _setPresetView(viewName) {
    if (!this.app || !this.app.camera || !this.app.controls) return;
    const cam = this.app.camera;
    const ctrl = this.app.controls;

    let target = new this.app.THREE.Vector3(1.2, 3.8, 0.0);

    switch (viewName) {
      case 'abacusCutClose':
        // Direct front-on close-up targeting the abacus front cut and inner triangle
        target = new this.app.THREE.Vector3(-1.75, 11.85, -0.55);
        cam.position.set(-1.75, 11.95, 3.1);
        break;
      case 'abacusClose':
        // 3/4 perspective matching user's reference inset
        target = new this.app.THREE.Vector3(-1.75, 11.75, -0.75);
        cam.position.set(-3.2, 12.6, 1.2);
        break;
      case 'towerClose':
        target = new this.app.THREE.Vector3(-1.75, 11.5, -0.75);
        cam.position.set(-4.6, 12.8, 2.5);
        break;
      case 'towerFront':
        target = new this.app.THREE.Vector3(-1.75, 11.5, -0.75);
        cam.position.set(-1.75, 11.5, 4.2);
        break;
      case 'towerRight':
        target = new this.app.THREE.Vector3(2.35, 11.6, -0.75);
        cam.position.set(0.2, 13.0, 3.2);
        break;
      case 'refPerspective':
        target = new this.app.THREE.Vector3(1.2, 3.8, 0.0);
        cam.position.set(-16.0, 4.2, 22.0);
        break;
      case 'front':
        target = new this.app.THREE.Vector3(1.2, 4.0, 0.0);
        cam.position.set(1.2, 4.0, 26.0);
        break;
      case 'iso':
        target = new this.app.THREE.Vector3(1.2, 3.8, 0.0);
        cam.position.set(-18.0, 16.0, 20.0);
        break;
    }

    ctrl.target.copy(target);
    cam.lookAt(target);
    ctrl.update();
  }

  _setupUI() {
    const makeEl = typeof makeElement !== 'undefined' ? makeElement : (tag, attrs, ...children) => {
      const el = document.createElement(tag);
      if (attrs) {
        for (const [k, v] of Object.entries(attrs)) {
          if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
          else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
          else el.setAttribute(k, v);
        }
      }
      children.flat().forEach(c => el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
      return el;
    };

    if (!this.towerConfig) {
      this.towerConfig = {
        width: 0.84,
        depth: 0.88,
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
        triRecessDepth: 0.08
      };
    }
    if (!this.partVisibility) this.partVisibility = {};
    if (!this.shadingMode) this.shadingMode = 'both';
    if (this.faceOpacity === undefined) this.faceOpacity = 0.92;

    const sectionTitle = (txt) => makeEl('div', {
      style: {
        fontSize: '10px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#58a6ff',
        marginTop: '8px',
        marginBottom: '3px'
      }
    }, txt);

    // 1. Camera Projection & Views
    const orthoBtn = makeEl('button', {
      id: 'btn_ortho_toggle',
      style: {
        width: '100%',
        padding: '5px',
        background: '#21262d',
        border: '1px solid #388bfd',
        borderRadius: '4px',
        color: '#58a6ff',
        fontWeight: 'bold',
        fontSize: '10.5px',
        fontFamily: 'monospace',
        cursor: 'pointer',
        marginBottom: '4px'
      }
    }, '📐 Orthographic (Parallel)');
    orthoBtn.onclick = () => this.toggleCameraProjection();

    const viewBtns = [
      { id: 'abacusCutClose', label: '✂️ Abacus Cut Front' },
      { id: 'abacusClose', label: '🔍 Left Tower 3/4' },
      { id: 'towerFront', label: '📐 Tower Front Ortho' },
      { id: 'refPerspective', label: '🏠 Whole House' }
    ].map(v => {
      const isFrontOrtho = v.id === 'towerFront';
      const b = makeEl('button', {
        style: {
          padding: '3px 5px',
          background: isFrontOrtho ? '#23863622' : '#161b22',
          border: isFrontOrtho ? '1px solid #2ea043' : '1px solid #30363d',
          borderRadius: '3px',
          color: isFrontOrtho ? '#3fb950' : '#c9d1d9',
          fontSize: '9.5px',
          fontFamily: 'monospace',
          fontWeight: isFrontOrtho ? 'bold' : 'normal',
          cursor: 'pointer'
        }
      }, v.label);
      b.onclick = () => this._setPresetView(v.id);
      return b;
    });
    const viewGrid = makeEl('div', {
      style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }
    }, viewBtns);

    // 2. Shading Mode & Surfaces
    const modeSelector = makeEl('div', {
      style: { display: 'flex', gap: '3px', marginTop: '3px', marginBottom: '4px' }
    }, [
      { id: 'both', label: 'Solid + Wire' },
      { id: 'solid', label: 'Solid Only' },
      { id: 'wire', label: 'Wire Only' }
    ].map(m => {
      const btn = makeEl('button', {
        id: 'btn_mode_' + m.id,
        style: {
          flex: '1',
          padding: '3px',
          background: this.shadingMode === m.id ? '#1f6feb' : '#21262d',
          border: '1px solid #30363d',
          borderRadius: '3px',
          color: '#fff',
          fontSize: '9.5px',
          cursor: 'pointer',
          fontFamily: 'monospace'
        }
      }, m.label);
      btn.onclick = () => {
        this.shadingMode = m.id;
        ['both', 'solid', 'wire'].forEach(id => {
          const b = document.getElementById('btn_mode_' + id);
          if (b) b.style.background = this.shadingMode === id ? '#1f6feb' : '#21262d';
        });
        this._rebuildWireframe();
      };
      return btn;
    }));

    const opDisp = makeEl('span', { style: { float: 'right', color: '#58a6ff' } }, this.faceOpacity.toFixed(2));
    const opInp = makeEl('input', {
      type: 'range',
      min: '0.0',
      max: '1.0',
      step: '0.05',
      value: String(this.faceOpacity),
      style: { width: '100%', margin: '2px 0' }
    });
    opInp.oninput = () => {
      this.faceOpacity = parseFloat(opInp.value);
      opDisp.textContent = this.faceOpacity.toFixed(2);
      this._rebuildWireframe();
    };
    const opRow = makeEl('div', {}, [
      makeEl('div', { style: { fontSize: '9.5px', color: '#8b949e' } }, 'Solid Surface Opacity', opDisp),
      opInp
    ]);

    // 3. Interactive Part Inspector HUD
    const hud = makeEl('div', {
      id: 'tower_part_hud',
      style: {
        margin: '4px 0',
        padding: '4px 6px',
        background: '#090d13',
        border: '1px solid #30363d',
        borderRadius: '4px',
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#e6edf3',
        minHeight: '28px',
        lineHeight: '1.3'
      }
    }, 'Hover over line or face to inspect');

    // 4. Modular Components
    const towerParts = [
      { id: 'cornice', name: 'Stepped Abacus & Cutout', color: '#2ecc71' },
      { id: 'opening_hood', name: 'Christmas Tree Motif', color: '#ffb74d' },
      { id: 'cap_roof', name: 'Thick Gable Roof & Rakes', color: '#00f2fe' },
      { id: 'shaft_body', name: 'Shaft with Vertical Channel', color: '#dfe6e9' },
      { id: 'shaft_panels', name: 'Recessed X-Brace Panels', color: '#a29bfe' },
      { id: 'flashing', name: 'Roof Flashing Skirt', color: '#fd79a8' }
    ];

    const partRows = towerParts.map(p => {
      const chk = makeEl('input', { type: 'checkbox', id: 'chk_' + p.id, checked: true });
      const badge = makeEl('span', {
        style: {
          display: 'inline-block',
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: p.color,
          marginLeft: '4px',
          marginRight: '5px'
        }
      });
      const lbl = makeEl('label', {
        htmlFor: 'chk_' + p.id,
        style: { fontSize: '10px', color: '#c9d1d9', cursor: 'pointer', fontFamily: 'monospace' }
      }, p.name);

      chk.onchange = () => {
        this.partVisibility[p.id] = chk.checked;
        const all = [...this.meshes, ...this.solidMeshes];
        all.filter(m => m.userData?.partId === p.id).forEach(m => m.visible = chk.checked);
      };

      return makeEl('div', {
        style: { display: 'flex', alignItems: 'center', marginTop: '1px' }
      }, [chk, badge, lbl]);
    });

    // Isolate Tower Mode
    const isoChk = makeEl('input', { type: 'checkbox', id: 'chk_iso_towers' });
    const isoLbl = makeEl('label', {
      htmlFor: 'chk_iso_towers',
      style: { marginLeft: '5px', fontSize: '10px', color: '#ffb74d', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace' }
    }, 'Isolate Towers Only');
    isoChk.onchange = () => {
      this.isolateTowers = isoChk.checked;
      const all = [...this.meshes, ...this.solidMeshes];
      all.forEach(m => {
        if (!m.userData?.isTower) m.visible = !this.isolateTowers;
      });
    };
    const isoDiv = makeEl('div', {
      style: { display: 'flex', alignItems: 'center', padding: '3px 5px', background: '#1c2128', borderRadius: '3px', marginTop: '4px' }
    }, [isoChk, isoLbl]);

    // 5. Dimension Sliders
    const makeSlider = (label, param, min, max, step) => {
      const valDisp = makeEl('span', { style: { float: 'right', color: '#58a6ff', fontWeight: 'bold' } }, this.towerConfig[param].toFixed(2));
      const lbl = makeEl('div', { style: { fontSize: '9.5px', color: '#8b949e', marginTop: '3px' } }, label, valDisp);
      const inp = makeEl('input', {
        type: 'range',
        min: String(min),
        max: String(max),
        step: String(step),
        value: String(this.towerConfig[param]),
        style: { width: '100%', margin: '1px 0' }
      });
      inp.oninput = () => {
        this.towerConfig[param] = parseFloat(inp.value);
        valDisp.textContent = this.towerConfig[param].toFixed(2);
        this._rebuildWireframe();
      };
      return makeEl('div', {}, [lbl, inp]);
    };

    const sliderGroup = makeEl('div', {
      style: { padding: '4px 6px', background: '#0d1117', border: '1px solid #21262d', borderRadius: '4px' }
    }, [
      makeSlider('📐 Gable Apex Height (Sets Pitch)', 'capPitchH', 0.80, 1.80, 0.05),
      makeSlider('🏠 Roof Slab Thickness (90° Cut)', 'roofThickness', 0.03, 0.20, 0.01),
      makeSlider('🎄 Frame Trim Width (All 3 Sides)', 'frameWidth', 0.04, 0.25, 0.01),
      makeSlider('🎄 Split Notch Height', 'splitHeight', 0.05, 0.40, 0.01),
      makeSlider('✂️ Channel & Cut Width', 'channelWidth', 0.08, 0.42, 0.01),
      makeSlider('✂️ Channel & Cut Depth', 'channelDepth', 0.02, 0.20, 0.01),
      makeSlider('🎄 Tympanum Recess Depth', 'triRecessDepth', 0.02, 0.20, 0.01),
      makeSlider('Step 1 (Collar) Height', 'step1Height', 0.05, 0.35, 0.01),
      makeSlider('Step 1 (Collar) Flare', 'step1Flare', 0.02, 0.20, 0.01),
      makeSlider('Step 2 (Abacus) Height', 'step2Height', 0.05, 0.35, 0.01),
      makeSlider('Step 2 (Abacus) Flare', 'corniceFlare', 0.05, 0.30, 0.01),
      makeSlider('Shaft Width', 'width', 0.60, 1.30, 0.02),
      makeSlider('Shaft Depth', 'depth', 0.60, 1.30, 0.02)
    ]);

    // 6. JSON Config Readout
    const jsonBox = makeEl('pre', {
      id: 'tower_config_json',
      style: {
        background: '#04070a',
        border: '1px solid #21262d',
        padding: '4px',
        fontSize: '8.5px',
        color: '#39c5bb',
        borderRadius: '3px',
        maxHeight: '75px',
        overflow: 'auto',
        fontFamily: 'monospace'
      }
    }, JSON.stringify(this.towerConfig, null, 2));

    const content = makeEl('div', {
      style: { display: 'flex', flexDirection: 'column', gap: '2px', padding: '2px' }
    }, [
      sectionTitle('View & Camera Mode'),
      orthoBtn,
      viewGrid,
      sectionTitle('Shading & Surfaces'),
      modeSelector,
      opRow,
      sectionTitle('Part Inspector (Hover on 3D)'),
      hud,
      sectionTitle('Modular Components'),
      ...partRows,
      isoDiv,
      sectionTitle('Parametric Dimensions'),
      sliderGroup,
      sectionTitle('Current Parameter Values'),
      jsonBox
    ]);

    if (typeof UITools !== 'undefined' && typeof UITools.makeDialog === 'function') {
      this.controlsDialog = UITools.makeDialog({
        env: this.env,
        title: 'Tower Precision CAD Suite',
        contentElement: content,
        size: [270, 520],
        position: [16, 16],
        allowMinimize: true,
        allowMaximize: false
      });
    }

    this._setupRaycasting();
  }
  destroy() {
    this.destroyed = true;

    if (this.controlsDialog && typeof this.controlsDialog.close === 'function') {
      try { this.controlsDialog.close(); } catch (e) {}
      this.controlsDialog = null;
    }

    if (this.app && typeof this.app.destroy === 'function') {
      try { this.app.destroy(); } catch (error) {}
    }

    if (this.rootElement && this.rootElement.parentElement) {
      this.rootElement.parentElement.removeChild(this.rootElement);
    }

    this.rootElement = null;
    this.app = null;
    this.meshes = [];
    this.grid = null;
    this.houseGroup = null;

    if (window.basic3d === this) {
      window.basic3d = null;
    }
  }

  async run(env) {
    if (this.rootElement) {
      this.destroy();
    }

    this.destroyed = false;
    this.env = env;

    if (!env || !env.container) {
      throw new Error("[House] run() requires an environment object with a valid container.");
    }

    const parentElement = env.container;
    parentElement.style.position = 'relative';
    parentElement.style.width = '100%';
    parentElement.style.height = '100%';
    parentElement.style.margin = '0';
    parentElement.style.padding = '0';
    parentElement.style.overflow = 'hidden';
    parentElement.style.background = '#0d1117';

    const canvasId = 'house-canvas-' + Math.random().toString(36).slice(2);
    const canvasContainer = document.createElement('div');
    canvasContainer.id = canvasId;
    canvasContainer.style.cssText = 'position:absolute; top:0; left:0; right:0; bottom:0; overflow:hidden; background:#0d1117;';
    parentElement.appendChild(canvasContainer);
    this.rootElement = canvasContainer;

    if (typeof ThreeJSLoader === 'undefined') {
      throw new Error('ThreeJSLoader library module not loaded on scope.');
    }

    this.app = new ThreeJSLoader(canvasId, {
      cameraPos: { x: -16.0, y: 4.2, z: 22.0 },
      enableControls: true,
      useThickLines: false,
      useRaycaster: false,
      commonLoaders: false,
      environment: false,
      lighting: false,
      fov: 42
    });

    await this.app.init(canvasContainer);

    if (this.app.scene) {
      this.app.scene.background = null;
    }

    // Set camera target to middle of the house
    if (this.app.controls) {
      this.app.controls.target.set(1.2, 3.8, 0.0);
      this.app.controls.update();
    }

    this._buildPrimitives();
    this._setupUI();

    const initialRect = parentElement.getBoundingClientRect();
    if (initialRect.width > 0 && initialRect.height > 0) {
      this.onResize(initialRect.width, initialRect.height);
    }

    window.threeApp = this.app;
    window.basic3d = this;

    return this;
  }

  onResize(width, height) {
    if (width <= 0 || height <= 0) return;
    if (this.app) {
      if (this.app.camera) {
        this.app.camera.aspect = width / Math.max(1, height);
        this.app.camera.updateProjectionMatrix();
      }
      if (typeof this.app.resize === 'function') {
        this.app.resize(width, height);
      }
    }
  }

  _rebuildWireframe() {
    if (!this.app || !this.app.scene) return;

    if (this.houseGroup) {
      this.app.scene.remove(this.houseGroup);
      this.houseGroup.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.houseGroup = null;
    }

    if (this.grid) {
      this.app.scene.remove(this.grid);
      if (this.grid.geometry) this.grid.geometry.dispose();
      if (this.grid.material) this.grid.material.dispose();
      this.grid = null;
    }

    this.meshes = [];
    this.solidMeshes = [];

    const result = Simple3dShapes.buildPrimitives(this.app, this.app.scene, this.towerConfig || {});
    this.meshes = result.meshes;
    this.solidMeshes = result.solidMeshes || [];
    this.grid = result.grid;
    this.houseGroup = result.houseGroup;

    // Apply Shading Mode (Solid + Wire, Solid Only, Wire Only)
    const mode = this.shadingMode || 'both';
    this.solidMeshes.forEach(m => {
      m.visible = mode === 'both' || mode === 'solid';
      if (this.faceOpacity !== undefined && m.material) {
        m.material.opacity = this.faceOpacity;
      }
    });

    this.meshes.forEach(m => {
      m.visible = mode === 'both' || mode === 'wire';
    });

    // Apply modular part visibility toggles
    if (this.partVisibility) {
      const all = [...this.meshes, ...this.solidMeshes];
      all.forEach(m => {
        const pid = m.userData?.partId;
        if (this.partVisibility[pid] !== undefined && !this.partVisibility[pid]) {
          m.visible = false;
        }
      });
    }

    if (this.isolateTowers) {
      const all = [...this.meshes, ...this.solidMeshes];
      all.forEach(m => {
        if (!m.userData?.isTower) m.visible = false;
      });
    }

    // Update readable JSON readout in controls dialog
    const jsonEl = document.getElementById('tower_config_json');
    if (jsonEl) {
      jsonEl.textContent = JSON.stringify(this.towerConfig, null, 2);
    }
  }
  toggleCameraProjection() {
      if (!this.app || !this.app.camera || !this.app.renderer) return;

      const THREE = this.app.THREE;
      const dom = this.app.renderer.domElement;
      const aspect = dom.clientWidth / Math.max(1, dom.clientHeight);
      const target = this.app.controls ? this.app.controls.target.clone() : new THREE.Vector3(0, 0, 0);

      if (this.isOrthographic) {
        // Switch back to Perspective
        const fov = 42;
        const persCam = new THREE.PerspectiveCamera(fov, aspect, 0.1, 2000);
        persCam.position.copy(this.app.camera.position);
        persCam.up.copy(this.app.camera.up);
        persCam.lookAt(target);

        this.app.camera = persCam;
        if (this.app.controls) {
          this.app.controls.object = persCam;
          this.app.controls.update();
        }
        this.isOrthographic = false;
      } else {
        // Switch to Orthographic (preserve exact scale at target depth)
        const dist = this.app.camera.position.distanceTo(target);
        const fov = this.app.camera.fov || 42;
        const frustumHeight = 2 * dist * Math.tan(THREE.MathUtils.degToRad(fov * 0.5));
        const frustumWidth = frustumHeight * aspect;

        const orthoCam = new THREE.OrthographicCamera(
          -frustumWidth / 2, frustumWidth / 2,
          frustumHeight / 2, -frustumHeight / 2,
          0.1, 2000
        );
        orthoCam.position.copy(this.app.camera.position);
        orthoCam.up.copy(this.app.camera.up);
        orthoCam.lookAt(target);

        this.app.camera = orthoCam;
        if (this.app.controls) {
          this.app.controls.object = orthoCam;
          this.app.controls.update();
        }
        this.isOrthographic = true;
      }

      const btn = document.getElementById('btn_ortho_toggle');
      if (btn) {
        btn.textContent = this.isOrthographic ? '📷 Perspective Mode' : '📐 Orthographic (Parallel)';
        btn.style.background = this.isOrthographic ? '#238636' : '#21262d';
      }
    }

  _setupRaycasting() {
      if (!this.app || !this.app.renderer) return;
      const THREE = this.app.THREE;

      this.pointer = new THREE.Vector2();
      this.hoverRaycaster = new THREE.Raycaster();
      this.hoverRaycaster.params.Line = { threshold: 0.12 };
      this.hoveredObject = null;

      const onPointerMove = (event) => {
        const rect = this.app.renderer.domElement.getBoundingClientRect();
        this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      };

      this.app.renderer.domElement.addEventListener('pointermove', onPointerMove);

      const originalUpdate = this.app.onUpdateCallback;
      this.app.onUpdateCallback = () => {
        if (originalUpdate) originalUpdate();
        this._updateRaycasting();
      };
    }

  _updateRaycasting() {
      if (!this.hoverRaycaster || !this.app || !this.app.camera || !this.meshes) return;

      this.hoverRaycaster.setFromCamera(this.pointer, this.app.camera);

      const candidates = this.meshes.filter(m => m.visible);
      const intersects = this.hoverRaycaster.intersectObjects(candidates, false);
      const hitObj = intersects.length > 0 ? intersects[0].object : null;

      if (this.hoveredObject !== hitObj) {
        // Restore previous object color
        if (this.hoveredObject && this.hoveredObject.material) {
          this.hoveredObject.material.color.setHex(this.hoveredObject.userData.baseColor);
          this.hoveredObject.material.linewidth = this.hoveredObject.userData.isTower ? 1.5 : 1;
        }

        this.hoveredObject = hitObj;

        // Highlight new object in bright fluorescent yellow
        const hudEl = document.getElementById('tower_part_hud');
        if (this.hoveredObject && this.hoveredObject.material) {
          this.hoveredObject.material.color.setHex(0xffea00);
          this.hoveredObject.material.linewidth = 3;

          if (hudEl) {
            const u = this.hoveredObject.userData;
            hudEl.innerHTML = `<strong>ID:</strong> <span style="color:#00f2fe;">${u.partId}</span><br><strong>Part:</strong> ${u.partName}`;
            hudEl.style.borderColor = '#ffea00';
          }
        } else if (hudEl) {
          hudEl.innerHTML = `<span style="color:#8b949e;">Hover over any line to inspect ID</span>`;
          hudEl.style.borderColor = '#30363d';
        }
      }
    }
}

globalThis.House = House;
window.House = House;
if (typeof module !== "undefined" && module.exports) module.exports = House;
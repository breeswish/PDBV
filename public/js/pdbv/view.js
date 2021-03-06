/*global THREE, Stats, window, EventEmitter, Float32Array, TWEEN */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

(function () {

  if (PDBV.View !== undefined) {
    return;
  }

  PDBV.View = function (container) {
    this.container = container;

    this.statsOptions = {
      enabled: true
    };

    this.rendererOptions = {
      antialias: true
    };

    this.cameraOptions = {
      position: new THREE.Vector3(0, 100, 0),
      lookAt: new THREE.Vector3(0, 0, 0)
    };

    this.fogOptions = {
      near: -5,
      far: 50,
      enabled: true
    };

    this.modelOptions = {
      model: 'Line'
    };

    this.coloringOptions = {
      coloring: 'carbonByChain'
    };

    this.loaded = false;
    this.mol = null;
    this.molMetaData = null;
    this.molMap = null;
    this.molRadius = null;
    this.molCenter = null;
    this.currentModel = null;
    this.currentColoring = null;
    this.gfxModels = {};

    this._selected = {};

    this._init();

    this.addListener('selectionChanged', this.onSelectionChanged.bind(this));
    this.addListener('hotTrackChanged', this.onHotTrackChanged.bind(this));
  };

  PDBV.View.prototype = _.create(EventEmitter.prototype, {
    constructor: PDBV.View
  });

  PDBV.View.prototype.onSelectionChanged = function (ev) {
    var view = this;
    view.forCurrentModel(function (model) {
      model.onSelectionChange(ev);
      view.render();
    });
  };

  PDBV.View.prototype.onHotTrackChanged = function (ev) {
    var view = this;
    view.forCurrentModel(function (model) {
      model.onHotTrackChanged(ev);
      view.render();
    });
  };

  PDBV.View.prototype._updateViewportSize = function () {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
  };

  PDBV.View.prototype._init = function () {
    this._updateViewportSize();
    this._attachListeners();

    // create stat control
    if (this.statsOptions.enabled) {
      this._createStats();
    }

    this.clock = new THREE.Clock();

    // create a renderer
    this.renderer = new THREE.WebGLRenderer(this.rendererOptions);
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement);

    // create a camera
    this._createVirtualCamera();

    // create a control
    this._createTrackballControl();

    // selection related
    this.viewSelection = new PDBV.ViewSelection(this);
    this.viewSelection.attachListeners();

    // slice related
    this.viewSlice = new PDBV.ViewSlice(this);
    this.viewSlice.attachListeners();

    // center related
    this.viewCenter = new PDBV.ViewCenter(this);
    this.viewCenter.attachListeners();
  };

  PDBV.View.prototype._attachListeners = function () {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  };

  PDBV.View.prototype.forCurrentModel = function (callback) {
    if (!this.currentModel) {
      return;
    }
    var currentModel = this.gfxModels[this.currentModel];
    if (!currentModel) {
      return;
    }
    callback.call(this, currentModel);
  };

  PDBV.View.prototype._createStats = function () {
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.stats.domElement.style.zIndex = 100;
    this.container.appendChild(this.stats.domElement);
  };

  PDBV.View.prototype._createVirtualCamera = function () {
    this.camera = new PDBV.gfx.VirtualCamera();
    this.resetCameraParameters();
  };

  PDBV.View.prototype.resetCameraParameters = function () {
    this.camera.up.set(0, 0, 1);
    this.camera.position.copy(this.cameraOptions.position);
    this.camera.lookAt(this.cameraOptions.lookAt);
  };

  PDBV.View.prototype._createTrackballControl = function () {
    this.controls = new THREE.TrackballControls(this.camera, this.container);
    this.controls.target.copy(this.cameraOptions.lookAt);
    this.controls.rotateSpeed = 6.0;
    this.controls.maxDistance = 5000;
    this.controls.staticMoving = true;
    this.controls.addEventListener('change', this.onControlsChange.bind(this));
  };

  PDBV.View.prototype.onControlsChange = function () {
    var data = {};
    data.target = {
      x: this.controls.target.x,
      y: this.controls.target.y,
      z: this.controls.target.z,
    };
    data.position = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z,
    };
    data.up = {
      x: this.camera.up.x,
      y: this.camera.up.y,
      z: this.camera.up.z,
    };
    this.emitEvent('controlsChanged', [data, 'view']);

    this.forCurrentModel(function (model) {
      model.syncCamera();
    });
    this.render();
  };

  PDBV.View.prototype.render = function () {
    this.forCurrentModel(function (model) {
      this.renderer.render(model.scene, model.camera);
      if (this.statsOptions.enabled) {
        this.stats.update();
      }
    });
  };

  PDBV.View.prototype.start = function () {
    this._animate();
  };

  PDBV.View.prototype._animate = function (time) {
    window.requestAnimationFrame(this._animate.bind(this));
    TWEEN.update(time);
    this.controls.update(this.clock.getDelta());
  };

  PDBV.View.prototype.load = function (mol, status) {
    var self = this;

    // 相同的 mol 不重复载入
    if (this.mol !== null && this.mol.uuid === mol.uuid) {
      return;
    }

    // deactivate former model
    this.forCurrentModel(function (model) {
      model.deactivate();
    });

    // destroy former models
    var modelName;
    for (modelName in this.gfxModels) {
      if (this.gfxModels.hasOwnProperty(modelName)) {
        this.gfxModels[modelName].destroy();
        this.gfxModels[modelName] = null;
      }
    }

    this.mol = mol;
    this.molMetaData = {};
    this.molMap = {};
    this.molCenter = mol.getCenter();
    this.molRadius = mol.getRadius();
    this.currentModel = null;
    this.currentColoring = null;
    this.gfxModels = {};
    this._selected = {};

    this.mol.forEachAtom(function (atom) {
      self.molMetaData[atom.uuid] = {
        uuid: atom.uuid,
        visible: true,
        selected: false,
        color: new Float32Array([1, 1, 1])
      };
      self.molMap[atom.uuid] = atom;
    });

    this.loaded = true;

    this.emitEvent('pdbChanged', [mol.uuid, 'page']);

    this.viewSlice.updateOffset();

    this.onWindowResize();
    this.resetCameraParameters();
    this.resetControlsParameters(status.controls);

    this.useModel(status.model);
    this.useColoring(status.coloring);
    this.render();
  };

  PDBV.View.prototype.resetControlsParameters = function (parameters) {
    if (parameters === null || parameters === undefined) {
      parameters = {};
    }

    // target, position, up
    if (parameters.target === undefined) {
      parameters.target = {
        x: this.molCenter.x,
        y: this.molCenter.y,
        z: this.molCenter.z,
      };
      parameters.position = {
        x: this.cameraOptions.position.x,
        y: this.cameraOptions.position.y,
        z: this.cameraOptions.position.z,
      };
      parameters.up = {
        x: 0,
        y: 0,
        z: 1,
      };
    }

    this.controls.target0.copy(parameters.target);
    this.controls.position0.copy(parameters.position);
    this.controls.up0.copy(parameters.up);
    this.controls.reset();
  };

  PDBV.View.prototype.useModel = function (modelName) {
    // 数据还未载入则退出
    if (this.loaded !== true) {
      return;
    }

    if (modelName === null || modelName === undefined) {
      modelName = this.modelOptions.model;
    }

    // 已经是该 model 了则退出
    if (this.currentModel === modelName) {
      return;
    }

    // 通知之前的 model
    if (this.currentModel) {
      this.forCurrentModel(function (model) {
        model.deactivate();
      });
    }

    this.currentModel = modelName;

    if (this.gfxModels[modelName] === undefined) {
      console.time('construct model: ' + modelName);
      this.gfxModels[modelName] = new PDBV.model[modelName]();
      this.gfxModels[modelName].initView(this);
      this.gfxModels[modelName].initScene(this.fogOptions);
      this.gfxModels[modelName].initGeometries();
      console.timeEnd('construct model: ' + modelName);
    }

    this.emitEvent('modelChanged', [modelName, 'view']);

    this.gfxModels[modelName].syncCamera();
    this.gfxModels[modelName].syncCameraAspect();
    this.gfxModels[modelName].activate();
    this.gfxModels[modelName].resetSelection();
  };

  PDBV.View.prototype.useColoring = function (coloring) {
    if (coloring === undefined || coloring === null) {
      coloring = this.coloringOptions.coloring;
    }

    if (this.currentColoring === coloring) {
      return;
    }

    if (this.currentModel === null) {
      return;
    }

    // 着色方案不存在
    if (PDBV.coloring[coloring] === null) {
      return;
    }

    PDBV.coloring[coloring](this.mol, this.molMetaData);

    this.forCurrentModel(function (model) {
      model.syncColor();
    });

    this.emitEvent('coloringChanged', [coloring, 'view']);
  };

  PDBV.View.prototype.onWindowResize = function () {
    this._updateViewportSize();
    this.camera.aspect = this.width / this.height;
    this.renderer.setSize(this.width, this.height);
    this.forCurrentModel(function (model) {
      model.syncCameraAspect();
      this.render();
    });
  };

  PDBV.View.prototype.onServerStatusUpdated = function (key, val) {
    if (key === 'controlsChanged') {
      this.resetControlsParameters(val);
    } else if (key === 'modelChanged') {
      this.useModel(val);
    } else if (key === 'coloringChanged') {
      this.useColoring(val);
    }
  };

}());

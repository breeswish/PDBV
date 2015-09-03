/*global THREE, Stats, window, EventEmitter */

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
      near: 1,
      far: 10000,
      position: new THREE.Vector3(0, 100, 0),
      lookAt: new THREE.Vector3(0, 0, 0)
    };

    this.fogOptions = {
      near: -5,
      far: 50,
      enabled: true
    };

    this.modelOptions = {
      model: 'BallAndStick'
    };

    this.modifierKeys = {
      control: false,
      shift: false,
      alt: false,
      meta: false
    };

    this.loaded = false;
    this.mol = null;
    this.molMetaData = null;
    this.molMap = null;
    this.currentModel = null;
    this.gfxModels = {};

    this._selected = {};

    this._init();
  };

  PDBV.View.prototype = _.create(EventEmitter.prototype, {
    constructor: PDBV.View
  });

  PDBV.View.prototype._updateViewportSize = function () {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
  };

  PDBV.View.prototype._init = function () {
    this._updateViewportSize();
    this._attachListeners();

    var viewSelection = new PDBV.ViewSelection(this);
    viewSelection.attachListeners();

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
    this.camera.near = this.cameraOptions.near;
    this.camera.far = this.cameraOptions.far;
    this.camera.position.copy(this.cameraOptions.position);
    this.camera.lookAt(this.cameraOptions.lookAt);
  };

  PDBV.View.prototype._createTrackballControl = function () {
    this.controls = new THREE.TrackballControls(this.camera, this.container);
    this.controls.target.copy(this.cameraOptions.lookAt);
    this.controls.rotateSpeed = 2.0;
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

  PDBV.View.prototype._animate = function () {
    window.requestAnimationFrame(this._animate.bind(this));
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
      this.gfxModels[modelName].destroy();
      this.gfxModels[modelName] = null;
    }

    this._selected = {};

    this.mol = mol;
    this.molMetaData = {};
    this.molMap = {};
    this.mol.forEachAtom(function (atom) {
      self.molMetaData[atom.uuid] = {
        uuid: atom.uuid,
        visible: true,
        selected: false,
      };
      self.molMap[atom.uuid] = atom;
    });

    this.gfxModels = {};
    this.loaded = true;

    this.onWindowResize();
    this.resetCameraParameters();
    this.resetControlsParameters(status.controls);

    this.useModel(status.model);
  };

  PDBV.View.prototype.resetControlsParameters = function (parameters) {
    if (parameters === null || parameters === undefined) {
      parameters = {};
    }

    // target, position, up
    if (parameters.target === undefined) {
      var center = this.mol.getCenter();
      parameters.target = {
        x: center.x,
        y: center.y,
        z: center.z,
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
    this.render();
  };

  PDBV.View.prototype.setCameraParameters = function (near, far, pos, lookAt) {
    this.camera.near = near;
    this.camera.far = far;
    this.camera.position.copy(pos);
    this.camera.lookAt(lookAt);
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
    }
  };

}());

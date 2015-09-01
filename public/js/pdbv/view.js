/*global THREE, Stats, window */

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
/*
    this.controlOptions = {
      rotateSpeed: 1.0,
      zoomSpeed: 1.2,
      panSpeed: 0.8,
      staticMoving: true
    };
*/

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
    this.gfxModels = {};

    this._selected = {};

    this._init();
  };

  PDBV.View.prototype._updateViewportSize = function () {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
  };

  PDBV.View.prototype._init = function () {
    this._updateViewportSize();

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

  PDBV.View.prototype.forCurrentModel = function (callback) {
    var currentModel = this.gfxModels[this.modelOptions.model];
    if (currentModel) {
      callback.call(this, currentModel);
    }
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
    this.controls.addEventListener('change', this.onControlChange.bind(this));
  };

  PDBV.View.prototype.onControlChange = function () {
    this.forCurrentModel(function (model) {
      model.syncCamera();
    });
    this.render();
  };

  PDBV.View.prototype._render = function () {
    this.forCurrentModel(function (model) {
      this.renderer.render(model.scene, model.camera);
      if (this.statsOptions.enabled) {
        this.stats.update();
      }
    });
  };

  PDBV.View.prototype.render = function () {
    this._render();
  };

  PDBV.View.prototype.start = function () {
    this._animate();
  };

  PDBV.View.prototype._animate = function () {
    window.requestAnimationFrame(this._animate.bind(this));
    this.controls.update(this.clock.getDelta());
  };

  PDBV.View.prototype.load = function (mol) {
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
      //if (Math.random() > 0.5) self._selected[atom.uuid] = true;
      self.molMap[atom.uuid] = atom;
    });

    this.gfxModels = {};
    this.loaded = true;

    var center = this.mol.getCenter();

    this.onWindowResize();
    this.resetCameraParameters();
    this.controls.target.copy(center);
    this.camera.lookAt(center);

    this.useModel();
  };

  PDBV.View.prototype.useModel = function (modelName) {
    // 数据还未载入则退出
    if (this.loaded !== true) {
      return;
    }
    // 已经是该 model 了则退出
    if (modelName === this.modelOptions.model) {
      return;
    }

    if (modelName === undefined) {
      modelName = this.modelOptions.model;
    }

    // 通知之前的 model
    if (modelName !== this.modelOptions.model) {
      this.forCurrentModel(function (model) {
        model.deactivate();
      });
    }

    if (modelName !== undefined) {
      // 更新 modelOptions.model 为当前 modelName
      this.modelOptions.model = modelName;
    }

    if (this.gfxModels[modelName] === undefined) {
      console.time('construct model: ' + modelName);
      this.gfxModels[modelName] = new PDBV.model[modelName]();
      this.gfxModels[modelName].initView(this);
      this.gfxModels[modelName].initScene(this.fogOptions);
      this.gfxModels[modelName].initGeometries();
      console.timeEnd('construct model: ' + modelName);
    }

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

  PDBV.View.prototype.onMouseDown = function () {
    this._moved = false;
  };

  PDBV.View.prototype.onMouseMove = function () {
    this._moved = true;
  };

  PDBV.View.prototype.onKeydown = function (ev) {
    this._updateModifierKeys(ev);
  };

  PDBV.View.prototype.onKeyup = function (ev) {
    this._updateModifierKeys(ev);
  };

  PDBV.View.prototype._updateModifierKeys = function (ev) {
    this.modifierKeys.control = ev.ctrlKey;
    this.modifierKeys.shift = ev.shiftKey;
    this.modifierKeys.alt = ev.altKey;
    this.modifierKeys.meta = ev.metaKey;
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

  PDBV.View.prototype.onCanvasClick = function (ev) {
    if (this._moved) {
      return;
    }
    this.forCurrentModel(function (model) {
      var mouse = new THREE.Vector2();
      mouse.x = (ev.clientX / this.width) * 2 - 1;
      mouse.y = -(ev.clientY / this.height) * 2 + 1;
      model.onCanvasClick(mouse);
    });
  };

  PDBV.View.prototype.onAtomClicked = function (atom) {
    var uuid;
    var selectionChangeEvent = {
      unselect: [],
      select: []
    };
    if (this.modifierKeys.control === false && this.modifierKeys.shift === false && this.modifierKeys.meta === false) {
      // 没有按下这三个键，则清除之前的选择
      for (uuid in this._selected) {
        selectionChangeEvent.unselect.push(uuid);
        this.molMetaData[uuid].selected = false;
      }
      this._selected = {};
    }
    selectionChangeEvent.select.push(atom.uuid);
    this.molMetaData[atom.uuid].selected = true;
    this._selected[atom.uuid] = true;
    this.forCurrentModel(function (model) {
      model.onSelectionChange(selectionChangeEvent);
      this.render();
    });
  };

}());

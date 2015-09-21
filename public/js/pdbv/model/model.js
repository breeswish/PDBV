/*global THREE, Float32Array, EventEmitter */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.model === undefined) {
  PDBV.model = {};
}

(function () {

  var HOT_TRACK_ATOMS_MAX = 100;

  if (PDBV.model.Model !== undefined) {
    return;
  }

  var Model = function () {
    this._selection = {};
  };

  PDBV.model.Model = Model;

  Model.prototype = _.create(EventEmitter.prototype, {
    constructor: Model
  });

  Model.prototype.selectBoxOptions = {
    enabled: false
  };

  Model.prototype.hotTrackBoxOptions = {
    enabled: false
  };

  Model.prototype.initView = function (view) {
    console.log('[model] %s init', this.modelName);

    this.view = view;
    this.group = new THREE.Object3D();

    if (this.selectBoxOptions.enabled) {
      this.selectBox = {};
      this.selectBox.positions = new Float32Array(this.view.mol.getAtomCount() * PDBV.gfx.selectionBoxGeometry.getSampleVertices() * 3);
      this.selectBox.geometry = new THREE.BufferGeometry();
      this.selectBox.geometry.addAttribute('position', new THREE.DynamicBufferAttribute(this.selectBox.positions, 3));
      this.selectBox.geometry.drawcalls.push({
        start: 0,
        count: 0,
        index: 0,
      });
      this.selectBox.material = new THREE.LineBasicMaterial({
        color: 0xFF00FF,
        linewidth: 2,
        fog: false,
      });
      this.selectBox.mesh = new THREE.Line(this.selectBox.geometry, this.selectBox.material, THREE.LinePieces);
    }

    if (this.hotTrackBoxOptions.enabled) {
      this.hotTrackBox = {};
      this.hotTrackBox.positions = new Float32Array(HOT_TRACK_ATOMS_MAX * PDBV.gfx.selectionBoxGeometry.getSampleVertices() * 3);
      this.hotTrackBox.geometry = new THREE.BufferGeometry();
      this.hotTrackBox.geometry.addAttribute('position', new THREE.DynamicBufferAttribute(this.hotTrackBox.positions, 3));
      this.hotTrackBox.geometry.drawcalls.push({
        start: 0,
        count: 0,
        index: 0,
      });
      this.hotTrackBox.material = new THREE.LineBasicMaterial({
        color: 0xFFFF00,
        linewidth: 2,
        fog: false,
      });
      this.hotTrackBox.mesh = new THREE.Line(this.hotTrackBox.geometry, this.hotTrackBox.material, THREE.LinePieces);
    }

    this.interactiveObjects = [];
  };

  Model.prototype.initScene = function (fogOptions) {
    this.fogOptions = fogOptions;

    this.camera = new THREE.PerspectiveCamera(45, 1, 0, 0);
    this.light = new THREE.PointLight(0xFFFFFF);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000000, 0, 0);
    this.scene.add(this.light);
    this.scene.add(this.camera);
    this.scene.add(this.group);

    if (this.hotTrackBoxOptions.enabled) {
      this.scene.add(this.hotTrackBox.mesh);
    }

    if (this.selectBoxOptions.enabled) {
      this.scene.add(this.selectBox.mesh);
    }

    this.raycaster = new THREE.Raycaster();

    this.scene.updateMatrixWorld();

    this.syncCamera();
    this.syncCameraAspect();
  };

  Model.prototype.syncCameraAspect = function () {
    var virtualCamera = this.view.camera;
    this.camera.aspect = virtualCamera.aspect;
    if (this._aspect !== this.camera.aspect) {
      this.camera.updateProjectionMatrix();
      this._aspect = this.camera.aspect;
    }
  };

  Model.prototype.syncCamera = function () {
    var virtualCamera = this.view.camera;
    var distance = this._distance = virtualCamera._lookAt.distanceTo(virtualCamera.position);
    this.camera.up.copy(virtualCamera.up);
    this.camera.near = Math.max(distance - virtualCamera.offset, 0.01);
    this.camera.far = distance + this.view.molRadius * 2;
    if (this._near !== this.camera.near || this._far !== this.camera.far) {
      this.camera.updateProjectionMatrix();
      this._near = this.camera.near;
      this._far = this.camera.far;
    }
    this.camera.position.copy(virtualCamera.position);
    this.camera.lookAt(virtualCamera._lookAt);
    this.camera.updateMatrixWorld();
    this.light.position.copy(virtualCamera.position);
    if (this.fogOptions.enabled) {
      this.scene.fog.near = this.fogOptions.near + distance;
      this.scene.fog.far = this.fogOptions.far + distance;
    }
  };

  // To be implemented in sub classes
  Model.prototype.initGeometries = function () {};

  // To be implemented in sub classes
  Model.prototype.syncColor = function () {};

  // 点击画布时，raycast
  Model.prototype.onCanvasClick = function (mouse, isRightClick) {
    this.raycaster.setFromCamera(mouse, this.camera);
    var intersects = this.raycaster.intersectObjects(this.interactiveObjects);
    if (intersects.length > 0) {
      var atom = intersects[0].object.data;
      this.view.viewSelection.onAtomClicked(atom, isRightClick);
    }
  };

  // 鼠标在画布上移动时，raycast (hot track)
  Model.prototype.onCanvasMouseMove = function (mouse) {
    this.raycaster.setFromCamera(mouse, this.camera);
    var intersects = this.raycaster.intersectObjects(this.interactiveObjects);
    if (intersects.length > 0) {
      var atom = intersects[0].object.data;
      this.view.viewSelection.onAtomHoverIn(atom);
    } else {
      this.view.viewSelection.onAtomHoverOut();
    }
  };

  Model.prototype.onSelectionChange = function (ev) {
    if (this.selectBoxOptions.enabled) {
      this.redrawSelectBox();
    }
  };

  Model.prototype.onHotTrackChanged = function (ev) {
    if (this.hotTrackBoxOptions.enabled) {
      this.redrawHotTrackBox(ev.atoms);
    }
  };

  Model.prototype.resetSelection = function () {
    var ev = {
      unselect: [],
      select: []
    };

    // unselect all
    var uuid;
    for (uuid in this._selection) {
      if (this._selection.hasOwnProperty(uuid)) {
        ev.unselect.push(uuid);
      }
    }

    // select all
    for (uuid in this.view._selected) {
      if (this.view._selected.hasOwnProperty(uuid)) {
        ev.select.push(uuid);
      }
    }

    this.onSelectionChange(ev);
  };

  Model.prototype.redrawSelectBox = function () {
    if (!this.selectBoxOptions.enabled) {
      return;
    }
    var model = this;
    var view = this.view;
    var uuid, atom, radius, width;
    var offsets = {
      vector3: 0
    };
    for (uuid in view._selected) {
      if (view._selected.hasOwnProperty(uuid)) {
        atom = view.molMap[uuid];
        radius = model.selectBoxOptions.getSize(atom);
        width = model.selectBoxOptions.getWidth(atom, radius);
        PDBV.gfx.selectionBoxGeometry.makeLines(radius, width, model.selectBox.positions, offsets, atom.vector);
      }
    }
    model.selectBox.geometry.drawcalls[0].count = offsets.vector3 / 3;
    model.selectBox.geometry.attributes.position.needsUpdate = true;
    model.selectBox.geometry.computeBoundingSphere();
  };

  Model.prototype.redrawHotTrackBox = function (atoms) {
    if (!this.hotTrackBoxOptions.enabled) {
      return;
    }
    var model = this;
    var view = this.view;
    var atom, radius, width;
    var offsets = {
      vector3: 0
    };
    atoms.forEach(function (uuid) {
      atom = view.molMap[uuid];
      radius = model.hotTrackBoxOptions.getSize(atom);
      width = model.hotTrackBoxOptions.getWidth(atom, radius);
      PDBV.gfx.selectionBoxGeometry.makeLines(radius, width, model.hotTrackBox.positions, offsets, atom.vector);
    });
    model.hotTrackBox.geometry.drawcalls[0].count = offsets.vector3 / 3;
    model.hotTrackBox.geometry.attributes.position.needsUpdate = true;
    model.hotTrackBox.geometry.computeBoundingSphere();
  };

  // 当开始使用这个模型渲染时
  Model.prototype.activate = function () {
    console.log('[model] %s activated', this.modelName);
  };

  // 当停止使用这个模型渲染时
  Model.prototype.deactivate = function () {
    console.log('[model] %s deactivated', this.modelName);
  };

  // 当数据改变，这个模型不再有效时
  Model.prototype.destroy = function () {
    console.log('[model] %s destroyed', this.modelName);
  };

}());

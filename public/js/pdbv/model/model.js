/*global THREE, Float32Array */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.model === undefined) {
  PDBV.model = {};
}

(function () {

  if (PDBV.model.Model !== undefined) {
    return;
  }

  var Model = function () {};

  PDBV.model.Model = Model;

  Model.prototype.initView = function (view) {
    console.log('[model] %s init', this.modelName);

    this.view = view;
    this.group = new THREE.Object3D();
    this.group.position.sub(this.view.mol.getCenter());
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

    this.scene.updateMatrixWorld();

    this.syncCamera();
    this.syncCameraAspect();
  };

  Model.prototype.syncCameraAspect = function () {
    var virtualCamera = this.view.camera;
    this.camera.aspect = virtualCamera.aspect;
    this.camera.updateProjectionMatrix();
  };

  Model.prototype.syncCamera = function () {
    var virtualCamera = this.view.camera;
    this.camera.up.copy(virtualCamera.up);
    this.camera.near = virtualCamera.near;
    this.camera.far = virtualCamera.far;
    this.camera.position.copy(virtualCamera.position);
    this.camera.lookAt(virtualCamera._lookAt);
    this.light.position.copy(virtualCamera.position);
    if (this.fogOptions.enabled) {
      var distance = virtualCamera._lookAt.distanceTo(this.camera.position);
      this.scene.fog.near = this.fogOptions.near + distance;
      this.scene.fog.far = this.fogOptions.far + distance;
    }
  };

  Model.prototype.initGeometries = function () {};

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

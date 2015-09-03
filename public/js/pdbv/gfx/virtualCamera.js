/*global THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.gfx === undefined) {
  PDBV.gfx = {};
}

(function () {

  if (PDBV.gfx.VirtualCamera !== undefined) {
    return;
  }

  var VirtualCamera = function () {
    this.aspect = 4 / 3;
    this.offset = 5000;
    this.position = new THREE.Vector3();
    this.up = new THREE.Vector3();
    this._lookAt = new THREE.Vector3();
  };

  PDBV.gfx.VirtualCamera = VirtualCamera;

  VirtualCamera.prototype.lookAt = function (target) {
    this._lookAt.copy(target);
  };

}());

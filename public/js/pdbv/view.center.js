/*global THREE, TWEEN */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

(function () {

  if (PDBV.ViewCenter !== undefined) {
    return;
  }

  PDBV.ViewCenter = function (view) {
    this.view = view;
    this.tween = null;
  };

  PDBV.ViewCenter.prototype.attachListeners = function () {
    this.view.addListener('atomDoubleClicked', this.onAtomDoubleClicked.bind(this));
  };

  PDBV.ViewCenter.prototype.centerAtom = function (atom) {
    this.centerAt(atom.vector, atom.residue.getRadius());
  };

  PDBV.ViewCenter.prototype.centerResidueOrChain = function (residueOrChain) {
    this.centerAt(residueOrChain.getCenter(), residueOrChain.getRadius());
  };

  PDBV.ViewCenter.prototype.centerAt = function (dest, radius) {
    if (this.tween !== null) {
      this.tween.stop();
      this.tween = null;
    }
    var self = this;
    var view = this.view;
    var delta = new THREE.Vector3(0, 0, 0);

    var distToCenter = radius / Math.sin(Math.PI / 180.0 * 45 /* fov */ * 0.5);
    var current_lookAt = new THREE.Vector3().copy(view.camera._lookAt);     // 当前摄像机看向何处
    var current_position = new THREE.Vector3().copy(view.camera.position);  // 当前摄像机在何处
    var dest_lookAt = new THREE.Vector3().copy(dest);                       // 最终摄像机看向何处
    var dest_position = new THREE.Vector3().subVectors(current_position, current_lookAt).setLength(distToCenter).add(dest_lookAt); // 最终摄像机在何处

    var vLookAt = new THREE.Vector3().subVectors(dest_lookAt, current_lookAt);
    var vPosition = new THREE.Vector3().subVectors(dest_position, current_position);

    // delta 从 0 - 1
    this.tween = new TWEEN.Tween(delta)
      .to(new THREE.Vector3(1, 1, 1), 800)
      .easing(TWEEN.Easing.Quartic.Out)
      .onUpdate(function () {
        var newPosition = vPosition.clone().multiplyScalar(delta.x).add(current_position);
        var newTarget = vLookAt.clone().multiplyScalar(delta.x).add(current_lookAt);
        view.resetControlsParameters({
          target: newTarget,
          position: newPosition,
          up: view.camera.up
        });
      })
      .onComplete(function () {
        self.tween = null;
      })
      .start();
  };

  PDBV.ViewCenter.prototype.onAtomDoubleClicked = function (atom) {
    this.centerAtom(atom);
  };

}());

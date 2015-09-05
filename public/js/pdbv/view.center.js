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

  PDBV.ViewCenter.prototype.onAtomDoubleClicked = function (atom) {
    if (this.tween !== null) {
      this.tween.stop();
      this.tween = null;
    }

    var self = this;
    var view = this.view;
    var delta = new THREE.Vector3(0, 0, 0);
    var _lookAt = new THREE.Vector3().copy(view.camera._lookAt);
    var position = new THREE.Vector3().copy(view.camera.position);

    this.tween = new TWEEN.Tween(delta)
      .to(new THREE.Vector3().copy(atom.vector).sub(_lookAt), 800)
      .easing(TWEEN.Easing.Quartic.Out)
      .onUpdate(function () {
        var newPosition = new THREE.Vector3().copy(position).add(delta);
        var newTarget = new THREE.Vector3().copy(_lookAt).add(delta);
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

}());

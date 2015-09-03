/*global THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

(function () {

  var MAX_DISTANCE = 5000;
  var SCALE = Math.pow(0.95, 1.0);

  if (PDBV.ViewSlice !== undefined) {
    return;
  }

  PDBV.ViewSlice = function (view) {
    this.view = view;
    this.visiblePercent = 1.0;
    this.update();
  };

  PDBV.ViewSlice.prototype.attachListeners = function () {
    this.view.container.addEventListener('mousewheel', this.onMouseWheel.bind(this), true);
    this.view.container.addEventListener('DOMMouseScroll', this.onMouseWheel.bind(this), true);
  };

  PDBV.ViewSlice.prototype.onMouseWheel = function (event) {
    if (!event.shiftKey) {
      return;
    }

    var delta = 0;
    if (event.wheelDelta !== undefined) { // WebKit / Opera / Explorer 9
      delta = event.wheelDelta;
    } else if (event.detail !== undefined) { // Firefox
      delta = -event.detail;
    }
    if (delta > 0) {
      this.dollyIn();
    } else {
      this.dollyOut();
    }
    this.update();

    event.stopPropagation();
  };

  PDBV.ViewSlice.prototype.dollyIn = function () {
    this.visiblePercent /= SCALE;
    if (this.visiblePercent > 1) {
      this.visiblePercent = 1;
    }
  };

  PDBV.ViewSlice.prototype.dollyOut = function () {
    this.visiblePercent *= SCALE;
    if (this.visiblePercent > 1) {
      this.visiblePercent = 1;
    }
  };

  PDBV.ViewSlice.prototype.update = function () {
    this.view.camera.offset = MAX_DISTANCE * this.visiblePercent;
    this.view.forCurrentModel(function (model) {
      model.syncCamera();
    });
    this.view.render();
  };

}());

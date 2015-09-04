/*global THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.gfx === undefined) {
  PDBV.gfx = {};
}

(function () {

  if (PDBV.gfx.SpherePlaceholder !== undefined) {
    return;
  }

  var SpherePlaceholder = function (center, radius, data) {
    this.sphere = new THREE.Sphere(center, radius);
    this.data = data;
  };

  PDBV.gfx.SpherePlaceholder = SpherePlaceholder;

  SpherePlaceholder.prototype = _.create(PDBV.gfx.Placeholder.prototype, {
    constructor: SpherePlaceholder
  });

  SpherePlaceholder.prototype.raycast = function (raycaster, intersects) {
    // TODO: 修复背后穿越的 bug
    if (raycaster.ray.isIntersectionSphere(this.sphere)) {
      intersects.push({
        distance: raycaster.ray.origin.distanceTo(this.sphere.center) - this.sphere.radius,
        object: this
      });
    }
  };

}());

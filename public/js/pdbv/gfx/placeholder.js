/*global THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.gfx === undefined) {
  PDBV.gfx = {};
}

(function () {

  if (PDBV.gfx.Placeholder !== undefined) {
    return;
  }

  var Placeholder = function () {};

  PDBV.gfx.Placeholder = Placeholder;

  Placeholder.prototype.raycast = function () {};

}());

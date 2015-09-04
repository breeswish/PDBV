/*global THREE */

var PDBV;

if(PDBV === undefined) {
  PDBV = {};
}

if(PDBV.coloring === undefined) {
  PDBV.coloring = {};
}
(function () {
  if (PDBV.coloring.byChains !== undefined) {
    return;
  }

  PDBV.coloring.byChains = function () {

  };

}());

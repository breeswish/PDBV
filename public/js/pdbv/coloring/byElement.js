/*global THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}
if (PDBV.coloring === undefined) {
  PDBV.coloring = {};
}

(function () {

  if (PDBV.coloring.byElement !== undefined) {
    return;
  }

  PDBV.coloring.byElement = function (mol, molMetaData) {
    var colorTable = PDBV.constant.elementColors;
    mol.forEachAtom(function (atom) {
      molMetaData[atom.uuid].color.set(colorTable[atom.element]);
    });
  };

}());

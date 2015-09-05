/*global THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}
if (PDBV.coloring === undefined) {
  PDBV.coloring = {};
}

(function () {
  if (PDBV.coloring.byAminoAcid !== undefined) {
    return;
  }

  PDBV.coloring.byAminoAcid = function (mol, molMetaData) {
    var colorTable = PDBV.constant.aminoAcidColors;
    mol.forEachAtom(function (atom) {
      molMetaData[atom.uuid].color.set(colorTable[atom.residue.name]);
    });
  };

}());

/*global THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}
if (PDBV.coloring === undefined) {
  PDBV.coloring = {};
}

(function () {
  if (PDBV.coloring.carbonByChain !== undefined) {
    return;
  }

  PDBV.coloring.carbonByChain = function (mol, molMetaData) {
    var colorTable = PDBV.constant.chainColors;
    mol.chains.forEach(function (chain, i) {
      chain.forEachAtom(function (atom) {
        if (atom.element === 'C') {
          molMetaData[atom.uuid].color.set(colorTable[i]);
        }
      });
    });
  };

}());

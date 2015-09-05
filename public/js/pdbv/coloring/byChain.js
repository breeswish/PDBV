/*global THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}
if (PDBV.coloring === undefined) {
  PDBV.coloring = {};
}

(function () {
  if (PDBV.coloring.byChain !== undefined) {
    return;
  }

  PDBV.coloring.byChain = function (mol, molMetaData) {
    var colorTable = PDBV.constant.chainColors;
    mol.chains.forEach(function (chain, i) {
      console.log(colorTable[i]);
      chain.forEachAtom(function (atom) {
        molMetaData[atom.uuid].color.set(colorTable[i]);
      });
    });
  };

}());

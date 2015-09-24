/*global THREE */
var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

(function () {

  PDBV.Mol = function () {
    this.reset.apply(this, arguments);
  };

  PDBV.Mol.prototype = _.create(PDBV.AtomsStructure.prototype, {
    constructor: PDBV.Mol
  });

  PDBV.Mol.prototype.reset = function (uuid, name) {
    this.uuid = uuid;
    this.name = name;
    this.chains = [];
    return this;
  };

  PDBV.Mol.prototype.addChain = function (chain) {
    chain.setMol(this);
    chain.setIndex(this.chains.length);
    this.chains.push(chain);
    return this;
  };

  PDBV.Mol.prototype.getAtomCount = function () {
    var count = 0;
    var i;
    for (i = 0; i < this.chains.length; ++i) {
      count += this.chains[i].getAtomCount();
    }
    return count;
  };

  PDBV.Mol.prototype.forEachAtom = function (callback) {
    var i;
    var indexOffset = 0;
    for (i = 0; i < this.chains.length; ++i) {
      indexOffset = this.chains[i].forEachAtom(callback, indexOffset);
      if (indexOffset === false) {
        return false;
      }
    }
    return indexOffset;
  };

}());

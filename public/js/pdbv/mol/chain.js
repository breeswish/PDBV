var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

(function () {

  PDBV.Chain = function () {
    this.reset.apply(this, arguments);
  };

  PDBV.Chain.prototype.reset = function (uuid, name) {
    this.mol = null;
    this.index = -1;
    this.uuid = uuid;
    this.name = name;
    this.residues = [];
  };

  PDBV.Chain.prototype.setMol = function (mol) {
    this.mol = mol;
    return this;
  };

  PDBV.Chain.prototype.setIndex = function (index) {
    this.index = index;
    return this;
  };

  PDBV.Chain.prototype.addResidue = function (residue) {
    residue.setChain(this);
    residue.setIndex(this.residues.length);
    this.residues.push(residue);
    return this;
  };

  PDBV.Chain.prototype.getAtomCount = function () {
    var count = 0;
    var i;
    for (i = 0; i < this.residues.length; ++i) {
      count += this.residues[i].getAtomCount();
    }
    return count;
  };

  PDBV.Chain.prototype.forEachAtom = function (callback, indexOffset) {
    var i;
    if (indexOffset === undefined) {
      indexOffset = 0;
    }
    for (i = 0; i < this.residues.length; ++i) {
      indexOffset = this.residues[i].forEachAtom(callback, indexOffset);
      if (indexOffset === false) {
        return false;
      }
    }
    return indexOffset;
  };

  PDBV.Chain.prototype.getCenter = function () {
    var x = 0, y = 0, z = 0;
    var count = this.getAtomCount();
    this.forEachAtom(function (atom) {
      x += atom.vector.x;
      y += atom.vector.y;
      z += atom.vector.z;
    });
    x /= count;
    y /= count;
    z /= count;
    return new THREE.Vector3(x, y, z);
  };

}());

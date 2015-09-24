var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

(function () {

  PDBV.Residue = function () {
    this.reset.apply(this, arguments);
  };

  PDBV.Residue.prototype = _.create(PDBV.AtomsStructure.prototype, {
    constructor: PDBV.Residue
  });

  PDBV.Residue.prototype.reset = function (uuid, name, num, insCode) {
    this.chain = null;
    this.index = -1;
    this.uuid = uuid;
    this.name = name;
    this.num = num;
    this.insCode = insCode;
    this._isAminoacid = null;
    this._isNucleotide = null;
    this.atoms = [];
  };

  PDBV.Residue.prototype.setChain = function (chain) {
    this.chain = chain;
    return this;
  };

  PDBV.Residue.prototype.setIndex = function (index) {
    this.index = index;
    return this;
  };

  PDBV.Residue.prototype.addAtom = function (atom) {
    atom.setResidue(this);
    atom.setIndex(this.atoms.length);
    this.atoms.push(atom);
    return this;
  };

  PDBV.Residue.prototype.getAtom = function (name) {
    var i;
    for (i = 0; i < this.atoms.length; ++i) {
      if (this.atoms[i].name === name) {
        return this.atoms[i];
      }
    }
    return null;
  };

  PDBV.Residue.prototype.isAminoacid = function () {
    if (this._isAminoacid === null) {
      this._isAminoacid = (
        this.getAtom('N') !== null && this.getAtom('CA') !== null && this.getAtom('C') !== null && this.getAtom('O') !== null
      );
    }
    return this._isAminoacid;
  };

  PDBV.Residue.prototype.isNucleotide = function () {
    if (this._isNucleotide === null) {
      this._isNucleotide = (
        this.getAtom('P') !== null && this.getAtom('C3\'') !== null
      );
    }
    return this._isNucleotide;
  };

  PDBV.Residue.prototype.isWater = function () {
    return this.name === 'HOH' || this.name === 'DOD';
  };

  PDBV.Residue.prototype.getAtomCount = function () {
    return this.atoms.length;
  };

  PDBV.Residue.prototype.forEachAtom = function (callback, indexOffset) {
    var i;
    if (indexOffset === undefined) {
      indexOffset = 0;
    }
    for (i = 0; i < this.atoms.length; ++i) {
      if (callback(this.atoms[i], indexOffset) === false) {
        return false;
      }
      indexOffset++;
    }
    return indexOffset;
  };

}());

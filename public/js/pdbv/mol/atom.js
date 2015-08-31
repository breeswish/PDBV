/*global THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

(function () {

  PDBV.Atom = function () {
    this.vector = new THREE.Vector3();
    this.reset.apply(this, arguments);
  };

  PDBV.Atom.prototype.reset = function (uuid, name, element, pos, num, tempFactor) {
    this.residue = null;
    this.index = -1;
    this.uuid = uuid;
    this.name = name;
    this.element = element;
    this.vector.copy(pos);
    this.num = num;
    this.tempFactor = tempFactor;
  };

  PDBV.Atom.prototype.setResidue = function (residue) {
    this.residue = residue;
  };

  PDBV.Atom.prototype.setIndex = function (index) {
    this.index = index;
  };

}());

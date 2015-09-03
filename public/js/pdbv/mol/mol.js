/*global THREE */
var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

(function () {

  PDBV.Mol = function () {
    this.reset.apply(this, arguments);
  };

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

  /**
   * 计算结构中心坐标
   */
  PDBV.Mol.prototype.getCenter = function () {
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

  /**
   * 计算整个结构半径（距离结构中心）
   */
  PDBV.Mol.prototype.getRadius = function () {
    var p = this.getCenter();
    var dis = 0;
    this.forEachAtom(function (atom) {
      dis = Math.max(dis, atom.vector.distanceTo(p));
    });
    return dis;
  };

}());

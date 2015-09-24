/*global THREE */
var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

(function () {

  PDBV.AtomsStructure = function () {};

  /**
   * 计算结构中心坐标
   */
  PDBV.AtomsStructure.prototype.getCenter = function () {
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
  PDBV.AtomsStructure.prototype.getRadius = function () {
    var p = this.getCenter();
    var dis = 0;
    this.forEachAtom(function (atom) {
      dis = Math.max(dis, atom.vector.distanceTo(p));
    });
    return dis;
  };

}());

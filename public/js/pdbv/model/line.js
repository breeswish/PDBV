/*global THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.model === undefined) {
  PDBV.model = {};
}

(function () {

  if (PDBV.model.Line !== undefined) {
    return;
  }

  var LineModel = function () {
    this.options = {
      lineWidth: 1
    };
    PDBV.model.Model.call(this);
  };

  PDBV.model.Line = LineModel;

  LineModel.prototype = _.create(PDBV.model.Model.prototype, {
    constructor: LineModel
  });

  LineModel.prototype.modelName = 'Line';

  LineModel.prototype.initGeometries = function () {
    var model = this;

    var connections = PDBV.util.convalent.buildConnections(this.view.mol);

    this.view.mol.chains.forEach(function (chain) {
      var geometry = new THREE.Geometry();
      chain.forEachAtom(function (atom) {
        connections[atom.num].forEach(function (cv) {
          geometry.vertices.push(atom.vector, cv);
        });
      });
      geometry.computeBoundingSphere();
      var material = new THREE.LineBasicMaterial({
        color: 0xFFFFFF,
        fog: true,
      });
      var lineSeries = new THREE.Line(geometry, material, THREE.LinePieces);
      model.group.add(lineSeries);
    });
  };

}());

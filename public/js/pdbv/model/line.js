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
    var colors = [];
    this.view.mol.chains.forEach(function (chain) {
      var geometry = new THREE.Geometry();
      chain.forEachAtom(function (atom) {
        connections[atom.num].forEach(function (cv) {
          geometry.vertices.push(atom.vector, cv);
          var color = new THREE.Color(0xEFFFFE);
          color.setRGB(view.molMetaData[atom.uuid].color[0],view.molMetaData[atom.uuid].color[1],view.molMetaData[atom.uuid].color[2]);
          colors.push(color);
        });
      });
      console.log(colors);
      geometry.computeBoundingSphere();
      geometry.colors = colors;
      var material = new THREE.LineBasicMaterial({
        color: 0xFFFFFF,
        fog: true,
        linewidth: 2,
        vertexColors: THREE.VertexColors
      });
      var lineSeries = new THREE.Line(geometry, material, THREE.LinePieces);
      model.group.add(lineSeries);
    });
  };



}());

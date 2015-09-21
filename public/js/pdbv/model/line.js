/*global THREE, Float32Array */

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
      lineWidth: 1,
      hittestAtomRadius: 0.2,
    };
    PDBV.model.Model.call(this);
  };

  PDBV.model.Line = LineModel;

  LineModel.prototype = _.create(PDBV.model.Model.prototype, {
    constructor: LineModel
  });

  LineModel.prototype.modelName = 'Line';

  LineModel.prototype.selectBoxOptions = {
    enabled: true,
    getSize: function () {
      return 0.2;
    },
    getWidth: function (atom, size) {
      return size * 0.5;
    },
  };

  LineModel.prototype.hotTrackBoxOptions = LineModel.prototype.selectBoxOptions;

  LineModel.prototype.initGeometries = function () {
    var model = this;

    var connections = PDBV.util.convalent.buildConnections(this.view.mol);
    this.connections = connections;

    this.lineMesh = [];

    var material = new THREE.LineBasicMaterial({
      fog: true,
      linewidth: 2,
      vertexColors: THREE.VertexColors
    });

    // 可点击
    this.view.mol.chains.forEach(function (chain) {
      chain.forEachAtom(function (atom) {
        model.interactiveObjects.push(new PDBV.gfx.SpherePlaceholder(atom.vector, model.options.hittestAtomRadius, atom));
      });
    });

    this.view.mol.chains.forEach(function (chain, i) {
      var lines = 0;
      chain.forEachAtom(function (atom) {
        lines += connections[atom.num].length;
      });
      var lineGeometry = new THREE.BufferGeometry();
      var bufPositions = new Float32Array(2 * 3 * lines);
      var bufColors = new Float32Array(2 * 3 * lines);
      var offset = 0;
      chain.forEachAtom(function (atom) {
        connections[atom.num].forEach(function (b) {
          bufPositions[offset + 0] = atom.vector.x;
          bufPositions[offset + 1] = atom.vector.y;
          bufPositions[offset + 2] = atom.vector.z;
          bufPositions[offset + 3] = b.x;
          bufPositions[offset + 4] = b.y;
          bufPositions[offset + 5] = b.z;
          offset += 6;
        });
      });
      lineGeometry.addAttribute('position', new THREE.BufferAttribute(bufPositions, 3));
      lineGeometry.addAttribute('color', new THREE.BufferAttribute(bufColors, 3));
      lineGeometry.computeBoundingSphere();

      var mesh = new THREE.Line(lineGeometry, material, THREE.LinePieces);
      model.group.add(mesh);
      model.lineMesh[i] = mesh;
    });

    this.syncColor();
  };

  LineModel.prototype.syncCamera = function () {
    PDBV.model.Model.prototype.syncCamera.call(this);
    var distance = this._distance;
    var model = this;
    this.view.mol.chains.forEach(function (chain, i) {
      if (model.lineMesh && model.lineMesh[i]) {
        model.lineMesh[i].material.linewidth = (1 / distance) * 50;
      }
    });
  };

  LineModel.prototype.syncColor = function () {
    var model = this;
    var view = this.view;
    var connections = this.connections;

    this.view.mol.chains.forEach(function (chain, i) {
      var offset = 0;
      var bufColors = model.lineMesh[i].geometry.attributes.color.array;
      chain.forEachAtom(function (atom) {
        var atomColor = view.molMetaData[atom.uuid].color;
        connections[atom.num].forEach(function () {
          bufColors.set(atomColor, offset);
          bufColors.set(atomColor, offset + 3);
          offset += 6;
        });
      });
      model.lineMesh[i].geometry.attributes.color.needsUpdate = true;
    });
  };

}());

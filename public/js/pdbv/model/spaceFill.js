/*global THREE, Float32Array */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.model === undefined) {
  PDBV.model = {};
}

(function () {

  if (PDBV.model.SpaceFill !== undefined) {
    return;
  }

  var SpaceFillModel = function () {
    PDBV.model.Model.call(this);
    this.options = {
      atomWidthSegments: 10,
      atomHeightSegments: 10
    };
    this.sphereGeometry = new PDBV.gfx.SphereGeometry(this.options.atomWidthSegments, this.options.atomHeightSegments);
  };

  PDBV.model.SpaceFill = SpaceFillModel;

  SpaceFillModel.prototype = _.create(PDBV.model.Model.prototype, {
    constructor: SpaceFillModel
  });

  SpaceFillModel.prototype.modelName = 'SpaceFill';

  SpaceFillModel.prototype.selectBoxOptions = {
    enabled: true,
    getSize: function (atom) {
      return PDBV.util.getAtomRadius(atom);
    },
    getWidth: function (atom, size) {
      return size * 0.5;
    },
  };

  SpaceFillModel.prototype.hotTrackBoxOptions = SpaceFillModel.prototype.selectBoxOptions;

  SpaceFillModel.prototype.initGeometries = function () {
    var model = this;

    // 每个球体有多少个顶点
    var sampleVertices = this.sphereGeometry.sampleVertices;

    this.sphereMesh = [];

    // for each chain, build a geometry
    this.view.mol.chains.forEach(function (chain, i) {
      var atoms = chain.getAtomCount();
      if (atoms === 0) {
        return;
      }
      var geometry = new THREE.BufferGeometry();
      var bufPositions = new Float32Array(sampleVertices * 3 * atoms);
      var bufNormals = new Float32Array(sampleVertices * 3 * atoms);
      var bufUVs = new Float32Array(sampleVertices * 2 * atoms);
      var bufColors = new Float32Array(sampleVertices * 3 * atoms);
      var offsets = {
        vector2: 0,
        vector3: 0
      };
      chain.forEachAtom(function (atom) {
        var radius = PDBV.util.getAtomRadius(atom);
        model.sphereGeometry.makeWithUV(radius, bufPositions, bufNormals, bufUVs, offsets, atom.vector);
        model.interactiveObjects.push(new PDBV.gfx.SpherePlaceholder(atom.vector, radius, atom));
      });
      geometry.addAttribute('position', new THREE.BufferAttribute(bufPositions, 3));
      geometry.addAttribute('normal', new THREE.BufferAttribute(bufNormals, 3));
      geometry.addAttribute('uv', new THREE.BufferAttribute(bufUVs, 2));
      geometry.addAttribute('color', new THREE.BufferAttribute(bufColors, 3));
      geometry.computeBoundingSphere();

      var material = new THREE.MeshPhongMaterial({vertexColors: THREE.VertexColors});
      var mesh = new THREE.Mesh(geometry, material);
      model.group.add(mesh);
      model.sphereMesh[i] = mesh;
    });

    this.syncColor();
  };

  SpaceFillModel.prototype.syncColor = function () {
    var model = this;
    var view = this.view;

    // build atom color
    this.view.mol.chains.forEach(function (chain, i) {
      var offsets = {
        vector3: 0
      };
      var bufColors = model.sphereMesh[i].geometry.attributes.color.array;
      chain.forEachAtom(function (atom) {
        model.sphereGeometry.makeColor(bufColors, offsets, view.molMetaData[atom.uuid].color);
      });
      model.sphereMesh[i].geometry.attributes.color.needsUpdate = true;
    });
  };

}());

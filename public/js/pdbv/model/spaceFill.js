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

  SpaceFillModel.prototype.initGeometries = function () {
    var model = this;

    // 每个球体有多少个顶点
    var sampleVertices = PDBV.gfx.sphereGeometry.getSampleVertices(this.options.atomWidthSegments, this.options.atomHeightSegments);

    // for each chain, build a geometry
    this.view.mol.chains.forEach(function (chain) {
      var atoms = chain.getAtomCount();
      if (atoms === 0) {
        return;
      }
      var geometry = new THREE.BufferGeometry();
      var bufPositions = new Float32Array(sampleVertices * 3 * atoms);
      var bufNormals = new Float32Array(sampleVertices * 3 * atoms);
      var bufUVs = new Float32Array(sampleVertices * 2 * atoms);
      var offsets = {
        vector2: 0,
        vector3: 0
      };
      chain.forEachAtom(function (atom) {
        var radius = PDBV.util.getAtomRadius(atom);
        PDBV.gfx.sphereGeometry.makeWithUV(radius, model.options.atomWidthSegments, model.options.atomHeightSegments, bufPositions, bufNormals, bufUVs, offsets, atom.vector);
        model.interactiveObjects.push(new PDBV.gfx.SpherePlaceholder(atom.vector, radius, atom));
      });
      geometry.addAttribute('position', new THREE.BufferAttribute(bufPositions, 3));
      geometry.addAttribute('normal', new THREE.BufferAttribute(bufNormals, 3));
      geometry.addAttribute('uv', new THREE.BufferAttribute(bufUVs, 2));
      geometry.computeBoundingSphere();

      var material = new THREE.MeshLambertMaterial({ color: 0x669966 });
      var mesh = new THREE.Mesh(geometry, material);

      model.group.add(mesh);
    });

  };

}());

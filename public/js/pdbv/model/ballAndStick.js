/*global THREE, Float32Array */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.model === undefined) {
  PDBV.model = {};
}

(function () {

  if (PDBV.model.BallAndStick !== undefined) {
    return;
  }

  var BallAndStickModel = function () {
    PDBV.model.Model.call(this);
    this.options = {
      atomWidthSegments: 10,
      atomHeightSegments: 10,
      atomRadius: 0.3,
      stickRadius: 0.3,
      stickSegments: 8
    };
    this.sphereGeometry = new PDBV.gfx.SphereGeometry(this.options.atomWidthSegments, this.options.atomHeightSegments);
    this.stickGeometry = new PDBV.gfx.StickGeometry(this.options.stickSegments);
  };

  PDBV.model.BallAndStick = BallAndStickModel;

  BallAndStickModel.prototype = _.create(PDBV.model.Model.prototype, {
    constructor: BallAndStickModel
  });

  BallAndStickModel.prototype.modelName = 'BallAndStick';

  BallAndStickModel.prototype.selectBoxOptions = {
    enabled: true,
    getSize: function (atom) {
      return 0.3;
    },
    getWidth: function (atom, size) {
      return size * 0.5;
    },
  };

  BallAndStickModel.prototype.initGeometries = function () {
    var model = this;

    var connections = PDBV.util.convalent.buildConnections(this.view.mol);
    this.connections = connections;

    var sampleAtomVertices = this.sphereGeometry.sampleVertices;
    var sampleStickVertices = this.stickGeometry.sampleVertices;

    this.sphereMesh = [];
    this.stickMesh = [];

    // build atom geometry
    this.view.mol.chains.forEach(function (chain, i) {
      var atoms = chain.getAtomCount();
      var atomGeometry = new THREE.BufferGeometry();
      var bufPositions = new Float32Array(sampleAtomVertices * 3 * atoms);
      var bufNormals = new Float32Array(sampleAtomVertices * 3 * atoms);
      var bufUVs = new Float32Array(sampleAtomVertices * 2 * atoms);
      var bufColors = new Float32Array(sampleAtomVertices * 3 * atoms);
      var offsets = {
        vector2: 0,
        vector3: 0
      };
      chain.forEachAtom(function (atom) {
        model.sphereGeometry.makeWithUV(model.options.atomRadius, bufPositions, bufNormals, bufUVs, offsets, atom.vector);
        model.interactiveObjects.push(new PDBV.gfx.SpherePlaceholder(atom.vector, model.options.atomRadius, atom));
      });
      atomGeometry.addAttribute('position', new THREE.BufferAttribute(bufPositions, 3));
      atomGeometry.addAttribute('normal', new THREE.BufferAttribute(bufNormals, 3));
      atomGeometry.addAttribute('uv', new THREE.BufferAttribute(bufUVs, 2));
      atomGeometry.addAttribute('color', new THREE.BufferAttribute(bufColors, 3));
      atomGeometry.computeBoundingSphere();

      var material = new THREE.MeshPhongMaterial({vertexColors: THREE.VertexColors});
      var mesh = new THREE.Mesh(atomGeometry, material);
      model.group.add(mesh);
      model.sphereMesh[i] = mesh;
    });

    // build stick geometry
    this.view.mol.chains.forEach(function (chain, i) {
      var sticks = 0;
      chain.forEachAtom(function (atom) {
        sticks += connections[atom.num].length;
      });
      var stickGeometry = new THREE.BufferGeometry();
      var bufPositions = new Float32Array(sampleStickVertices * 3 * sticks);
      var bufNormals = new Float32Array(sampleStickVertices * 3 * sticks);
      var bufUVs = new Float32Array(sampleStickVertices * 2 * sticks);
      var bufColors = new Float32Array(sampleAtomVertices * 3 * sticks);
      var offsets = {
        vector2: 0,
        vector3: 0
      };
      chain.forEachAtom(function (atom) {
        connections[atom.num].forEach(function (b) {
          model.stickGeometry.makeWithUV(model.options.stickRadius, bufPositions, bufNormals, bufUVs, offsets, atom.vector, b);
        });
      });
      stickGeometry.addAttribute('position', new THREE.BufferAttribute(bufPositions, 3));
      stickGeometry.addAttribute('normal', new THREE.BufferAttribute(bufNormals, 3));
      stickGeometry.addAttribute('uv', new THREE.BufferAttribute(bufUVs, 2));
      stickGeometry.addAttribute('color', new THREE.BufferAttribute(bufColors, 3));
      stickGeometry.computeBoundingSphere();

      var material = new THREE.MeshPhongMaterial({vertexColors: THREE.VertexColors});
      var mesh = new THREE.Mesh(stickGeometry, material);
      model.group.add(mesh);
      model.stickMesh[i] = mesh;
    });

    this.syncColor();
  };

  BallAndStickModel.prototype.syncColor = function () {
    var model = this;
    var view = this.view;
    var connections = this.connections;

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

    // build stick color
    this.view.mol.chains.forEach(function (chain, i) {
      var offsets = {
        vector3: 0
      };
      var bufColors = model.stickMesh[i].geometry.attributes.color.array;
      chain.forEachAtom(function (atom) {
        var atomColor = view.molMetaData[atom.uuid].color;
        connections[atom.num].forEach(function () {
          model.stickGeometry.makeColor(bufColors, offsets, atomColor);
        });
      });
      model.stickMesh[i].geometry.attributes.color.needsUpdate = true;
    });
  };

}());

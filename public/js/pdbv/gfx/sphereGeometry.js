/*global THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.gfx === undefined) {
  PDBV.gfx = {};
}

(function () {

  if (PDBV.gfx.SphereGeometry !== undefined) {
    return;
  }

  var SphereGeometry = function (widthSegments, heightSegments) {
    this.widthSegments = widthSegments;
    this.heightSegments = heightSegments;
    this.sampleVertices = (this.widthSegments * this.heightSegments * 2 - this.widthSegments - this.heightSegments) * 3;
    this.sampleVertices3 = this.sampleVertices * 3;
    this.sampleVertices2 = this.sampleVertices * 2;
    this._cache = {};
  };

  PDBV.gfx.SphereGeometry = SphereGeometry;

  SphereGeometry.prototype.getBufferGeometry = function (radius) {
    if (this._cache[radius] === undefined) {
      var geometry = new THREE.SphereGeometry(radius, this.widthSegments, this.heightSegments);
      var bufferGeometry = new THREE.BufferGeometry();
      bufferGeometry.fromGeometry(geometry);
      this._cache[radius] = bufferGeometry;
    }
    return this._cache[radius];
  };

  SphereGeometry.prototype.makeWithUV = function (radius, bufPositions, bufNormals, bufUVs, offsets, a) {
    var sampleGeom = this.getBufferGeometry(radius);

    // copy normals and uvs
    bufNormals.set(sampleGeom.attributes.position.array, offsets.vector3);
    bufUVs.set(sampleGeom.attributes.uv.array, offsets.vector2);

    // offset positions
    var sampleBufPositions = sampleGeom.attributes.position.array;
    var i, len;
    for (i = 0, len = sampleBufPositions.length; i < len; i += 3) {
      bufPositions[i + offsets.vector3 + 0] = sampleBufPositions[i + 0] + a.x;
      bufPositions[i + offsets.vector3 + 1] = sampleBufPositions[i + 1] + a.y;
      bufPositions[i + offsets.vector3 + 2] = sampleBufPositions[i + 2] + a.z;
    }

    offsets.vector3 += this.sampleVertices3;
    offsets.vector2 += this.sampleVertices2;
  };

  SphereGeometry.prototype.makeColor = function (bufColors, offsets, color) {
    var i, len;
    for (i = 0, len = this.sampleVertices3; i < len; i += 3) {
      bufColors.set(color, offsets.vector3);
      offsets.vector3 += 3;
    }
  };

}());

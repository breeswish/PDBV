/*global THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.gfx === undefined) {
  PDBV.gfx = {};
}

(function () {

  if (PDBV.gfx.sphereGeometry !== undefined) {
    return;
  }

  var sphereGeometry = {};
  PDBV.gfx.sphereGeometry = sphereGeometry;

  var _cache = {};

  var getBufferGeometry = function (radius, widthSegments, heightSegments) {
    var cacheKey = radius + '_' + widthSegments + '_' + heightSegments;
    if (_cache[cacheKey] === undefined) {
      var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
      var bufferGeometry = new THREE.BufferGeometry();
      bufferGeometry.fromGeometry(geometry);
      _cache[cacheKey] = bufferGeometry;
    }
    return _cache[cacheKey];
  };

  sphereGeometry.getSampleVertices = function (widthSegments, heightSegments) {
    return (widthSegments * heightSegments * 2 - widthSegments - heightSegments) * 3;
  };

  sphereGeometry.makeWithUV = function (radius, widthSegments, heightSegments, bufPositions, bufNormals, bufUVs, offsets, a) {
    var sampleGeom = getBufferGeometry(radius, widthSegments, heightSegments);

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

    offsets.vector3 += sampleGeom.attributes.position.array.length;
    offsets.vector2 += sampleGeom.attributes.uv.array.length;
  };

}());

/*global THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.gfx === undefined) {
  PDBV.gfx = {};
}

(function () {

  if (PDBV.gfx.stickGeometry !== undefined) {
    return;
  }

  var stickGeometry = {};
  PDBV.gfx.stickGeometry = stickGeometry;

  stickGeometry.getSampleVertices = function (segments) {
    // 2 triangle / face & 3 vertics / triangle
    return segments * 2 * 3;
  };

  var SEGMENTS_MAX = 20;

  // ====== pre allocate space ======
  var vec = new THREE.Vector3();
  var vecPoint3 = new THREE.Vector3();
  var vec1 = new THREE.Vector3();
  var vec2 = new THREE.Vector3();
  var vecNormal = new THREE.Vector3();
  var vecNormalT = new THREE.Vector3();
  var seg = new THREE.Vector3();

  var pa = [], pb = [], normals = [], _i;
  for (_i = 0; _i < SEGMENTS_MAX; ++_i) {
    pa[_i] = new THREE.Vector3();
    pb[_i] = new THREE.Vector3();
    normals[_i] = new THREE.Vector3();
  }
  // ================================

  stickGeometry.makeWithUV = function (segments, radius, bufPositions, bufNormals, bufUVs, offsets, a, b) {
    var v, cx, cy;
    var ip, va, vb, vc, vd, na, nb, nc, nd, uva, uvb, uvc, uvd;
    var i;

    vec.subVectors(a, b);
    vecPoint3.set(a.x + 1, a.y, a.z);
    vec1.subVectors(a, vecPoint3);
    vec2.subVectors(b, vecPoint3);
    vecNormal.crossVectors(vec1, vec2).normalize();
    vecNormalT.crossVectors(vecNormal, vec).normalize();

    for (i = 0; i < segments; ++i) {
      v = i / segments * 2 * Math.PI;
      cx = -radius * Math.cos(v);
      cy = radius * Math.sin(v);
      seg.x = cx * vecNormal.x + cy * vecNormalT.x;
      seg.y = cx * vecNormal.y + cy * vecNormalT.y;
      seg.z = cx * vecNormal.z + cy * vecNormalT.z;
      normals[i].copy(seg).normalize();
      pa[i].copy(seg).add(a);
      pb[i].copy(seg).add(b);
    }

    // create surface
    for (i = 0; i < segments; ++i) {
      ip = (i + 1) % segments;
      va = pa[i];
      vb = pb[i];
      vc = pb[ip];
      vd = pa[ip];
      uva = [0, i / segments];
      uvb = [1, i / segments];
      uvc = [1, (i + 1) / segments];
      uvd = [0, (i + 1) / segments];
      na = normals[i];
      nb = normals[i];
      nc = normals[ip];
      nd = normals[ip];
      PDBV.gfx.face.makeWithUV(bufPositions, bufNormals, bufUVs, offsets, va, vb, vc, vd, na, nb, nc, nd, uva, uvb, uvc, uvd);
    }
  };

}());

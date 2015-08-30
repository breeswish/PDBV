var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.gfx === undefined) {
  PDBV.gfx = {};
}

(function () {

  if (PDBV.gfx.triangle !== undefined) {
    return;
  }

  var triangle = {};
  PDBV.gfx.triangle = triangle;

  triangle.makeWithUV = function (bufPositions, bufNormals, bufUVs, offsets, a, b, c, na, nb, nc, uva, uvb, uvc) {
    bufPositions[offsets.vector3] = a.x;
    bufPositions[offsets.vector3 + 1] = a.y;
    bufPositions[offsets.vector3 + 2] = a.z;
    bufPositions[offsets.vector3 + 3] = b.x;
    bufPositions[offsets.vector3 + 4] = b.y;
    bufPositions[offsets.vector3 + 5] = b.z;
    bufPositions[offsets.vector3 + 6] = c.x;
    bufPositions[offsets.vector3 + 7] = c.y;
    bufPositions[offsets.vector3 + 8] = c.z;
    bufNormals[offsets.vector3 + 0] = na.x;
    bufNormals[offsets.vector3 + 1] = na.y;
    bufNormals[offsets.vector3 + 2] = na.z;
    bufNormals[offsets.vector3 + 3] = nb.x;
    bufNormals[offsets.vector3 + 4] = nb.y;
    bufNormals[offsets.vector3 + 5] = nb.z;
    bufNormals[offsets.vector3 + 6] = nc.x;
    bufNormals[offsets.vector3 + 7] = nc.y;
    bufNormals[offsets.vector3 + 8] = nc.z;
    bufUVs[offsets.vector2 + 0] = uva[0];
    bufUVs[offsets.vector2 + 1] = uva[1];
    bufUVs[offsets.vector2 + 2] = uvb[0];
    bufUVs[offsets.vector2 + 3] = uvb[1];
    bufUVs[offsets.vector2 + 4] = uvc[0];
    bufUVs[offsets.vector2 + 5] = uvc[1];
    offsets.vector3 += 9;
    offsets.vector2 += 6;
  };

}());

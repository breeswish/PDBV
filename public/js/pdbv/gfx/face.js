var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.gfx === undefined) {
  PDBV.gfx = {};
}

(function () {

  if (PDBV.gfx.face !== undefined) {
    return;
  }

  var face = {};
  PDBV.gfx.face = face;

  face.makeWithUV = function (bufPositions, bufNormals, bufUVs, offsets, a, b, c, d, na, nb, nc, nd, uva, uvb, uvc, uvd) {
    PDBV.gfx.triangle.makeWithUV(bufPositions, bufNormals, bufUVs, offsets, a, b, d, na, nb, nd, uva, uvb, uvd);
    PDBV.gfx.triangle.makeWithUV(bufPositions, bufNormals, bufUVs, offsets, b, c, d, nb, nc, nd, uvb, uvc, uvd);
  };

}());

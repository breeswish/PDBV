/*global THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.gfx === undefined) {
  PDBV.gfx = {};
}

(function () {

  if (PDBV.gfx.selectionBoxGeometry !== undefined) {
    return;
  }

  var selectionBoxGeometry = {};
  PDBV.gfx.selectionBoxGeometry = selectionBoxGeometry;

  selectionBoxGeometry.getSampleVertices = function () {
    return 3 * 2 * 8;
  };

  selectionBoxGeometry.makeLines = function (radius, width, bufPositions, offsets, a) {
    var sx, sy, sz, ox, oy, oz, dx, dy, dz;
    for (sx = -1; sx <= 1; sx += 2) {
      for (sy = -1; sy <= 1; sy += 2) {
        for (sz = -1; sz <= 1; sz += 2) {
          ox = a.x + sx * radius;
          oy = a.y + sy * radius;
          oz = a.z + sz * radius;
          dx = ox - sx * width;
          dy = oy - sy * width;
          dz = oz - sz * width;
          bufPositions[offsets.vector3 + 0] = ox;
          bufPositions[offsets.vector3 + 1] = oy;
          bufPositions[offsets.vector3 + 2] = oz;
          bufPositions[offsets.vector3 + 3] = ox;
          bufPositions[offsets.vector3 + 4] = oy;
          bufPositions[offsets.vector3 + 5] = dz;
          offsets.vector3 += 6;
          bufPositions[offsets.vector3 + 0] = ox;
          bufPositions[offsets.vector3 + 1] = oy;
          bufPositions[offsets.vector3 + 2] = oz;
          bufPositions[offsets.vector3 + 3] = ox;
          bufPositions[offsets.vector3 + 4] = dy;
          bufPositions[offsets.vector3 + 5] = oz;
          offsets.vector3 += 6;
          bufPositions[offsets.vector3 + 0] = ox;
          bufPositions[offsets.vector3 + 1] = oy;
          bufPositions[offsets.vector3 + 2] = oz;
          bufPositions[offsets.vector3 + 3] = dx;
          bufPositions[offsets.vector3 + 4] = oy;
          bufPositions[offsets.vector3 + 5] = oz;
          offsets.vector3 += 6;
        }
      }
    }
  };

}());

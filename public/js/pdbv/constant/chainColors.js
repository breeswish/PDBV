/*global Float32Array*/

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.constant === undefined) {
  PDBV.constant = {};
}

(function () {
  if (PDBV.constant.chainColors !== undefined) {
    return;
  }

  PDBV.constant.chainColors = [
    new Float32Array([0, 1, 1]),
    new Float32Array([1, 1, 0]),
    new Float32Array([1, 0.6, 0.6]),
    new Float32Array([0.5, 1, 0.5]),
    new Float32Array([0.5, 0.5, 1]),
    new Float32Array([1, 0, 0.5]),
    new Float32Array([1, 0.5, 0]),
    new Float32Array([0.5, 1, 0]),
    new Float32Array([0, 1, 0.5]),
    new Float32Array([0.5, 0, 1]),
    new Float32Array([0, 0.5, 1]),
    new Float32Array([0.77, 0.7, 0]),
    new Float32Array([0.75, 0, 0.75]),
    new Float32Array([0, 0.75, 0.75]),
    new Float32Array([0.6, 0.2, 0.2]),
    new Float32Array([0.2, 0.6, 0.2]),
    new Float32Array([0.25, 0.25, 0.65]),
  ];
}());

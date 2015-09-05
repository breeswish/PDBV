/*global Float32Array*/
var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.constant === undefined) {
  PDBV.constant = {};
}

(function () {
  if (PDBV.constant.aminoAcidColors !== undefined) {
    return;
  }

  PDBV.constant.aminoAcidColors = {
    "GLY": new Float32Array([0.698, 0.13, 0.13]),
    "ALA": new Float32Array([0.555, 0.222, 0.111]),
    "VAL": new Float32Array([0.65, 0.32, 0.17]),
    "LEU": new Float32Array([0.99, 0.82, 0.65]),
    "ILE": new Float32Array([1, 0.2, 0.8]),
    "PHE": new Float32Array([0.73, 0.55, 0.52]),
    "TRP": new Float32Array([0.75, 1, 0.25]),
    "TYR": new Float32Array([0.2, 0.5, 0.8]),
    "ASP": new Float32Array([0.85, 0.85, 1]),
    "HIS": new Float32Array([0.85, 0.2, 0.5]),
    "ASN": new Float32Array([0.25, 1, 0.75]),
    "GLU": new Float32Array([0.55, 0.7, 0.4]),
    "LYS": new Float32Array([0.55, 0.25, 0.6]),
    "GLN": new Float32Array([0.7, 0.5, 0.5]),
    "MET": new Float32Array([0.52, 0.75, 0]),
    "ARG": new Float32Array([1, 0.8, 0.5]),
    "SER": new Float32Array([0.4, 0.7, 0.7]),
    "THR": new Float32Array([0.65, 0.9, 0.65]),
    "CYS": new Float32Array([0.6, 0.6, 0.1]),
    "PRO": new Float32Array([0.112, 1, 0])
  };

}());

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if(PDBV.constant === undefined) {
  PDBV.constant = {};
}

(function () {
  if (PDBV.constant.colorTable !== undefined) {
    return;
  }

  PDBV.constant.colorTable = {
    "carbon": [0.2,1.0,0.2],
    "oxygen": [1.0,0.3,0.3],
    "hydrogen":[0.9,0.9,0.9],

  }
}());

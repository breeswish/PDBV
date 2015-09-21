/*global PDB_DATA, THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

(function () {

  if (PDBV.loader !== undefined) {
    return;
  }

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = (c === 'x' ? r : (r & 0x3 | 0x8));
      return v.toString(16);
    });
  }

  PDBV.loader = {

    load: function (data, id) {
      var atomCounter = 0;
      // TODO: parse PDB file
      var mol = new PDBV.Mol(id /* todo: uuid */, id);
      data.chains.forEach(function (chainData) {
        var chain = new PDBV.Chain(uuid() /* todo: uuid */, chainData.chain_id);
        mol.addChain(chain);
        chainData.aminos.forEach(function (aminoData) {
          if (PDBV.constant.aminoAbbr[aminoData.res_name] === undefined) {
            return;
          }
          var residue = new PDBV.Residue(uuid() /* todo: uuid */, aminoData.res_name, aminoData.res_seq, aminoData.i_code.trim());
          chain.addResidue(residue);
          aminoData.atoms.forEach(function (atomData) {
            var pos = new THREE.Vector3();
            pos.x = atomData.x;
            pos.y = atomData.y;
            pos.z = atomData.z;
            var atom = new PDBV.Atom(uuid() /* todo: uuid */, atomData.name, atomData.element, pos, ++atomCounter, atomData.temp_factor);
            residue.addAtom(atom);
          });
        });
      });
      return mol;
    },

  };

}());

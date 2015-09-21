/*global THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

(function () {

  if (PDBV.util !== undefined) {
    return;
  }

  var util = {

    getCovalentRadius: function (element) {
      var val = PDBV.constant.elementCovalentRadius[element];
      if (val !== undefined) {
        return val;
      }
      return 1.5;
    },

    getAtomRadius: function (atom) {
      var v = PDBV.constant.atomRadius[atom.residue.name + ' ' + atom.name];
      if (v !== undefined) {
        return v;
      }
      if (atom.element === 'H') {
        return 1;
      }
      return 1.5;
    },

    convalent: {

      _connectAtoms: function (connectionStructure, a, b) {
        //console.log(a, b);
        var boneMid = new THREE.Vector3();
        boneMid.addVectors(a.vector, b.vector).divideScalar(2);
        connectionStructure[a.num].push(boneMid);
        connectionStructure[b.num].push(boneMid);
      },

      _connectPeptides: function (connectionStructure, left, right) {
        var cAtom = left.getAtom('C');
        var nAtom = right.getAtom('N');
        var dis;
        if (cAtom !== null && nAtom !== null) {
          dis = cAtom.vector.distanceTo(nAtom.vector);
          if (dis < 1.6) {
            util.convalent._connectAtoms(connectionStructure, nAtom, cAtom);
          }
        }
      },

      _connectNucleotides: function (connectionStructure, left, right) {
        var o3Prime = left.getAtom('O3\'');
        var pAtom = right.getAtom('P');
        var dis;
        if (o3Prime !== null && pAtom !== null) {
          dis = o3Prime.vector.distanceTo(pAtom.vector);
          if (dis < 1.7) {
            util.convalent._connectAtoms(connectionStructure, o3Prime, pAtom);
          }
        }
      },

      buildConnections: function (mol) {
        var atomConnections = {};
        var lastResidue = null;
        mol.forEachAtom(function (atom) {
          atomConnections[atom.num] = [];
        });
        mol.chains.forEach(function (chain) {
          chain.residues.forEach(function (residue) {
            var i, j;
            var ci, cj, lower, upper, dis;
            for (i = 0; i < residue.atoms.length; ++i) {
              for (j = 0; j < i; ++j) {
                ci = util.getCovalentRadius(residue.atoms[i].element);
                cj = util.getCovalentRadius(residue.atoms[i].element);
                lower = ci + cj - 0.30;
                upper = ci + cj + 0.30;
                dis = residue.atoms[i].vector.distanceTo(residue.atoms[j].vector);
                if (dis < upper && dis > lower) {
                  util.convalent._connectAtoms(atomConnections, residue.atoms[i], residue.atoms[j]);
                }
              }
            }
            if (lastResidue !== null) {
              if (residue.isAminoacid() && lastResidue.isAminoacid()) {
                util.convalent._connectPeptides(atomConnections, lastResidue, residue);
              }
              if (residue.isNucleotide() && lastResidue.isNucleotide()) {
                util.convalent._connectNucleotides(atomConnections, lastResidue, residue);
              }
            }
            lastResidue = residue;
          });
        });
        return atomConnections;
      },

    },

  };

  PDBV.util = util;

}());

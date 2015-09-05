var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.constant === undefined) {
  PDBV.constant = {};
}

(function () {

  if (PDBV.constant.aminoAbbr !== undefined) {
    return;
  }

  PDBV.constant.aminoAbbr = {
    'GLY': 'G',
    'ALA': 'A',
    'VAL': 'V',
    'LEU': 'L',
    'ILE': 'I',
    'PHE': 'F',
    'TRP': 'W',
    'TYR': 'Y',
    'ASP': 'D',
    'HIS': 'H',
    'ASN': 'N',
    'GLU': 'E',
    'LYS': 'K',
    'GLN': 'Q',
    'MET': 'M',
    'ARG': 'R',
    'SER': 'S',
    'THR': 'T',
    'CYS': 'C',
    'PRO': 'P',
  };

}());

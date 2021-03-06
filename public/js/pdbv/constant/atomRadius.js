var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.constant === undefined) {
  PDBV.constant = {};
}

(function () {

  if (PDBV.constant.atomRadius !== undefined) {
    return;
  }

  PDBV.constant.atomRadius = {
    "ALA C": 1.67,
    "ALA CA": 2.03,
    "ALA CB": 1.94,
    "ALA N": 1.63,
    "ALA O": 1.38,
    "ALA OT2": 1.48,
    "ALA OXT": 1.48,
    "ARG C": 1.67,
    "ARG CA": 2.03,
    "ARG CB": 1.99,
    "ARG CD": 1.99,
    "ARG CG": 1.99,
    "ARG CZ": 1.67,
    "ARG N": 1.63,
    "ARG NE": 1.63,
    "ARG NH1": 1.63,
    "ARG NH2": 1.63,
    "ARG O": 1.38,
    "ARG OT2": 1.48,
    "ARG OXT": 1.48,
    "ASN C": 1.67,
    "ASN CA": 2.03,
    "ASN CB": 1.99,
    "ASN CG": 1.67,
    "ASN N": 1.63,
    "ASN ND2": 1.63,
    "ASN O": 1.38,
    "ASN OD1": 1.38,
    "ASN OT2": 1.48,
    "ASN OXT": 1.48,
    "ASP C": 1.67,
    "ASP CA": 2.03,
    "ASP CB": 1.99,
    "ASP CG": 1.67,
    "ASP N": 1.63,
    "ASP O": 1.38,
    "ASP OD1": 1.48,
    "ASP OD2": 1.48,
    "ASP OT2": 1.48,
    "ASP OXT": 1.48,
    "CYS C": 1.67,
    "CYS CA": 2.03,
    "CYS CB": 1.99,
    "CYS N": 1.63,
    "CYS O": 1.38,
    "CYS OT2": 1.48,
    "CYS OXT": 1.48,
    "CYS SG": 1.69,
    "GLN C": 1.67,
    "GLN CA": 2.03,
    "GLN CB": 1.99,
    "GLN CD": 1.67,
    "GLN CG": 1.99,
    "GLN N": 1.63,
    "GLN NE2": 1.63,
    "GLN O": 1.38,
    "GLN OE1": 1.38,
    "GLN OT2": 1.48,
    "GLN OXT": 1.48,
    "GLU C": 1.67,
    "GLU CA": 2.03,
    "GLU CB": 1.99,
    "GLU CD": 1.67,
    "GLU CG": 1.99,
    "GLU N": 1.63,
    "GLU O": 1.38,
    "GLU OE1": 1.48,
    "GLU OE2": 1.48,
    "GLU OT2": 1.48,
    "GLU OXT": 1.48,
    "GLY C": 1.67,
    "GLY CA": 1.99,
    "GLY N": 1.63,
    "GLY O": 1.38,
    "GLY OT2": 1.48,
    "GLY OXT": 1.48,
    "HIS C": 1.67,
    "HIS CA": 2.03,
    "HIS CB": 1.99,
    "HIS CD2": 1.87,
    "HIS CE1": 1.87,
    "HIS CG": 1.82,
    "HIS N": 1.63,
    "HIS ND1": 1.54,
    "HIS NE2": 1.54,
    "HIS O": 1.38,
    "HIS OT2": 1.48,
    "HIS OXT": 1.48,
    "ILE C": 1.67,
    "ILE CA": 2.03,
    "ILE CB": 2.03,
    "ILE CD1": 1.94,
    "ILE CG1": 1.99,
    "ILE CG2": 1.94,
    "ILE N": 1.63,
    "ILE O": 1.38,
    "ILE OT2": 1.48,
    "ILE OXT": 1.48,
    "LEU C": 1.67,
    "LEU CA": 2.03,
    "LEU CB": 1.99,
    "LEU CD1": 1.94,
    "LEU CD2": 1.94,
    "LEU CG": 2.03,
    "LEU N": 1.63,
    "LEU O": 1.38,
    "LEU OT2": 1.48,
    "LEU OXT": 1.48,
    "LYS C": 1.67,
    "LYS CA": 2.03,
    "LYS CB": 1.99,
    "LYS CD": 1.99,
    "LYS CE": 1.99,
    "LYS CG": 1.99,
    "LYS N": 1.63,
    "LYS NZ": 1.47,
    "LYS O": 1.38,
    "LYS OT2": 1.48,
    "LYS OXT": 1.48,
    "MET C": 1.67,
    "MET CA": 2.03,
    "MET CB": 1.99,
    "MET CE": 1.94,
    "MET CG": 1.99,
    "MET N": 1.63,
    "MET O": 1.38,
    "MET OT2": 1.48,
    "MET OXT": 1.48,
    "MET SD": 1.76,
    "PHE C": 1.67,
    "PHE CA": 2.03,
    "PHE CB": 1.99,
    "PHE CD1": 1.78,
    "PHE CD2": 1.78,
    "PHE CE1": 1.78,
    "PHE CE2": 1.78,
    "PHE CG": 1.82,
    "PHE CZ": 1.78,
    "PHE N": 1.63,
    "PHE O": 1.38,
    "PHE OT2": 1.48,
    "PHE OXT": 1.48,
    "PRO C": 1.67,
    "PRO CA": 2.03,
    "PRO CB": 1.99,
    "PRO CD": 1.99,
    "PRO CG": 1.99,
    "PRO N": 1.63,
    "PRO O": 1.38,
    "PRO OT2": 1.48,
    "PRO OXT": 1.48,
    "SER C": 1.67,
    "SER CA": 2.03,
    "SER CB": 1.99,
    "SER N": 1.63,
    "SER O": 1.38,
    "SER OG": 1.38,
    "SER OT2": 1.48,
    "SER OXT": 1.48,
    "THR C": 1.67,
    "THR CA": 2.03,
    "THR CB": 2.03,
    "THR CG2": 1.94,
    "THR N": 1.63,
    "THR O": 1.38,
    "THR OG1": 1.38,
    "THR OT2": 1.48,
    "THR OXT": 1.48,
    "TRP C": 1.67,
    "TRP CA": 2.03,
    "TRP CB": 1.99,
    "TRP CD1": 1.87,
    "TRP CD2": 1.82,
    "TRP CE2": 1.82,
    "TRP CE3": 1.78,
    "TRP CG": 1.82,
    "TRP CH2": 1.78,
    "TRP CZ2": 1.78,
    "TRP CZ3": 1.78,
    "TRP N": 1.63,
    "TRP NE1": 1.54,
    "TRP O": 1.38,
    "TRP OT2": 1.48,
    "TRP OXT": 1.48,
    "TYR C": 1.67,
    "TYR CA": 2.03,
    "TYR CB": 1.99,
    "TYR CD1": 1.78,
    "TYR CD2": 1.78,
    "TYR CE1": 1.78,
    "TYR CE2": 1.78,
    "TYR CG": 1.82,
    "TYR CZ": 1.82,
    "TYR N": 1.63,
    "TYR O": 1.38,
    "TYR OH": 1.38,
    "TYR OT2": 1.48,
    "TYR OXT": 1.48,
    "VAL C": 1.67,
    "VAL CA": 2.03,
    "VAL CB": 2.03,
    "VAL CG1": 1.94,
    "VAL CG2": 1.94,
    "VAL N": 1.63,
    "VAL O": 1.38,
    "VAL OT2": 1.48,
    "VAL OXT": 1.48,
  };

}());

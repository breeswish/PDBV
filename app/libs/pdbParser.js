function getChainFromStructure(chainName, structure) {
  var i;
  for (i = 0; i < structure.chains.length; ++i) {
    if (structure.chains[i].chain_id === chainName) {
      return structure.chains[i];
    }
  }
  return null;
}

// Very simple heuristic to determine the element from the atom name.
// This at the very least assume that people have the decency to follow
// the standard naming conventions for atom names when they are too
// lazy to write down elements
function guessAtomElementFromName(fourLetterName) {
  if (fourLetterName[0] !== ' ') {
    var trimmed = fourLetterName.trim();
    if (trimmed.length === 4) {
      // look for first character in range A-Z or a-z and use that
      // for the element.
      var i = 0;
      var charCode = trimmed.charCodeAt(i);
      while (i < 4 && (charCode < 65 || charCode > 122 ||
             (charCode > 90 && charCode < 97))) {
        ++i;
        charCode = trimmed.charCodeAt(i);
      }
      return trimmed[i];
    }
    // when first character is not empty and length is smaller than 4,
    // assume that it's either a heavy atom (CA, etc), or a hydrogen
    // name with a numeric prefix.  That's not always correct, though.
    var firstCharCode = trimmed.charCodeAt(0);
    if (firstCharCode >= 48 && firstCharCode <= 57) {
      // numeric prefix, so it's a hydrogen
      return trimmed[1];
    }
    return trimmed.substr(0, 2);
  }
  return fourLetterName[1];
}

function PDBReader(options) {
  this._helices = [];
  this._sheets = [];
  this._conect = [];
  this._serialToAtomMap = {};
  this._structure = {
    chains: []
  };
  this._currChain =  null;
  this._currRes = null;
  this._currAtom = null;
  this._options = {};
  this._options.conectRecords = !!options.conectRecords;
}

PDBReader.prototype = {

  // these are used as the return value of processLine()
  CONTINUE : 1,
  MODEL_COMPLETE : 2,
  FILE_END : 3,
  ERROR : 4,

  parseHelixRecord : function(line) {
    var frstNum = parseInt(line.substr(21, 4), 10);
    var frstInsCode = line[25] === ' ' ? '\0' : line[25];
    var lastNum = parseInt(line.substr(33, 4), 10);
    var lastInsCode = line[37] === ' ' ? '\0' : line[37];
    var chainName = line[19];
    this._helices.push({ first : [frstNum, frstInsCode],
            last : [lastNum, lastInsCode], chainName : chainName
    });
    return true;
  },

  parseSheetRecord : function(line) {
    var frstNum = parseInt(line.substr(22, 4), 10);
    var frstInsCode = line[26] === ' ' ? '\0' : line[26];
    var lastNum = parseInt(line.substr(33, 4), 10);
    var lastInsCode = line[37] === ' ' ? '\0' : line[37];
    var chainName = line[21];
    this._sheets.push({
      first : [frstNum, frstInsCode],
      last : [lastNum, lastInsCode],
      chainName : chainName
    });
    return true;
  },

  parseAndAddAtom : function(line) {
    var alt_loc = line[16];
    if (alt_loc !== ' ' && alt_loc !== 'A') {
      return true;
    }
    var isHetatm = line[0] === 'H';
    var chainName = line[21];
    var resName = line.substr(17, 3).trim();
    var fullAtomName = line.substr(12, 4);
    var atomName = fullAtomName.trim();
    var rnumNum = parseInt(line.substr(22, 4), 10);
    // check for NaN
    if (rnumNum !== rnumNum) {
      rnumNum = 1;
    }
    var insCode = line[26] === ' ' ? '\0' : line[26];
    var updateResidue = false;
    var updateChain = false;
    if (!this._currChain || this._currChain.chain_id !== chainName) {
      updateChain = true;
      updateResidue = true;
    }
    if (!this._currRes || this._currRes.res_seq !== rnumNum ||
        this._currRes.i_code !== insCode) {
      updateResidue = true;
    }
    if (updateChain) {
      // residues of one chain might appear interspersed with residues from
      // other chains.
      this._currChain = getChainFromStructure(chainName, this._structure);
      if (!this._currChain) {
        var chain = {
          chain_id: chainName,
          aminos: []
        };
        this._structure.chains.push(chain);
        this._currChain = chain;
      }
    }
    if (updateResidue) {
      var residue = {
        res_name: resName,
        res_seq: rnumNum,
        i_code: insCode,
        chain_id: this._currChain.chain_id,
        atoms: []
      };
      this._currChain.aminos.push(residue);
      this._currRes = residue;
    }
    var pos = {};
    pos.x = (parseFloat(line.substr(30 + 0 * 8, 8)));
    pos.y = (parseFloat(line.substr(30 + 1 * 8, 8)));
    pos.z = (parseFloat(line.substr(30 + 2 * 8, 8)));

    var element = line.substr(76,2).trim();
    if (element === '') {
      element = guessAtomElementFromName(fullAtomName);
    }
    var occupancy = parseFloat(line.substr(54,6).trim());
    var tempFactor = parseFloat(line.substr(60,6).trim());

    var atom = {
      name: atomName,
      x: pos.x,
      y: pos.y,
      z: pos.z,
      temp_factor: tempFactor,
      element: element
    };
    this._currRes.atoms.push(atom);
    // in case parseConect records is set to true, store away the atom serial
    if (this._options.conectRecords) {
      var serial = parseInt(line.substr(6,5).trim(), 10);
      this._serialToAtomMap[serial] = atom;
    }
    return true;
  },
  parseConectRecord : function(line) {
    var atomSerial = parseInt(line.substr(6,5).trim(), 10);
    var bondPartnerIds = [];
    for (var i = 0; i < 4; ++i) {
      var partnerId = parseInt(line.substr(11 + i * 5, 6).trim(), 10);
      if (isNaN(partnerId)) {
        continue;
      }
      // bonds are listed twice, so to avoid duplicate bonds, only keep bonds
      // with the lower serials as the first atom.
      if (partnerId > atomSerial) {
        continue;
      }
      bondPartnerIds.push(partnerId);
    }
    this._conect.push( { from : atomSerial, to : bondPartnerIds });
    return true;
  },

  processLine : function(line) {
    var recordName = line.substr(0, 6);
    if (recordName === 'ATOM  ' || recordName === 'HETATM') {
      return this.parseAndAddAtom(line) ? this.CONTINUE : this.ERROR;
    }
    if (recordName === 'REMARK') {
      return this.CONTINUE;
    }
    /*

      // for now we are only interested in the biological assembly information
      // contained in remark 350.
      var remarkNumber = line.substr(7, 3);
      if (remarkNumber === '350') {
        this._remark350Reader.nextLine(line);
      }
      return this.CONTINUE;
    }*/
    if (recordName === 'HELIX ') {
      return this.parseHelixRecord(line) ? this.CONTINUE : this.ERROR;
    }
    if (recordName === 'SHEET ') {
      return this.parseSheetRecord(line) ? this.CONTINUE : this.ERROR;
    }
    if (this._options.conectRecords && recordName === 'CONECT') {
      return this.parseConectRecord(line) ? this.CONTINUE : this.ERROR;
    }
    if (recordName === 'END   ') {
      return this.FILE_END;
    }
    if (recordName === 'ENDMDL') {
      return this.MODEL_COMPLETE;
    }
    return this.CONTINUE;
  },

  // called after parsing to perform any work that requires the complete
  // structure to be present:
  // (a) assigns the secondary structure information found in the helix
  // sheet records, (b) derives connectivity and (c) assigns assembly
  // information.
  finish : function() {
    // check if we have at least one atom, if not return null
    if (this._currChain === null) {
      return null;
    }
    var chain = null;
    var i;
    for (i = 0; i < this._sheets.length; ++i) {
      var sheet = this._sheets[i];

      chain = getChainFromStructure(sheet.chainName, this._structure);
      /*if (chain) {
        chain.assignSS(sheet.first, sheet.last, 'E');
      }*/
    }
    for (i = 0; i < this._helices.length; ++i) {
      var helix = this._helices[i];
      chain = getChainFromStructure(helix.chainName, this._structure);
      /*if (chain) {
        chain.assignSS(helix.first, helix.last, 'H');
      }*/
    }
    /*
    this._structure.setAssemblies(this._remark350Reader.assemblies());
    if (this._options.conectRecords) {
      this._assignBondsFromConectRecords(this._structure);
    }*/
    var result = this._structure;
    this._structure = {
      chains: []
    };
    this._currChain =  null;
    this._currRes = null;
    this._currAtom = null;
    return result;
  },
  /*
  _assignBondsFromConectRecords : function(structure) {
    for (var i = 0; i < this._conect.length; ++i) {
      var record = this._conect[i];
      var fromAtom = this._serialToAtomMap[record.from];
      for (var j = 0; j < record.to.length; ++j) {
        var toAtom = this._serialToAtomMap[record.to[j]];
        structure.connect(fromAtom, toAtom);
      }
    }
  },*/
};

function getLines(data) {
  return data.split(/\r\n|\r|\n/g);
}

// a truly minimalistic PDB parser. It will die as soon as the input is
// not well-formed. it only reads ATOM, HETATM, HELIX, SHEET and REMARK
// 350 records, everything else is ignored. in case of multi-model
// files, only the first model is read.
//
// FIXME: load PDB currently spends a substantial amount of time creating
// the vec3 instances for the atom positions. it's possible that it's
// cheaper to initialize a bulk buffer once and create buffer views to
// that data for each atom position. since the atom's lifetime is bound to
// the parent structure, the buffer could be managed on that level and
// released once the structure is deleted.
function pdb(text, options) {
  var opts = options || {};
  var lines = getLines(text);
  var reader = new PDBReader(opts);
  var structures = [];
  // depending on whether the loadAllModels flag is set process all models
  // in the PDB file
  for (var i = 0; i < lines.length; i++) {
    var result = reader.processLine(lines[i]);
    if (result === reader.ERROR) {
      return null;
    }
    if (result === reader.CONTINUE) {
      continue;
    }
    var struct = reader.finish();
    if (struct !== null) {
      structures.push(struct);
    }
    if (result === reader.MODEL_COMPLETE && opts.loadAllModels) {
      continue;
    }
    break;
  }
  var structure = reader.finish();
  if (structure !== null) {
    structures.push(structure);
  }
  if (opts.loadAllModels) {
    return structures;
  }
  return structures[0];
}


module.exports =  {
  parse : pdb,
  guessAtomElementFromName : guessAtomElementFromName
};

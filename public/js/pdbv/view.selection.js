/*global THREE */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

(function () {

  if (PDBV.ViewSelection !== undefined) {
    return;
  }

  PDBV.ViewSelection = function (view) {
    this.view = view;
    this.lastClickTimestamp = null;
    this.lastHotTrackAmino = null;
  };

  PDBV.ViewSelection.prototype.attachListeners = function () {
    this.view.container.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.view.container.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    this.view.container.addEventListener('mousemove', this.onMouseMoveHotTrack.bind(this), false);
    this.onMouseMove = this.onMouseMove.bind(this);
  };

  PDBV.ViewSelection.prototype.onMouseDown = function () {
    this._moved = false;
    this.view.container.addEventListener('mousemove', this.onMouseMove, false);
  };

  PDBV.ViewSelection.prototype.onMouseMove = function () {
    this._moved = true;
  };

  PDBV.ViewSelection.prototype.onMouseUp = function (ev) {
    this.view.container.removeEventListener('mousemove', this.onMouseMove, false);
    if (this._moved) {
      return;
    }
    var isRightClick = false;
    if (ev.which === 3 || ev.button === 2) {
      isRightClick = true;
    }
    this.view.forCurrentModel(function (model) {
      var mouse = new THREE.Vector2();
      mouse.x = (ev.clientX / this.width) * 2 - 1;
      mouse.y = -(ev.clientY / this.height) * 2 + 1;
      model.onCanvasClick(mouse, isRightClick);
    });
  };

  PDBV.ViewSelection.prototype.onMouseMoveHotTrack = function (ev) {
    if (ev.which !== 0) {
      return;
    }
    this.view.forCurrentModel(function (model) {
      var mouse = new THREE.Vector2();
      mouse.x = (ev.clientX / this.width) * 2 - 1;
      mouse.y = -(ev.clientY / this.height) * 2 + 1;
      model.onCanvasMouseMove(mouse);
    });
  };

  PDBV.ViewSelection.prototype.onAtomSelected = function (atom) {
    this.selectResidueOrChain(atom.residue, !this.view._selected[atom.uuid]);
  };

  PDBV.ViewSelection.prototype.selectAtom = function (atom, isSelect) {
    var view = this.view;
    if (isSelect && view._selected[atom.uuid]) {
      return;
    }
    if (!isSelect && !view._selected[atom.uuid]) {
      return;
    }
    var selectionChangeEvent = {
      select: [],
      unselect: []
    };
    var uuid = atom.uuid;
    if (isSelect) {
      view.molMetaData[uuid].selected = true;
      view._selected[uuid] = true;
      selectionChangeEvent.select.push(uuid);
    } else {
      view.molMetaData[uuid].selected = false;
      delete view._selected[uuid];
      selectionChangeEvent.unselect.push(uuid);
    }
    view.emitEvent('selectionChanged', [selectionChangeEvent, 'view']);
  };

  PDBV.ViewSelection.prototype.selectResidueOrChain = function (residueOrChain, isSelect) {
    var view = this.view;
    var selectionChangeEvent = {
      select: [],
      unselect: []
    };
    if (isSelect) {
      residueOrChain.forEachAtom(function (atom) {
        var uuid = atom.uuid;
        if (!view._selected[uuid]) {
          view.molMetaData[uuid].selected = true;
          view._selected[uuid] = true;
          selectionChangeEvent.select.push(uuid);
        }
      });
    } else {
      residueOrChain.forEachAtom(function (atom) {
        var uuid = atom.uuid;
        if (view._selected[uuid]) {
          view.molMetaData[uuid].selected = false;
          delete view._selected[uuid];
          selectionChangeEvent.unselect.push(uuid);
        }
      });
    }
    if (selectionChangeEvent.select.length > 0 || selectionChangeEvent.unselect.length > 0) {
      view.emitEvent('selectionChanged', [selectionChangeEvent, 'view']);
    }
  };

  PDBV.ViewSelection.prototype.setHotTrackResidue = function (residue) {
    if (residue === this.lastHotTrackAmino) {
      return;
    }
    this.lastHotTrackAmino = residue;
    var hotTrackChangeEvent = {
      atoms: []
    };
    if (residue !== null) {
      residue.forEachAtom(function (atom) {
        hotTrackChangeEvent.atoms.push(atom.uuid);
      });
    }
    this.view.emitEvent('hotTrackChanged', [hotTrackChangeEvent, 'view']);
  };

  PDBV.ViewSelection.prototype.onAtomContextMenu = function (atom) {
    var view = this.view;
    view.emitEvent('atomContextMenu', [atom, 'view']);
  };

  PDBV.ViewSelection.prototype.onAtomClicked = function (atom, isRightClick) {
    if (isRightClick) {
      this.onAtomContextMenu(atom);
    } else {
      this.onAtomSelected(atom);
      if (this.lastClickTimestamp !== null) {
        if (Date.now() - this.lastClickTimestamp < 400) {
          this.onAtomDoubleClicked(atom);
          this.lastClickTimestamp = null;
        } else {
          this.lastClickTimestamp = Date.now();
        }
      } else {
        this.lastClickTimestamp = Date.now();
      }
    }
  };

  PDBV.ViewSelection.prototype.onAtomHoverIn = function (atom) {
    this.setHotTrackResidue(atom.residue);
  };

  PDBV.ViewSelection.prototype.onAtomHoverOut = function () {
    this.setHotTrackResidue(null);
  };

  PDBV.ViewSelection.prototype.onAtomDoubleClicked = function (atom) {
    this.view.emitEvent('atomDoubleClicked', [atom, 'view']);
  };

}());

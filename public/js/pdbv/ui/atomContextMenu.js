/*global THREE, Float32Array, EventEmitter */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.ui === undefined) {
  PDBV.ui = {};
}

(function () {

  if (PDBV.ui.atomContextMenu !== undefined) {
    return;
  }

  var cm = {};
  var view;

  PDBV.ui.atomContextMenu = cm;

  var lastAtom = null, lastPosition = null;

  var onAtomContextMenu = function (atom) {
    lastAtom = atom;
    $('.cm').css({
      left: lastPosition.x,
      top: lastPosition.y,
      display: 'block'
    });
  };

  var onCanvasMouseDown = function (ev) {
    $('.cm').hide();
    lastAtom = null;
    lastPosition = {x: ev.clientX, y: ev.clientY};
  };

  var onCMClick = function () {
    $('.cm').hide();
    var role = this.getAttribute('role').split('-');
    if (role[1] === 'center') {
      if (role[0] === 'atom') {
        view.viewCenter.centerAtom(lastAtom);
      } else if (role[0] === 'residue') {
        view.viewCenter.centerResidueOrChain(lastAtom.residue);
      } else if (role[0] === 'chain') {
        view.viewCenter.centerResidueOrChain(lastAtom.residue.chain);
      }
      return;
    }
    if (role[1] === 'select' || role[1] === 'unselect') {
      if (role[0] === 'atom') {
        view.viewSelection.selectAtom(lastAtom, role[1] === 'select');
      } else if (role[0] === 'residue') {
        view.viewSelection.selectResidueOrChain(lastAtom.residue, role[1] === 'select');
      } else if (role[0] === 'chain') {
        view.viewSelection.selectResidueOrChain(lastAtom.residue.chain, role[1] === 'select');
      }
      return;
    }
  };

  cm.attachView = function (_view) {
    view = _view;
    // 右键
    view.addListener('atomContextMenu', onAtomContextMenu);
    view.container.addEventListener('mousedown', onCanvasMouseDown);
    $('.cm-item-role').click(onCMClick);
  };

}());

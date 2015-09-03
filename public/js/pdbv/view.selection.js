/*global THREE, Stats, window, EventEmitter */

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
  };

  PDBV.ViewSelection.prototype.attachListeners = function () {
    document.body.addEventListener('keydown', this.onKeyDown.bind(this), false);
    document.body.addEventListener('keyup', this.onKeyUp.bind(this), false);
    this.view.container.addEventListener('click', this.onClick.bind(this), false);
    this.view.container.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.view.container.addEventListener('mousemove', this.onMouseMove.bind(this), false);
  };

  PDBV.ViewSelection.prototype.onMouseDown = function (ev) {
    this._updateModifierKeys(ev);
    this._moved = false;
  };

  PDBV.ViewSelection.prototype.onMouseMove = function () {
    this._moved = true;
  };

  PDBV.ViewSelection.prototype.onKeyDown = function (ev) {
    this._updateModifierKeys(ev);
  };

  PDBV.ViewSelection.prototype.onKeyUp = function (ev) {
    this._updateModifierKeys(ev);
  };

  PDBV.ViewSelection.prototype._updateModifierKeys = function (ev) {
    this.modifierKeys.control = ev.ctrlKey;
    this.modifierKeys.shift = ev.shiftKey;
    this.modifierKeys.alt = ev.altKey;
    this.modifierKeys.meta = ev.metaKey;
  };

  PDBV.ViewSelection.prototype.onClick = function (ev) {
    this._updateModifierKeys(ev);
    if (this._moved) {
      return;
    }
    this.view.forCurrentModel(function (model) {
      var mouse = new THREE.Vector2();
      mouse.x = (ev.clientX / this.width) * 2 - 1;
      mouse.y = -(ev.clientY / this.height) * 2 + 1;
      model.onCanvasClick(mouse);
    });
  };

  PDBV.ViewSelection.prototype.onAtomClicked = function (atom) {
    var uuid;
    var selectionChangeEvent = {
      unselect: [],
      select: []
    };
    if (this.modifierKeys.control === false && this.modifierKeys.shift === false && this.modifierKeys.meta === false) {
      // 没有按下这三个键，则清除之前的选择
      for (uuid in this.view._selected) {
        selectionChangeEvent.unselect.push(uuid);
        this.view.molMetaData[uuid].selected = false;
      }
      this.view._selected = {};
    }
    selectionChangeEvent.select.push(atom.uuid);
    this.view.molMetaData[atom.uuid].selected = true;
    this.view._selected[atom.uuid] = true;
    this.view.forCurrentModel(function (model) {
      model.onSelectionChange(selectionChangeEvent);
      this.view.render();
    });
  };

}());

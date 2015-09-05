/*global THREE, Float32Array, EventEmitter */

var PDBV;

if (PDBV === undefined) {
  PDBV = {};
}

if (PDBV.ui === undefined) {
  PDBV.ui = {};
}

(function () {

  if (PDBV.ui.selectionArea !== undefined) {
    return;
  }

  var FONT = '8px verdana';
  var LABEL_WIDTH = 45;
  var CELL_SIZE = 10;
  var CELL_GAP = 1;

  var COLOR_NONE = '#555';
  var COLOR_SELECT = '#DF007B';

  var sa = {};
  var view;

  PDBV.ui.selectionArea = sa;

  var selectionChangedBySelf = false;

  var columns = 0, rows = 0, residues = 0, cells = null;
  var _lastCell = null;
  var lastSelectIndex = -1, lastMaxSelect = -1;

  var canvas, width, height, ctx;

  function renderCells(begin, end) {
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    // 是否画一个区域？
    if (begin === undefined) {
      begin = 0;
    }
    if (end === undefined) {
      end = cells.length - 1;
    }

    var i, cell, residue, t;
    for (i = begin; i <= end; ++i) {
      cell = cells[i];
      residue = view.mol.chains[cell.chainIndex].residues[cell.residueIndex];

      if (cell.hover) {
        // 鼠标移入时，优先渲染
        if (cell.toBe) {
          ctx.fillStyle = COLOR_SELECT;
        } else {
          ctx.fillStyle = COLOR_NONE;
        }
        ctx.fillRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
      } else {
        if (!cell.partialSelect) {
          // 没有部分选中时
          if (cell.select) {
            ctx.fillStyle = COLOR_SELECT;
          } else {
            ctx.fillStyle = COLOR_NONE;
          }
          ctx.fillRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
        } else {
          // 选中了一部分时，先渲染背景，再渲染前景
          ctx.fillStyle = COLOR_NONE;
          ctx.fillRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
          ctx.fillStyle = COLOR_SELECT;
          for (t = 0; t < cell.atomStatus.length; ++t) {
            if (cell.atomStatus[t]) {
              ctx.fillRect(cell.x + Math.floor(t / cell.atomStatus.length * CELL_SIZE), cell.y, Math.floor(1 / cell.atomStatus.length * CELL_SIZE), CELL_SIZE);
            }
          }
        }
      }

      // render cell text
      ctx.fillStyle = '#FFF';
      ctx.fillText(PDBV.constant.aminoAbbr[residue.name], cell.x + CELL_SIZE / 2, cell.y + CELL_SIZE / 2);
    }
  }

  function syncSelectionToView() {
    var selectionChangeEvent = {
      select: [],
      unselect: []
    };
    cells.forEach(function (cell) {
      var residue = view.mol.chains[cell.chainIndex].residues[cell.residueIndex];
      residue.forEachAtom(function (atom, i) {
        var isSelect; // null 为不变
        if (!cell.partialSelect) {
          isSelect = cell.select;
        } else {
          isSelect = cell.atomStatus[i];
        }
        if (view._selected[atom.uuid] && !isSelect) {
          selectionChangeEvent.unselect.push(atom.uuid);
          view.molMetaData[atom.uuid].selected = false;
          delete view._selected[atom.uuid];
        } else if (!view._selected[atom.uuid] && isSelect) {
          selectionChangeEvent.select.push(atom.uuid);
          view.molMetaData[atom.uuid].selected = true;
          view._selected[atom.uuid] = true;
        }
      });
    });
    if (selectionChangeEvent.select.length > 0 || selectionChangeEvent.unselect.length > 0) {
      selectionChangedBySelf = true;
      view.emitEvent('selectionChanged', [selectionChangeEvent, 'view']);
      selectionChangedBySelf = false;
    }
  }

  function syncViewToSelection() {
    cells.forEach(function (cell) {
      var residue = view.mol.chains[cell.chainIndex].residues[cell.residueIndex];
      // 判断是否有一部分选中
      var selectedCount = 0;
      residue.forEachAtom(function (atom, i) {
        if (view._selected[atom.uuid]) {
          selectedCount++;
          cell.atomStatus[i] = true;
        } else {
          cell.atomStatus[i] = false;
        }
      });
      cell.select = (selectedCount === residue.atoms.length);
      cell.partialSelect = (selectedCount > 0 && selectedCount < residue.atoms.length);
    });
    renderCells();
  }

  function getCellFromRowCol(row, col) {
    if (cells === null) {
      return null;
    }
    var index = row * columns + col;
    var cell = cells[index];
    if (cell === undefined) {
      return null;
    }
    return cell;
  }

  function getCellFromXY(x, y) {
    if (x < LABEL_WIDTH) {
      return null;
    }
    var row = Math.floor(y / (CELL_SIZE + CELL_GAP));
    var col = Math.floor((x - LABEL_WIDTH) / (CELL_SIZE + CELL_GAP));
    return getCellFromRowCol(row, col);
  }

  function onCellHoverIn(cell) {
    var toBe;
    var i;
    if (lastSelectIndex === -1) {
      cell.hover = true;
      cell.toBe = !cell.select;
      renderCells(cell.index, cell.index);
    } else {
      toBe = !cells[lastSelectIndex].select;
      for (i = 0; i < residues; ++i) {
        cells[i].hover = false;
      }
      if (cell.index >= lastSelectIndex) {
        for (i = lastSelectIndex; i <= cell.index; ++i) {
          cells[i].hover = true;
          cells[i].toBe = toBe;
        }
      } else {
        for (i = lastSelectIndex; i >= cell.index; --i) {
          cells[i].hover = true;
          cells[i].toBe = toBe;
        }
      }
      renderCells();
    }
    lastMaxSelect = Math.min(lastMaxSelect, cell.index);
  }

  function onCellHoverOut(cell) {
    cell.hover = false;
    renderCells(cell.index, cell.index);
  }

  function onMouseMove(ev) {
    var cell = getCellFromXY(ev.offsetX, ev.offsetY);
    if (cell !== _lastCell) {
      if (_lastCell !== null && cell !== undefined) {
        onCellHoverOut(_lastCell);
      }
      if (cell !== null && cell !== undefined) {
        onCellHoverIn(cell);
      }
      _lastCell = cell;
    }
  }

  function onMouseUp(ev) {
    var cell = getCellFromXY(ev.offsetX, ev.offsetY);
    var i;
    if (cell === null) {
      return;
    }
    if (lastSelectIndex === -1) {
      lastSelectIndex = cell.index;
    } else {
      for (i = 0; i < residues; ++i) {
        cells[i].hover = false;
      }
      if (cell.index >= lastSelectIndex) {
        for (i = lastSelectIndex; i <= cell.index; ++i) {
          cells[i].select = cells[i].toBe;
        }
      } else {
        for (i = lastSelectIndex; i >= cell.index; --i) {
          cells[i].select = cells[i].toBe;
        }
      }
      for (i = lastSelectIndex; i <= cell.index; ++i) {
        cells[i].select = cells[i].toBe;
      }
      syncSelectionToView();
      lastSelectIndex = -1;
    }
  }

  function createCanvas() {
    canvas = $('#selectionArea').get(0);
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mouseup', onMouseUp, false);

    ctx = canvas.getContext('2d');
  }

  function renderClear() {
    ctx.clearRect(0, 0, width, height);
    ctx.font = FONT;
  }

  function renderLabels() {
    ctx.fillStyle = '#FFF';
    ctx.textBaseline = 'middle';
    cells.forEach(function (cell) {
      if (cell.col === 0) {
        var chain = view.mol.chains[cell.chainIndex];
        var residue = chain.residues[cell.residueIndex];
        ctx.fillText(chain.name + '/' + residue.num, 0, cell.y + CELL_SIZE / 2, LABEL_WIDTH);
      }
    });
  }

  function reload() {
    width = $(canvas).width();
    residues = 0;
    view.mol.chains.forEach(function (chain) {
      residues += chain.residues.length;
    });

    columns = Math.min(residues, Math.floor((width - LABEL_WIDTH) / (CELL_SIZE + CELL_GAP)));
    rows = Math.ceil(residues / columns);

    height = rows * (CELL_SIZE + CELL_GAP);
    canvas.width = width;
    canvas.height = height;

    cells = [];
    var index = 0, row = 0, col = 0;
    view.mol.chains.forEach(function (chain, i) {
      chain.residues.forEach(function (residue, j) {
        var atomStatus = [];
        residue.atoms.forEach(function () {
          atomStatus.push(false);
        });
        cells.push({
          select: false,          // 当前是否已全部选中
          partialSelect: false,  // 是否选中了一部分原子
          atomStatus: atomStatus, // 各个原子状态（仅适用于部分选中）
          visible: true,          // 当前是否可见
          index: index,           // 是第几个氨基酸
          chainIndex: i,          // 在第几个链上
          residueIndex: j,        // 氨基酸在这个链上是第几个
          hover: false,           // 当前是否鼠标移入
          toBe: false,            // 如果鼠标移入，点击后它是否切换为选中状态
          row: row,               // 在第几行
          col: col,               // 在第几列
          x: LABEL_WIDTH + col * (CELL_SIZE + CELL_GAP),
          y: row * (CELL_SIZE + CELL_GAP),
        });
        col++;
        if (col === columns) {
          col = 0;
          row++;
        }
        index++;
      });
    });

    renderClear();
    renderLabels();
    renderCells();
  }

  sa.attachView = function (_view) {
    view = _view;
    createCanvas();
    view.addListener('pdbChanged', function () {
      reload();
    });
    view.addListener('selectionChanged', function () {
      if (!selectionChangedBySelf) {
        syncViewToSelection();
      }
    });
  };

}());

/*global PDBV, io, libRoom, libStructure, window */

$(document).ready(function () {

  // create view
  window.view = new PDBV.View($('#stage')[0]);
  window.view.start();

  PDBV.ui.atomContextMenu.attachView(window.view);
  PDBV.ui.selectionArea.attachView(window.view);

  // connect socket
  window._pdbv_socket = io.connect();
  window._pdbv_initialized = false;
  var inStatusUpdateProgress = false;
  var inDOMUpdateProgress = {
    model: false,
    coloring: false
  };

  window._pdbv_socket.on('event/userListUpdated', function (data) {
    libRoom.updateUserList(data.users);
    libRoom.updateRoomList(false);
  });
/*
  window._pdbv_socket.on('initialize', function (data) {
    window._pdbv_socket.uuid = data.uuid;
    if (data.status.loaded) {
      inStatusUpdateProgress = true;
    }
    var mol = PDBV.loader.load(data.status.pdb);
    view.load(mol, data.status);
    window._pdbv_initialized = true;
    inStatusUpdateProgress = false;
  });
*/
  // 收到服务端的状态更新通知
  window._pdbv_socket.on('event/statusUpdated', function (data) {
    if (!window._pdbv_initialized) {
      return;
    }
    inStatusUpdateProgress = true;
    if (data.scope === 'view') {
      window.view.onServerStatusUpdated(data.key, data.value);
    } else if (data.scope === 'controller') {
      console.log(data);
    }
    inStatusUpdateProgress = false;
  });

  /**
   * 给服务端发送消息通知其他客户端更新相关状态
   */
  var broadcastUpdateStatus = function (ev) {
    if (!window._pdbv_initialized) {
      return;
    }
    window._pdbv_socket.emit('action/updateStatus', ev);
  };

  // 监听各个事件
  var syncEvents = ['pdbChanged', 'controlsChanged', 'modelChanged', 'coloringChanged'];
  syncEvents.forEach(function (eventName) {
    // 每个事件 20ms 内只会触发一次 updateStatus
    var func = _.throttle(function (ev) {
      broadcastUpdateStatus(ev);
    }, 50);
    window.view.addListener(eventName, function (data, scope) {
      if (inStatusUpdateProgress === true) {
        return;
      }
      func({
        key: eventName,
        scope: scope,
        value: data
      });
    });
  });

  window.view.addListener('modelChanged', function (data) {
    inDOMUpdateProgress.model = true;
    $('#select_style').val(data);
    inDOMUpdateProgress.model = false;
  });

  window.view.addListener('coloringChanged', function (data) {
    inDOMUpdateProgress.coloring = true;
    $('#select_coloring').val(data);
    inDOMUpdateProgress.coloring = false;
  });

  // init
  function setup() {
    libRoom.updateRoomList();

    // Room
    $('.role-room-refresh').click(function () {
      libRoom.updateRoomList();
    });

    $('.role-room-create').click(function () {
      libRoom.createRoom();
    });

    $('.role-room-join').click(function () {
      var id = $('#select_rooms').val();
      if (id === 'none') {
        libRoom.leaveRoom();
      } else {
        libRoom.joinRoom(id);
        libStructure.updateStructureList();
      }
    });

    // Structure
    $('.role-structure-refresh').click(function () {
      libStructure.updateStructureList();
    });

    $('.role-structure-apply').click(function () {
      var file = $('#select_structure').val();
      if (file === 'none') {
        libStructure.clear();
      } else {
        libStructure.applyStructure(file, {});
      }
    });

    // 切换模型
    $('#select_style').change(function () {
      if (inDOMUpdateProgress.model) {
        return;
      }
      var model = this.value;
      window.view.useModel(model);
      window.view.render();
    });

    // 切换着色
    $('#select_coloring').change(function () {
      if (inDOMUpdateProgress.coloring) {
        return;
      }
      var coloring = this.value;
      window.view.useColoring(coloring);
      window.view.render();
    });

  }

  setup();

});

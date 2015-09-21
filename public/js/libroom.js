/*global ohSnap, window */

var libRoom = {};

(function () {

  libRoom.currentRoom = 'none';
  libRoom.currentUserCount = 0;

  libRoom.showStatus = function (text) {
    if ($('.status').length === 0) {
      $('<div class="status"><div class="status-text"></div></div>').appendTo('body');
    }
    $('.status-text').text(text);
  };

  libRoom.hideStatus = function () {
    $('.status').remove();
  };

  libRoom.processRoomId = function (uuid) {
    var p = uuid.split('-');
    return p[0];
  };

  libRoom.updateRoomList = function (notify) {
    if (notify === undefined) {
      notify = true;
    }
    $.ajax('/rooms/list').done(function (data) {
      var select = $('#select_rooms').empty();
      select.append('<option value="none">-- Select --</option>');
      data.rooms.forEach(function (room) {
        var $option = $('<option></option>');
        $option.val(room.id);
        $option.text(libRoom.processRoomId(room.id) + ' (' + room.users.length + ')');
        $option.appendTo(select);
      });
      if (notify) {
        ohSnap('Room list updated.', 'blue');
      }
      select.val(libRoom.currentRoom);
    });
  };

  libRoom.createRoom = function () {
    $.ajax('/rooms/create').done(function (data) {
      ohSnap('New room created: ' + libRoom.processRoomId(data.id), 'blue');
      libRoom.updateRoomList(false);
    });
  };

  libRoom.joinRoom = function (id) {
    window._pdbv_socket.emit('action/joinRoom', id, function (response) {
      if (!response.ok) {
        ohSnap('Join room failed.', 'red');
        return;
      }
      libRoom.currentRoom = response.meta.id;
      libRoom.updateRoomStatus();
      ohSnap('Room joined.', 'green');
    });
  };

  libRoom.leaveRoom = function () {
    window._pdbv_socket.emit('action/leaveRoom');
    libRoom.currentRoom = 'none';
    libRoom.updateRoomStatus();
    ohSnap('Room left.', 'green');
  };

  libRoom.updateUserList = function (users) {
    libRoom.currentUserCount = users.length;
    libRoom.updateRoomStatus();
  };

  libRoom.updateRoomStatus = function () {
    if (libRoom.currentRoom === 'none') {
      $('.role-current-room').text('--');
      $('.control-group--style').hide();
      $('.control-group--coloring').hide();
      $('.control-group--selection').hide();
    } else {
      $('.role-current-room').text(libRoom.processRoomId(libRoom.currentRoom) + ' - ' + libRoom.currentUserCount + ' online');
      $('.control-group--style').show();
      $('.control-group--coloring').show();
      $('.control-group--selection').show();
    }
  };

}());

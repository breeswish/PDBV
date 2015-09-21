var uuid = require('node-uuid');

var libRoom = {};
var rooms = {};

libRoom.create = function () {
  var id = uuid.v4();
  rooms[id] = {
    meta: {
      id: id,
      users: [],
      createAt: Date.now(),
    },
    data: {}
  };
  return id;
};

libRoom.listAll = function () {
  var id, ret = [];
  for (id in rooms) {
    ret.push(rooms[id].meta);
  }
  return ret;
};

libRoom.getUsers = function (roomId) {
  if (rooms[roomId] === undefined) {
    return null;
  }
  return rooms[roomId].meta.users;
};

libRoom.join = function (socketId, roomId) {
  var room = rooms[roomId];
  if (room.meta.users.indexOf(socketId) !== -1) {
    return false;
  }
  room.meta.users.push(socketId);
  return true;
};

libRoom.leave = function (socketId, roomId) {
  var room = rooms[roomId];
  if (room === undefined) {
    return false;
  }
  var index = room.meta.users.indexOf(socketId);
  if (index === -1) {
    return false;
  }
  room.meta.users.splice(index, 1);
  return true;
};

libRoom.onSocketConnect = function (socket) {
  var userId = socket.request.session.passport.user;
  if (!userId) {
    return;
  }
  socket._userId = userId;
  socket._roomId = null;
  socket._id = uuid.v4() + '/' + userId;
  socket.on('disconnect', libRoom.onSocketDisconnect);
  socket.on('action/joinRoom', libRoom.onSocketJoinRoom);
  socket.on('action/leaveRoom', libRoom.onSocketLeaveRoom);
  socket.on('action/updateStatus', libRoom.onSocketUpdateStatus);
};

libRoom.onSocketDisconnect = function () {
  libRoom.onSocketLeaveRoom.call(this);
};

libRoom.onSocketLeaveRoom = function () {
  var socket = this;
  if (socket._roomId) {
    socket.leave(socket._roomId);
    libRoom.leave(socket._id, socket._roomId);
    socket.server.to(socket._roomId).emit('event/userListUpdated', rooms[socket._roomId].meta);
    socket._roomId = null;
  }
};

libRoom.onSocketJoinRoom = function (roomId, fn) {
  var socket = this;
  if (rooms[roomId] === undefined) {
    fn({ok: false});
    return;
  }
  if (socket._roomId === roomId) {
    fn({ok: false});
    return;
  }
  if (socket._roomId) {
    libRoom.onSocketLeaveRoom.call(this);
  }
  socket._roomId = roomId;
  socket.join(roomId);
  var joinStatus = libRoom.join(socket._id, roomId);
  fn({
    ok: joinStatus,
    meta: rooms[roomId].meta
  });
  socket.server.to(roomId).emit('event/userListUpdated', rooms[roomId].meta);
};

libRoom.onSocketUpdateStatus = function (data) {
  var socket = this;
  if (socket._roomId === null) {
    return;
  }
  if (rooms[socket._roomId] === undefined) {
    return;
  }
  rooms[socket._roomId].data[data.key] = data.value;
  socket.broadcast.emit('event/statusUpdated', data);
};

module.exports = libRoom;

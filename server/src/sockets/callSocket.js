const { getOnlineUsers } = require('./chatSocket');

const activeCalls = new Map();

function callSocket(io) {
  io.on('connection', (socket) => {
    if (!socket.user) return;

    const userId = socket.user.id;

    socket.on('call-user', (data) => {
      const { receiverId, callerInfo } = data;
      const onlineUsers = getOnlineUsers();
      const receiver = onlineUsers.get(receiverId);

      if (!receiver) {
        socket.emit('call-user-error', { message: 'User is offline' });
        return;
      }

      const existingCall = activeCalls.get(userId) || activeCalls.get(receiverId);
      if (existingCall) {
        socket.emit('call-user-error', { message: 'User is busy' });
        return;
      }

      const callId = `call_${Date.now()}_${userId}`;
      activeCalls.set(callId, {
        callerId: userId,
        receiverId,
        callerSocketId: socket.id,
        receiverSocketId: receiver.socketId,
      });

      socket.callId = callId;

      io.to(receiver.socketId).emit('incoming-call', {
        callId,
        callerId: userId,
        callerInfo: callerInfo || socket.user,
      });

      socket.emit('call-initiated', { callId });
    });

    socket.on('accept-call', (data) => {
      const { callId } = data;
      const call = activeCalls.get(callId);
      if (!call) return;

      call.status = 'accepted';

      io.to(call.callerSocketId).emit('call-accepted', { callId });
      io.to(call.receiverSocketId).emit('call-accepted', { callId });
    });

    socket.on('reject-call', (data) => {
      const { callId } = data;
      const call = activeCalls.get(callId);
      if (!call) return;

      io.to(call.callerSocketId).emit('call-rejected', { callId });
      activeCalls.delete(callId);
    });

    socket.on('offer', (data) => {
      const { callId, offer } = data;
      const call = activeCalls.get(callId);
      if (!call) return;

      const targetSocketId =
        call.callerSocketId === socket.id
          ? call.receiverSocketId
          : call.callerSocketId;

      io.to(targetSocketId).emit('offer', { callId, offer });
    });

    socket.on('answer', (data) => {
      const { callId, answer } = data;
      const call = activeCalls.get(callId);
      if (!call) return;

      const targetSocketId =
        call.callerSocketId === socket.id
          ? call.receiverSocketId
          : call.callerSocketId;

      io.to(targetSocketId).emit('answer', { callId, answer });
    });

    socket.on('ice-candidate', (data) => {
      const { callId, candidate } = data;
      const call = activeCalls.get(callId);
      if (!call) return;

      const targetSocketId =
        call.callerSocketId === socket.id
          ? call.receiverSocketId
          : call.callerSocketId;

      io.to(targetSocketId).emit('ice-candidate', { callId, candidate });
    });

    socket.on('end-call', (data) => {
      const { callId } = data;
      const call = activeCalls.get(callId);
      if (!call) return;

      const targetSocketId =
        call.callerSocketId === socket.id
          ? call.receiverSocketId
          : call.callerSocketId;

      io.to(targetSocketId).emit('call-ended', { callId });
      activeCalls.delete(callId);
    });

    socket.on('disconnect', () => {
      for (const [callId, call] of activeCalls.entries()) {
        if (call.callerSocketId === socket.id || call.receiverSocketId === socket.id) {
          const targetSocketId =
            call.callerSocketId === socket.id
              ? call.receiverSocketId
              : call.callerSocketId;

          io.to(targetSocketId).emit('call-ended', { callId });
          activeCalls.delete(callId);
        }
      }
    });
  });
}

module.exports = { callSocket };

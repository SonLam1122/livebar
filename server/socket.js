const { Server } = require('socket.io');
const { getMatchState } = require('./matchState');
const { getScreenById } = require('./screens');

function setupSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    path: '/socket.io/'
  });

  const overlayIo = io.of('/overlay');

  overlayIo.on('connection', (socket) => {
    const handleJoin = (tokenParam) => {
      const token = tokenParam || socket.handshake.query?.token;
      if (!token) return;

      const targetScreen = getScreenById(token);
      if (!targetScreen) {
        socket.emit('overlay:error', { code: 'INVALID_TOKEN', message: 'Link overlay không hợp lệ' });
        return;
      }

      socket.join(targetScreen.id);
      if (targetScreen.token) socket.join(targetScreen.token);

      const mState = getMatchState(targetScreen.id);

      // 1. Emit overlay:init containing screen config and initial match state
      socket.emit('overlay:init', {
        screenId: targetScreen.id,
        config: targetScreen.config,
        match: mState,
        connection: { state: 'connected' }
      });

      // 2. Emit match:state
      socket.emit('match:state', mState);
    };

    // Listen for client overlay:join event
    socket.on('overlay:join', (data) => {
      handleJoin(data?.token);
    });

    // Auto join if query token was passed during handshake
    if (socket.handshake.query?.token) {
      handleJoin(socket.handshake.query.token);
    }

    // Heartbeat ping-pong
    socket.on('pong', () => {});
    socket.on('overlay:ping', () => socket.emit('overlay:pong'));

    socket.on('disconnect', () => {});
  });

  return { io, overlayIo };
}

module.exports = {
  setupSocketIO
};

var socket = io();

socket.on('connect', function () {
  console.log('Server connected for io');
});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

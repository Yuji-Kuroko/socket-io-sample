require

var io = require('socket.io')(3000);
var password = "hogehoge";

// 認証したら追加する
var parent_sockets = [];
var child_sockets = [];

// parent
io.of('/game/parent').on('connection', function(socket) {


  socket.on('password', function(input){
    // 認証
    //console.log('parent pass: '+input)
    if (input === password) {
      parent_sockets.push(socket);
      console.log('parent pass success!');
      socket.emit('password', true);
      return;
    }
    console.log('parent pass failed!');
    socket.emit('password', false);
  });

  socket.on('server', function(message) {
    if (parent_sockets.indexOf(socket) == -1) {
      return;
    }

  });
  socket.on('children', function(message) {
    if (parent_sockets.indexOf(socket) == -1) {
      return;
    }
    // bloadcast to children
    send_children('children', message);
  });
  socket.on('bloadcast', function(message) {
    if (parent_sockets.indexOf(socket) == -1) {
      return;
    }
    send_bloadcast('bloadcast', message);
  });


  socket.on('disconnect', function() {
    var index = parent_sockets.indexOf(socket);
    if (index != -1) {
      parent_sockets.splice(index, 1);
    }
  });
});



// child
io.of('/game/child').on('connection', function(socket) {
  socket.on('password', function(input){
    // 認証
    if (input === password) {
      child_sockets.push(socket);
      console.log('child pass success!');
      socket.emit('password', true);
      return;
    }
    console.log('child pass failed!');
    socket.emit('password', false);
  });

  socket.on('server', function(message) {
    if (child_sockets.indexOf(socket) == -1) {
      return;
    }

  });
  socket.on('parent', function(message) {
    if (child_sockets.indexOf(socket) == -1) {
      return;
    }
    send_parents('parent', message);
  });
  socket.on('children', function(message) {
    if (child_sockets.indexOf(socket) == -1) {
      return;
    }
    send_children('children', message);
  });
  socket.on('bloadcast', function(message) {
    if (child_sockets.indexOf(socket) == -1) {
      return;
    }
    send_bloadcast('bloadcast', message);
  });



  socket.on('disconnect', function() {
    var index = child_sockets.indexOf(socket);
    if (index != -1) {
      child_sockets.splice(index, 1);
    }
  });
});

function send_bloadcast(emit, message) {
  send_parents(emit, message);
  send_children(emit, message);
}

function send_parents(emit, message) {
  // bloadcast to parents
  for (var i in parent_sockets) {
    parent_sockets[i].emit(emit, message);
  }
}

function send_children(emit, message) {
  // bloadcast to children
  for (var i in child_sockets) {
    child_sockets[i].emit(emit, message);
  }
}

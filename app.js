//开启一个服务
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
server.listen(3000, function () {
  console.log('Server listening at http://localhost:3000');
});

// Routing
app.use(express.static(__dirname + '/src'));

//设置房间用户数量members
var members = 0;
//是否添加过用户


//连接socket
io.on('connection', function (socket) {
  var addedUser = false;
  var username = null;
  var color = `rgb(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})`;
  //接收用户登录
  socket.on('addUserRequest', function (name) {
     //防止用户网络卡而被添加多次
    if (addedUser) return;
    addedUser = true;

    //把用户名字存储在socket上供其他方法使用
    username = name;
    members++;
    //首次加入房间的消息log只要自己看到就好了，这里直接用emit
    socket.emit('loginSuccess', {
      username,
      members
    });

    //通知除了自己的其他所有人 有人加入了房间
    socket.broadcast.emit('welcome', {
      username,
      members
    });
  });

  //接收消息
  socket.on('sendMessageRequest', function (message) {
    //发送给自己
    socket.emit('sendMessageSuccess', {
      username,
      message,
      color,
    });
    // 向*除了自己*之外的所有用户推送消息
    socket.broadcast.emit('sendMessageSuccess', {
      username,
      message,
      color,
    });

  });

  // 断开连接
  socket.on('disconnect', function () {
    if (addedUser) { //如果登陆过则执行，在输入modal不执行
      members--;
      socket.broadcast.emit('leave', {
        username,
        members,
      });
    }
  });
  // 正在输入
  socket.on('typingRequest', function (name) {
    //让其他人都看到
    socket.broadcast.emit('typingSuccess', name);
  });

})

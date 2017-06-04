$(function(){
  var login = false; //还未登陆
  var nameIpt = $('.content input') //输入用户名
  var mesIpt = $('.ipt input') //消息输入框
  var myModal = $('.mymodal'); //首次进入的modal框
  var ul = $('ul') //详细列表box
  var typing = $('small'); //正在输入
  var username = ''; //用户名
  var sendBtn = $('#send') //发送按钮
  //定义socket
  var socket = io();

  //设置屏幕点击和按键按下 输入框自动获得焦点
  $(window).on('click',function(e){
    _focus();
  })
  $(window).on('keydown',function(e){
    _focus();
    //输入名字后按回车进入聊天室
    if(e.which === 13){
      if(!login){
        //如果没有登录 发送登录请求
        var _name = nameIpt.val().trim()
        if(_name){
          socket.emit('addUserRequest', _name);
        }
      }else{
        //已经登录发送消息
        var message = mesIpt.val().trim()
        if(message){
          socket.emit('sendMessageRequest', message);
        }
      }
    }
  })
  //按钮发送
  sendBtn.click(function(){
    var message = mesIpt.val().trim()
    if(message){
      addMessage({username,message})
      socket.emit('sendMessageRequest', message);
    }
  })

  //用户输入消息是触发typing
  mesIpt.on('input', function() {
    socket.emit('typingRequest', username);
  });

  //登录成功
  socket.on('loginSuccess',function(data){
    login = true;
    username = data.username
    myModal.fadeOut()
    welcome(data)
  })
  //欢迎加入房间
  socket.on('welcome',function(data){
    welcome(data)
  })
  //xxx离开房间
  socket.on('leave',function(data){
    var li = $('<li>').html(`<li><p class='lost'>额.. ${data.username} 离开了聊天室 <br><span>目前聊天室共${data.members}人</span></p></li>`)
    ul.append(li)
    ul.scrollTop(ul[0].scrollHeight)
  })
  //消息发送成功
  socket.on('sendMessageSuccess',function(data){
    addMessage(data)
  })

  //显示正在输入
  socket.on('typingSuccess', function (username) {
    typing.text(`${username}正在输入...`).css('display','block').delay(2000).fadeOut();;
  });

  //本人失去连接
  socket.on('disconnect', function () {
    log('您已失去连接正在尝试重连...')
  });
  //本人重连失败
  socket.on('reconnect_error', function () {
    log('重连失败，再次尝试...')
  });
  //重连成功
  socket.on('reconnect', function () {
    log('连接成功！');
    if (username) {
      //如果还在房间里，重新加入房间
      socket.emit('addUserRequest', username);
    }
  });
  function _focus(){
    //获取焦点
    if(!login && !(event.ctrlKey || event.metaKey || event.altKey)){
      //如果没有登录
      nameIpt.focus()
    }else if(!(event.ctrlKey || event.metaKey || event.altKey)){
      //登录成功
      mesIpt.focus()
    }
  }
  //添加一条聊天消息
  function addMessage(data){
    var li = $('<li>').html(`<strong style='color:${data.color}'>${data.username}：</strong><span>${data.message}</span>`)
    li.fadeIn(3000)
    ul.append(li)
    ul.scrollTop(ul[0].scrollHeight)
    mesIpt.val('')
  }
  //添加欢迎消息
  function welcome(data){
    var li = $('<li>').html(`<li><p>欢迎 ${data.username} 加入了聊天室 <br><span>目前聊天室共${data.members}人</span></p></li>`)
    ul.append(li)
    ul.scrollTop(ul[0].scrollHeight)
  }

  //输出日志
  function log(data){
    var li = $('<li>').html(`<li><p class='lost'>${data}</p></li>`)
    ul.append(li)
    ul.scrollTop(ul[0].scrollHeight)
  }

})


let express = require('express');
let app = express();
let path = require('path')
app.use(express.static(path.resolve('./node_modules')))
app.get('/',function(req,res) {
    res.sendFile(path.resolve('index.html'))
})
//app.listen(8000)
let server = require('http').createServer(app);
let Message = require('./model').Message

    let io = require('socket.io')(server);
let sockets = {};
io.on('connection',function(socket) {
    let username;
    let currentRoom;
    socket.on('message',function(msg) {
        if(username) {
            let regexp = /@([^\s]+) (.+)/;
            let result = msg.match(regexp);
            if(result) {
                let toUser = result[1];
                let content = result[2];
                socket.send({username,content,createAt:new Date().toLocaleString()})
                sockets[toUser].send({username,content,createAt:new Date().toLocaleString()})
            }else {
                Message.create({username,content:msg},function(err,message){
                    if(currentRoom){
                        //那么广播的时候会向currentRoom中进行广播
                        io.in(currentRoom).emit('message',message);
                    }else{
                        io.emit('message',message);
                    }
                })
            }
        }else{
            username = msg;
            sockets[username] = socket
            io.emit('message',{username:`系统`,content:`欢迎${username}来到聊天室`,createAt:new Date().toLocaleString()});//广播给所有的客户端
        }

        //console.log(msg);
        //socket.send('服务器说：'+ msg);
    })
    socket.on('getAllMessages',function() {
        Message.find().sort({createAt:-1}).limit(10).exec(function(err,messages){
            messages.reverse();
            socket.emit('allMessages',messages);
        })
    })
    socket.on('join',function(roomName) {
        if(currentRoom) {
            socket.leave(currentRoom);
        }
        socket.join(roomName);
        currentRoom = roomName;
    })
    socket.on('delete',function(id){
        Message.remove({_id:id},function(err,result){
            io.emit('deleted',id);
        });
    });
})
server.listen(8000);

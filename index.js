const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const { timeStamp } = require('console');
const mysql = require("mysql");
var moment = require('moment-timezone');
const { disconnect } = require('process');
const connection = mysql.createConnection({
  "host": "us-cdbr-east-03.cleardb.com",
  "user": "bd73615bdd11fb",
  "password": "a3b52843",
  "database": "heroku_07c0dcb74d7fa85"
});

// connect
connection.connect(function (error) {
});
io.on("connection", socket => {
  socket.on('joinroom', (id) => {
    socket.join(id)
    connection.query("SELECT `Username`,`To_Username`,`m_message`,`m_time` FROM `message` WHERE`m_room`= '" + id + "'", function (error, result) {
      io.in(id).emit('message', result)
    });
    socket.on('message', ({ User_id, toUser_id, message }) => {
      time = moment().tz("Asia/Bangkok").format('YYYY-MM-DD HH:mm:ss');
      connection.query("INSERT INTO `message`(`m_id`, `Username`, `To_Username`, `m_message`, `m_time`, `m_room`) VALUES ('','" + User_id + "','" + toUser_id + "','" + message + "','" + time + "','" + id + "')", function (error, result) {
      });
      connection.query("SELECT `Username`,`To_Username`,`m_message`,`m_time` FROM `message` WHERE`m_room`= '" + id + "'", function (error, result) {
        io.in(id).emit('message', result)
      });

    });

    socket.on("disconnect", () => {
      socket.leave(id);
      console.log("user:" + socket.id + "leave:" + id )
    });
  });
})

http.listen(4000, function () {
  console.log('listening on port 4000')
})

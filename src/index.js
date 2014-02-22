var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')

app.listen(8081);

function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
    function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
}

var users = {};

io.sockets.on('connection', function (socket) {
    socket.on('join', function(name) {
        if (!name) {
            name = 'user';
        }

        users[socket.id] = name;
        // send to all but current
        socket.broadcast.emit('user-add', {
            name: name
        });

        var usersArray = [];
        for (var id in users) {
            var username = users[id];
            usersArray.push(username);
        }
        socket.emit('users', usersArray);
    });

    socket.on('disconnect', function() {
        io.sockets.emit('user-remove', {
            name: users[socket.id]
        });
        delete users[socket.id];
    });

    socket.on('send-message', function(message) {
        console.log('socket id ' + socket.id + ', send-message: ', message);
        io.sockets.emit('receive-message', {
            timestamp: Date.now(),
            name: users[socket.id],
            message: message
        });
    });
});
const express = require('express');
const app = express();
const server = require('http').Server(app);
const { v4: uuidv4 } = require('uuid');
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug:true
});


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.render('home');
});

app.post('/join', (req, res) => {
    let code = req.query['code'];
    res.redirect(`/${code}`);
});

app.get('/create', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId ) => {
        console.log('a user connected');
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);
        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message); 
        })
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId);
            console.log('user disconnected');
        });
    })
})



server.listen(process.env.PORT || 3030);

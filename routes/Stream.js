const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const rtsp = require('../lib/rtsp-ffmpeg');
const ini = require('ini')
const express = require('express');
var router = express.Router();

const port = 3000;

try {
    var config = ini.parse(fs.readFileSync('C:/AcessoLinear/www/ConfigWWW.ini', 'utf-8'))
} catch (err) {
    console.error(err);
}

var cams = [config.FOTOADMMORADOR.CAMERA_IP_RTSP].map(function (uri, i) {
    var stream = new rtsp.FFMpeg({
        input: uri,
        resolution: '320x240',
        quality: 3
    });
    stream.on('start', function () {
        console.log('stream ' + i + ' started');
    });
    stream.on('stop', function () {
        console.log('stream ' + i + ' stopped');
    });
    return stream;
});

cams.forEach(function (camStream, i) {
    var ns = io.of('/cam' + i);
    ns.on('connection', function (wsocket) {
        console.log('connected to /cam' + i);
        var pipeStream = function (data) {
            wsocket.emit('data', data);
        };
        camStream.on('data', pipeStream);

        wsocket.on('disconnect', function () {
            console.log('disconnected from /cam' + i);
            camStream.removeListener('data', pipeStream);
        });
    });
});

io.on('connection', function (socket) {
    socket.emit('start', cams.length);
});

router.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

module.exports = router;
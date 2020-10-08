//sever ------------------------------------------------------
var dgram = require('dgram');

exports.udpServer = function (udpHost, udpPort, msgFunc) {
    var server = dgram.createSocket('udp4');
    
    server.on('error', (err) => {
        console.log(`server error:\n${err.stack}`);
        server.close();
      });

    // pass in callbacks
    server.on('listening', function () {
        var address = server.address();
        console.log('UDP Server listening on ' + address.address + ":" + address.port);
    });
    server.on('message', function (message, remote) {
        console.log(remote.address + ':' + remote.port + ' - ' + message);
        var msgResponse = msgFunc(message);
        server.send(msgResponse, 0, msgResponse.length, remote.port, remote.address, function (err, bytes) {
            if (err) throw err;
            console.log('UDP server message sent to ' + remote.address + ':' + remote.port);
        });
    });
    server.bind(udpHost, udpPort);
  };




var PORT = 5005;
var HOST = '127.0.0.1';
var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port + ' - ' + message);
    var msgResponse = "OK";
    server.send(msgResponse, 0, msgResponse.length, remote.port, remote.address, function (err, bytes) {
        if (err) throw err;
        console.log('UDP server message sent to ' + remote.address + ':' + remote.port);
    });
});
server.bind(PORT, HOST);


//client ------------------------------------------------------
var PORT = 4444;
var HOST = '127.0.0.1';
var dgram = require('dgram');
var message = new Buffer('I am Thor!');
var client = dgram.createSocket('udp4');
client.send(message, 0, message.length, PORT, HOST, function (err, bytes) {
    if (err) throw err;
    console.log('UDP client message sent to ' + HOST + ':' + PORT);
});
client.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port + ' - ' + message);
    client.close();
});
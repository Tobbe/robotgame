var serialport = require("serialport");
var serialPort;
serialport.list(function (err, ports) {
    ports.forEach(function(port) {
        if (port.manufacturer === "STMicroelectronics.") {
            serialPort = new serialport.SerialPort(port.comName);

            serialPort.on("open", function () {
                var script =
                    "var leds = [new Pin('B3'), new Pin('B4'), new Pin('B5')];\n" +
                    "function turnLedOn(led) {\n" +
                    "    leds[led].set();\n" +
                    "}\n" +
                    "function turnLedOff(led) {\n" +
                    "    leds[led].reset();\n" +
                    "}\n" +
                    "leds.forEach(function(led) { led.reset(); });\n";
                serialPort.write(script, function(err, results) {
                    if (err) {
                        console.log('err ' + err);
                    }
                });
            });
        }
    });
});

function setLedOn(led, on) {
    var cmd = on ? "turnLedOn(" + led + ");\n" : "turnLedOff(" + led + ");\n";
    serialPort.write(cmd, function (err, results) {
        if (err) {
            console.log('err ' + err);
        }
    });
}

var http = require('http');
var PORT = 8080;

function parseBody(request, callback) {
    var data = '';

    request.on('data', function(chunk) {
        data += chunk;
    });

    request.on('end', function() {
        callback(data);
    });
}

function handleRequest(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.end('');
    if (request.method == 'PUT' && request.url.length > 1) {
        parseBody(request, function (data) {
            setLedOn(request.url[1], data === 'on');
        });
    }
}

var server = http.createServer(handleRequest);

server.listen(PORT, function () {
    console.log("Server listening on: http://localhost:%s", PORT);
});

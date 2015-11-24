var serialport = require("serialport");
var serialPort;
serialport.list(function (err, ports) {
    ports.forEach(function(port) {
        if (port.manufacturer === "STMicroelectronics.") {
            serialPort = new serialport.SerialPort(port.comName);

            serialPort.on("open", function () {
                var script = "var led1IsOn = false;\n" +
                             "LED1.reset();\n" +
                             "function toggleLed() {\n" +
                             "    if (led1IsOn) {\n" +
                             "        LED1.reset();\n" +
                             "        led1IsOn = false;\n" +
                             "    } else {\n" +
                             "        LED1.set();\n" +
                             "        led1IsOn = true;\n" +
                             "    }\n" +
                             "}\n";
                serialPort.write(script, function(err, results) {
                    if (err) {
                        console.log('err ' + err);
                    }
                });
            });
        }
    });
});

function toggleLed() {
    serialPort.write("toggleLed();\n", function (err, results) {
        if (err) {
            console.log('err ' + err);
        }
    });
}

var http = require('http');
var PORT = 8080; 

function handleRequest(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.end('');
    if (request.url == '/1') {
        toggleLed();
    }
}

var server = http.createServer(handleRequest);

server.listen(PORT, function () {
    console.log("Server listening on: http://localhost:%s", PORT);
});

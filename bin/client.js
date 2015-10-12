var crypto = require("crypto");
var net = require("net");
var iconv = require("iconv-lite");

var aes1 = crypto.createCipher("aes-256-cfb", "27926f29691b6cbb4769b7931edfcd7062207ce8ac3ffe75b57bb7a26fff877d");
var aes2 = crypto.createDecipher("aes-256-cfb", "27926f29691b6cbb4769b7931edfcd7062207ce8ac3ffe75b57bb7a26fff877d");
function encodeData(data) {
    return aes1.update(data);
}

function decodeData(data) {
    return aes2.update(data);
}

var c = net.connect(4433, "localhost", function () {
    console.log("已连接");
});

c.on("data", function (chunk) {
    process.stdout.write(decodeData(chunk));
});

function onEnd()
{
    console.log("\n与服务器的连接已断开");
    process.exit();
}
c.on("end", onEnd);
c.on("error", onEnd);

process.stdin.on("data", function (chunk) {
    c.write(encodeData(chunk));
});
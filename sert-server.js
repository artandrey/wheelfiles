const http = require('http');
const fs = require('fs');
http.createServer((req, res) => {
        const file = new fs.ReadStream('8C4A09332441CC1292A977E0F1532A6A.txt');
        // file.on('end', () => {
        //     res.statusCode = 200;
        //     res.end()
        // });
        // file.on('readable', () => {
        //     const data = file.read();
        //     if (!data) return;
        //     res.write(data);
        // });
        // file.on('error', () => {
        //     res.statusCode = 500;
        //     res.end('Smth went wrong(');
        // });
        file.pipe(res);

        file.on('error', (err) => {
            res.statusCode = 500;
            res.end('Error 500');
            console.error(err);
        });
        res.on('close', () => {
            console.log('Connection closed');
            file.destroy();
        });
}).listen(80);
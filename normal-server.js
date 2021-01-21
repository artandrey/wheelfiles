const https = require('https');
const fs = require('fs');
const nodemailer = require('nodemailer');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config.json');
const wheelOptions = config.wheelOptions;
const PORT = 8080;
const validator = require('validator');
var phoneCollection = null;
const smsArray = {};

//connectiong to db hehe

// Connection URL
const url = 'mongodb://localhost:27017';
 
// Database Name
const dbName = 'wheelDB';
 
// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  console.log("Connected successfully to server");
 
  const db = client.db(dbName);
  phoneCollection = db.collection('phones');

 
});



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.auth.email,
        pass: config.auth.pass
    }
});

const options = {
  key: fs.readFileSync('ssl/private.key'),
  cert: fs.readFileSync('ssl/certificate.crt')
};

https.createServer(options, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.url === '/lagrand') {
        console.log('lagrand!');
        if (req.method === 'POST') {
            var buffer = '';
            req.on('data', chunk => {
                buffer += chunk;
                if (buffer.length > 1e6) { 
                    // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                    req.connection.destroy();
                }
            });
            req.on('end', () => {
                try {
                    const data = JSON.parse(buffer);
                    console.log(data);
                    transporter.sendMail(data[0]).then(() => {
                        console.log('Success');
                    }).catch(console.error) 
                    transporter.sendMail(data[1]).then(() => {
                        console.log('Success');
                    }).catch(console.error) 
                    res.end('Success');
                }
                catch (e) {
                        console.error(e);
                        res.end('Error!');
                }
            }); 
        }
        else {
            res.end('Must be POST');
        }
    }
    else if (req.url === '/wheel') {
            // res.end(`{"optionIndex":3}`);
            // return;
        if (req.method === 'POST') {
            var buffer = '';
            req.on('data', chunk => {
                buffer += chunk;
                if (buffer.length > 1e6) { 
                    // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                    req.connection.destroy();
                }
            });
            req.on('end', () => {
                console.log(buffer);
                try {
                    const data = JSON.parse(buffer);
                    const optionIndex = random(wheelOptions.length-1);
                    
                    if (!data.phone) throw ('No phone!');    
                    if (validator.default.isMobilePhone(data.phone)) {
                        phoneCollection.find({}).toArray().then(array => {
                            if (array.find(el => {
                                if (el.phone) {
                                    const searchedNumber = data.phone.slice(data.phone.length-10, 10);
                                    return el.phone.includes(searchedNumber);
                                }
                            })) {
                                console.log('Phone is used!');
                                res.statusCode = 404
                                res.end(JSON.stringify({
                                        error: 'phone'
                                    }
                                ));
                                return;
                            }   
                            
                            phoneCollection.insertOne({
                                optionIndex: optionIndex,
                                optionName: wheelOptions[optionIndex],
                                phone: data.phone
                            });

                            if (!data.sms) {
                                    
                                res.statusCode = 200;
                                res.end(JSON.stringify(
                                    {
                                        optionIndex: optionIndex,
                                        optionName: wheelOptions[optionIndex]
                                    }
                                ));
                                const date = new Date();
                                transporter.sendMail({
                                    from: 'Заявка с колеса с сайта ' + data.url,
                                    to: config["YOUR-EMAIL"],
                                    subject: "Заявка с колеса с сайта " + data.url,
                                    text: "Пользователь ввёл свой номер",
                                    html: ` <i>Номер:</i> <strong>${data.phone}</strong>.
                                            <br/>
                                            <i>Подарок:</i> <strong>${wheelOptions[optionIndex]}</strong>.
                                            <br/>
                                            <i>Время:</i> <strong>${date.toLocaleDateString() + ' ' + date.toLocaleTimeString()}</strong>.
                                    `,
                                }, (err, data) => {
                                    console.log(err);
                                });
        
                            
                            console.log('SENDED EMAIL!!!!');
                            }
                            else {
                                console.log('Add sms');
                                const code = Math.floor(getRandomArbitrary(10000, 99999)) + '';
                                smsArray[data.phone] = code;
                                console.log(code);
                                fetch(`https://smsc.ru/sys/send.php?login=${config.sms.login}&psw=${config.sms.password}&phones=${data.phone}&mes=Ваш код:${code}`);
                                res.end(JSON.stringify({type: 'Success!'}));
                            }
                            
                        });

                    }
                } catch (e) {
                    console.log(e);
                    console.error('Bad json from user. Catch the error!');
                    res.statusCode = 400;
                    res.end('Bad request');
                }
            });
        } else {
            res.statusCode = 400;
            res.end('Bad request')
        }
    }
    else if (req.url === '/wheel/sms-init') {
        if (req.method !== 'POST') {
            res.end('Must be POST');
            return;
        }
        var buffer = '';
            req.on('data', chunk => {
                buffer += chunk;
                if (buffer.length > 1e6) { 
                    // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                    req.connection.destroy();
                }
            });
            req.on('end', () => {





                let data;
                try {
                    data = JSON.parse(buffer);
                    console.log(data);
                }
                catch(e) {
            console.log(e);
            res.statusCode = 403;
            res.end('Bad request');
            return;
        }
        if (!data.phone && !data.code) {
            res.statusCode = 403;   
            res.end('Phone not sended');
            return;
        }
        const code = smsArray[data.phone];
        if (!code) {
            res.statusCode = 400;
            res.end('Invalid code');
            return;
        }
        if (data.code !== code) {
            res.statusCode = 400;
            res.end('Invalid code');
            return;
        }
        const date = new Date();
        const optionIndex = random(wheelOptions.length-1);
        transporter.sendMail({
            from: 'Заявка с колеса с сайта ' + data.url,
            to: config["YOUR-EMAIL"],
            subject: "Заявка с колеса с сайта " + data.url,
            text: "Пользователь ввёл свой номер",
            html: ` <i>Номер:</i> <strong>${data.phone}</strong>.
            <br/>
            <i>Подарок:</i> <strong>${wheelOptions[optionIndex]}</strong>.
                    <br/>
                    <i>Время:</i> <strong>${date.toLocaleDateString() + ' ' + date.toLocaleTimeString()}</strong>.
                    `,
        }, (err, data) => {
            console.log(err);
        });

        res.statusCode = 200;
        res.end(JSON.stringify(
            {
                optionIndex: optionIndex,
                optionName: wheelOptions[optionIndex]
            }
            ));
        });
            
        }
        else {
            console.log(req.url);
            res.statusCode = 404;
            res.end('There is nothing here');
        }
    }).listen(PORT);
    
    const random = function (max) {
    return Math.floor(Math.random() * (max + 1));
}
const getRandomArbitrary = function (min, max) {
    return Math.random() * (max - min) + min;
}
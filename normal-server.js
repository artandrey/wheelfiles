const https = require('https');
const fs = require('fs');
const nodemailer = require('nodemailer');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config.json');
const wheelOptions = config.wheelOptions;
const PORT = 8080;
const validator = require('validator');
var phoneCollection = null;

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
            let buffer = '';
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
                        console.log('Success')
                        res.end('Success');
                    }).catch(console.error) 
                    transporter.sendMail(data[1]).then(() => {
                        console.log('Success')
                        res.end('Success');
                    }).catch(console.error) 
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
            let buffer = '';
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
                            res.statusCode = 200;
                            res.end(JSON.stringify(
                                {
                                    optionIndex: optionIndex,
                                    optionName: wheelOptions[optionIndex]
                                }
                            ));
                            phoneCollection.insertOne({
                                optionIndex: optionIndex,
                                optionName: wheelOptions[optionIndex],
                                phone: data.phone
                            });
                            const date = new Date();
                            transporter.sendMail({
                                from: 'Wheel app',
                                to: config["YOUR-EMAIL"],
                                subject: "Wheel app",
                                text: "Пользователь ввёл свой номер",
                                html: ` <i>Номер:</i> <strong>${data.phone}</strong>.
                                        <br/>
                                        <i>Опция:</i> <strong>${wheelOptions[optionIndex]}</strong>.
                                        <br/>
                                        <i>Время:</i> <strong>${date.toLocaleDateString() + ' ' + date.toLocaleTimeString()}</strong>.
                                `,
                            }, (err, data) => {
                                console.log(err);
                            });
    
                        
                        console.log('SENDED EMAIL!!!!');
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
    else {
        res.statusCode = 404;
        res.end('There is nothing here');
    }

}).listen(PORT);

const random = function (max) {
    return Math.floor(Math.random() * (max + 1));
}
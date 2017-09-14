const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen((process.env.PORT || 3000));

//api.ai
const apiaiApp = require('apiai')('5e61fdf6f7e7479e8b6e731935014b94');

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

/* For Facebook Validation */
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'tuxedo_cat') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

/* Handling all messenges */
app.post('/webhook', (req, res) => {
  console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          sendMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});

// generic function sending messages
function sendMessage(event) {

    let sender = event.sender.id;
    let text = event.message.text;

    let apiai = apiaiApp.textRequest(text, {
    sessionId: 'tabby_cat' // use any arbitrary id
    });

    apiai.on('response', (response) => {
        
        let aiText = response.result.fulfillment.speech;

        request({
          url: 'https://graph.facebook.com/v2.6/me/messages',
          qs: {access_token: 'EAADFSWLfjLIBAK5cuO7VZBpSqJ0adZC1vAGPUTMe6N2jYYSdSAr2cz6KJ0NZA2vO7KQ17AYlrowvXkZBNRhjq8vCuknnnODPcopwZBWWYifr4ZA1nBZAO34YWqhYhxeCfneucZCatKvZCj8alPoOmfZBGzh5jZBZAfnAzktjaoTfA2SskwZDZD'},
          method: 'POST',
          json: {
            recipient: {id: sender},
            message: {text: aiText}
          }
        }, (error, response) => {
          if (error) {
              console.log('Error sending message: ', error);
          } else if (response.body.error) {
              console.log('Error: ', response.body.error);
          }
        });
        
    });

    apiai.on('error', (error) => {
    console.log(error);
    });

    apiai.end();}







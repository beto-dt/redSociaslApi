var express = require('express');
var MessageController = require('../controller/message');
var api = express.Router();
var md_auth = require('../middleware/authtenticated');


api.get('/test-message',md_auth.ensureAuth,MessageController.test);
api.post('/message',md_auth.ensureAuth,MessageController.saveMessage);
api.get('/my-messages/:page?',md_auth.ensureAuth,MessageController.getReceivedMessages);
api.get('/messages/:page?',md_auth.ensureAuth,MessageController.getEmmitMessages);
api.get('/unviewed-messages',md_auth.ensureAuth,MessageController.getUnviewedMessage);
api.get('/set-viewed-messages',md_auth.ensureAuth,MessageController.setViewedMessages);

module.exports = api;

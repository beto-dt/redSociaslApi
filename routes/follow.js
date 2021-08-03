const { Router } = require('express');
var express = require('express');
var FollowController = require('../controller/follow');
var api = express.Router();
var md_auth = require('../middleware/authtenticated');

api.get('/prueba-follow',md_auth.ensureAuth,FollowController.prueba);
api.post('/follow',md_auth.ensureAuth,FollowController.saveFollow);
api.delete('/follow/:id',md_auth.ensureAuth,FollowController.deleteFollow);
api.get('/following/:id?/:page?',md_auth.ensureAuth,FollowController.getFollowingUsers);
api.get('/followed/:id?/:page?',md_auth.ensureAuth,FollowController.getFollowdUsers);
api.get('/get-my-follows/:followed?',md_auth.ensureAuth,FollowController.getMyFollow);



module.exports = api;
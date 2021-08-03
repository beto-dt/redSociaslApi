var express = require('express');
var UserController = require('../controller/user');
var api = express.Router();
var md_auth = require('../middleware/authtenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users'});

api.post('/register', UserController.saveUsers);
api.post('/login',UserController.loginUser);
api.get('/prueba',md_auth.ensureAuth,UserController.prueba);
api.get('/user/:id',md_auth.ensureAuth,UserController.getUser);
api.get('/users/:page?',md_auth.ensureAuth,UserController.getUsers);
api.get('/counters/:id?',md_auth.ensureAuth,UserController.getcounters);
api.put('/update-user/:id',md_auth.ensureAuth,UserController.updateUser);
api.post('/upload-image-user/:id',[md_auth.ensureAuth,md_upload],UserController.uploadImagen);
api.get('/get-image-user/:imageFile',UserController.getImageFile);



module.exports = api;


var express = require('express');
var PublicationController = require('../controller/publication');
var api = express.Router();
var md_auth = require('../middleware/authtenticated');
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/publications'});

api.get('/probando-pub',md_auth.ensureAuth, PublicationController.probando);
api.post('/publication',md_auth.ensureAuth, PublicationController.savePublication);
api.get('/publications/:page?',md_auth.ensureAuth, PublicationController.getPublications);
api.get('/publication/:id',md_auth.ensureAuth, PublicationController.getPublication);
api.delete('/publication/:id',md_auth.ensureAuth, PublicationController.deletePublication);
api.post('/upload-image-pub/:id',[md_auth.ensureAuth,md_upload],PublicationController.uploadImagen);
api.get('/get-image-pub/:imageFile',PublicationController.getImageFile);



module.exports = api;
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');
var moongosePaginate = require('mongoose-pagination');
var User = require('../models/user');
var Publication = require('../models/publication');
var Follow = require('../models/follow');

const { exists, count } = require('../models/user');
const follow = require('../models/follow');
const user = require('../models/user');

function saveUsers(req, res) {
    var params = req.body;
    var user = new User();

    if (params.name && params.surname &&
        params.nick && params.email &&
        params.password
    ) {
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        //Control usuarios duplicados

        User.find({
            $or: [
                { email: user.email.toLowerCase() },
                { nick: user.nick.toLowerCase() },
            ]
        }).exec((err, users) => {
            if (err) return res.status(500).send({ message: 'Error en la peticion de usuario' })

            if (users && users.length >= 1) {
                res.status(200).send({ message: 'El usuario que intentas registrar ya existe' })
            } else {
                // Cifrar contraseña y guardar los datos
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;
                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({ message: 'Error al guardar usuarios!' })

                        if (userStored) {
                            res.status(200).send({ userStored })
                        } else {
                            res.status(404).send({ message: 'No se ha registrado el usuario' })
                        }
                    })
                });
            }
        })


    } else {
        res.status(200).send({
            message: 'Enviar todos los campos necesarios'
        })

    }

}

function loginUser(req, res) {
    var params = req.body;
    var email = params.email;
    var password = params.password;

    User.findOne({ email: email }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' })
        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    //devolver datos de usuario
                    if (params.gettoken) {
                        //devolver token
                        res.status(200).send({
                            token: jwt.createToken(user)
                        })
                    } else {
                        //devolver datos de usuario
                        user.password = undefined;
                        res.status(200).send({ user })
                    }

                }
                else {
                    return res.status(404).send({ message: 'El Usuario no se a podido identificar' })
                }
            })
        } else {
            return res.status(404).send({ message: 'El Usuario no se a podido identificar!!' })

        }
    })




}

function prueba(req, res) {
    return res.status(200).send({ message: 'test test test!!!!!!' })
}

//consegir datos de un usuario 
function getUser(req, res) {
    var userId = req.params.id;
    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' })
        if (!user) return res.status(404).send({ message: 'el usuario no existe' })

        followThisUser(req.user.sub, userId).then((value) => {
            user.password = undefined;
            return res.status(200).send({
                user,
                following: value.following,
                followed: value.followed
            });

        });


    });



}

async function followThisUser(identity_user_id, userId) {
    var following = await Follow.findOne({ "user": identity_user_id, "followed": userId }).exec((err, follow) => {
        if (err) return handleError(err);
        return follow;
    });
    var followed = await Follow.findOne({ "user": userId, "followed": identity_user_id }).exec((err, follow) => {
        if (err) return handleError(err);
        return follow;
    });

    return {
        following: following,
        followed: followed
    }
}

//Devolver un listado de usuario paginados
function getUsers(req, res) {
    var identity_user_id = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemPerPage = 5;

    User.find().sort('_id').paginate(page, itemPerPage, (err, users, total) => {

        if (err) return res.status(500).send({ message: 'error en la peticion' })
        if (!users) return res.status(404).send({ message: 'No hay usuarios disponibles' })

        followUserIds(identity_user_id).then((value) => {
            return res.status(200).send({
                users,
                user_following: value.following,
                users_follow_me: value.followed,
                total,
                page: Math.ceil(total / itemPerPage)
            });
        });

    });
}

async function followUserIds(user_id) {
    var following = await Follow.find({ "user": user_id }).select({ '_id': 0, '__uv': 0, 'user': 0 }).exec().then((follows) => {
        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });
        console.log(follows_clean);
        return follows_clean;
    }).catch((err) => {
        return handleerror(err);
    });

    var followed = await Follow.find({ "followed": user_id }).select({ '_id': 0, '__uv': 0, 'followed': 0 }).exec().then((follows) => {
        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push(follow.user);
        });
        return follows_clean;
    }).catch((err) => {
        return handleerror(err);
    });

    console.log(following);
    return {
        following: following,
        followed: followed
    }
}

function getcounters(req, res) {
    var user_Id = req.user.sub;
    if (req.params.id) {
        user_Id = req.params.id;
    }
    getCountFollow(user_Id).then((value) => {
        return res.status(200).send(value)
    });
}

async function getCountFollow(user_id) {
    var following = await Follow.count({ "user": user_id }).exec().then((count) => {
        return count;
    }).catch((err) => {
        return handleerror(err);
    });
    var followed = await Follow.count({ "followed": user_id }).exec().then((count) => {
        return count;
    }).catch((err) => {
        return handleerror(err);
    });

    var publication = await Publication.count({ 'user': user_id }).exec().then((count) => {
        return count;

    }).catch((err) => {
        return handleerror(err);
    });

    return {
        following: following,
        followed: followed,
        publication: publication
    }
}
//Edicion de datos de usuario
function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    //borrar la propiedad password 
    delete update.password;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'No tiene permiso para actualizr los datos del usuario' })
    }

    User.find({
        $or: [
            { email: update.email.toLowerCase() },
            { nick: update.nick.toLowerCase() }
        ]
    }).exec((err, users) => {
        var user_isset = false;
        users.forEach((user)=> {
            if ( user && user._id != userId)   var user_isset = true;
        });

        if(user_isset) return res.status(404).send({ message: 'Los datos ya estan en uso' }) ;

        User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
            if (err) return res.status(500).send({ message: '  Error en la Peticion' })
            if (!userUpdated) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' })

            return res.status(200).send({ user: userUpdated })
        });
    });


}

//Subir archivos de imagen /avatar de usuarios
function uploadImagen(req, res) {
    var userId = req.params.id;


    if (req.files) {
        var file_path = req.files.image.path;
        console.log(file_path);

        var file_split = file_path.split('/');
        console.log(file_split);

        var file_name = file_split[2];
        console.log(file_name);

        var ext_split = file_name.split('.');
        console.log(ext_split);


        var file_ext = ext_split[1
        ];
        console.log(file_ext);

        if (userId != req.user.sub) {
            return removeFilesOfUploads(res, file_path, 'No tiene permiso para actualizr los datos del usuario');
        }

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif') {
            //Actualizar documento de usuario logiado 
            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err) return res.status(500).send({ message: '  Error en la Peticion' })
                if (!userUpdated) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' })

                return res.status(200).send({ user: userUpdated })
            })
        } else {
            return removeFilesOfUploads(res, file_path, 'Extencion no valida');
        }

    } else {
        return res.status(200).send({ message: 'No se han subio imagenes' })
    }

}

function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({ message: message });
    })
}


function getImageFile(req, res) {
    var image_file = req.params.imageFile;
    var path_file = './uploads/users/' + image_file;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file))
        } else {
            res.status(200).send({ message: 'No existe la imagen ...' })
        }
    })

}


module.exports = {
    saveUsers,
    loginUser,
    prueba,
    getUser,
    getUsers,
    updateUser,
    uploadImagen,
    getImageFile,
    getcounters
}
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');

function prueba(req, res) {
    res.status(200).send({ message: 'Hola soy controller folow' });

}

function saveFollow(req, res) {
    var params = req.body;
    var follow = new Follow();
    follow.user = req.user.sub;
    follow.followed = params.followed;
    follow.save((err, followStored) => {
        if (err) return res.status(500).send({ message: 'Error al guardar el seguimiento' })
        if (!followStored) return res.status(404).send({ message: 'El seguimiento no se guarda' })

        return res.status(200).send({ followStored });
    })
}

function deleteFollow(req, res) {
    var userId = req.user.sub;
    var followId = req.params.id;

    Follow.find({ 'user': userId, 'followed': followId }).remove(err => {
        if (err) return res.status(500).send({ message: 'Error al dejar de seguir' })

        return res.status(200).send({ message: 'El follow Eliminado' })
    })
}

function getFollowingUsers(req, res) {
    var userId = req.user.sub;

    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }

    var page = 1;

    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id
    }

    var itemPerPage = 4;

    Follow.find({ user: userId }).populate({ path: 'followed' }).paginate(page, itemPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor' });
        if (!follows) return res.status(404).send({ message: 'No estas siguiendo a ninguna persona' });

        return res.status(200).send({
            total: total,
            page: Math.ceil(total / itemPerPage),
            follows
        })

    })

}

function getFollowdUsers(req, res) {
    var userId = req.user.sub;


    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }

    var page = 1;

    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id
    }

    var itemPerPage = 4;

    Follow.find({ followed: userId }).populate('user').paginate(page, itemPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor' });
        if (!follows) return res.status(404).send({ message: 'No te sigue ningun usuario' });

        return res.status(200).send({
            total: total,
            page: Math.ceil(total / itemPerPage),
            follows
        })

    })
}
//Devolver usuario que sigo 
function getMyFollow(req, res) {
    var userId = req.user.sub;
    var find = Follow.find({ user: userId });

    if(req.params.followed){
        find = Follow.find({ followed: userId });
    }

      find.populate('user followed').exec((err, follows) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor' })
        if (!follows) return res.status(404).send({ message: 'No sigues  ningun usuario' })

        return res.status(200).send({follows})
    })
}


module.exports = {
    prueba,
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowdUsers,
    getMyFollow
}
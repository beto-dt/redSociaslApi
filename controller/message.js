var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination')
var Message = require('../models/message');
var User = require('../models/user');
var Follow = require('../models/follow');
const message = require('../models/message');

function test(req, res) {
    return res.status(200).send({ message: 'hola que tal mensaje' });
}

function saveMessage(req, res) {
    var params = req.body;
    if (!params.text || !params.receiver) return res.status(200).send({ message: 'Enviar los campos necesarios' });
    var message = new Message();
    message.emmiter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewes = 'false';

    message.save((err, messageStore) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        if (!messageStore) return res.status(500).send({ message: 'Error al enviar el mensaje' });

        return res.status(200).send({ message: messageStore });

    })
}

function getReceivedMessages(req, res) {
    var userId = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Message.find({ receiver: userId }).populate('emmiter', 'name surname nick image _id').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        if (!messages) return res.status(500).send({ message: 'No hay mensajes' });
        return res.status(200).send({
            total: total,
            page: Math.ceil(total / itemsPerPage),
            messages
        });
    });

}

function getEmmitMessages(req, res) {
    var userId = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Message.find({ emmiter: userId }).populate('emmiter receiver', 'name surname nick image _id').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        if (!messages) return res.status(500).send({ message: 'No hay mensajes' });
        return res.status(200).send({
            total: total,
            page: Math.ceil(total / itemsPerPage),
            messages
        });
    });

}

function getUnviewedMessage(req, res) {
    var userId = req.user.sub;
    Message.count({ receiver: userId, viewed: 'false' }).exec((err, count) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        return res.status(200).send({
            'unviewed': count
        })
    })
}


function setViewedMessages(req, res){
    var userId = req.user.sub;

    Message.update({receiver:userId, viewed:'false'},{viewed:'true'},{"multi":true},(err,messageUpdated)=>{
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        return res.status(200).send({
            messages:messageUpdated
        })
    })
}

module.exports = {
    test,
    saveMessage,
    getReceivedMessages,
    getEmmitMessages,
    getUnviewedMessage,
    setViewedMessages
}
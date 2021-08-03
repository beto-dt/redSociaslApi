var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

//Crear base de datos 
mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://Alberto:74vNh2O3slPMP8a3@redsocialbeto.r9bd5.mongodb.net/RedSocialBeto?retryWrites=true&w=majority',{ useNewUrlParser: true ,useUnifiedTopology: true })
        .then(() => {
            console.log('Conexion exitosa !')
            //crear servidor
            app.listen(port,() => {
                console.log('servidor corriendo en http://localhost:3800')
            })
        })
        .catch(err => console.log(err))
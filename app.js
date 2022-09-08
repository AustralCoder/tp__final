const express = require('express');
require('dotenv').config();
const path = require('path');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const hbs = require('hbs');
const app = express();
const PORT = process.env.PORT || 8080;
const http = require('http');
const server = http.Server(app);

//Conexión a la Base de Datos
const conexion = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
}); 



conexion.connect((err) => {
    if (err) {
        console.error(`Error en la conexión: ${err.stack}`)
        return;
    }
    // console.log(`Conectado a la Base de Datos ${process.env.DATABASE}`);
});  

//Middelwares
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, 'public')));



app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views/partials'));


app.get ('/' , (req,res)=>{
    res.render('index');
});

app.get('/forum', (req, res) => {

    res.render('forum')
}); 

app.get('/about', (req, res) => {
    res.render('about');
});
app.post('/forum', (req, res) => {


    const { nombreAlbum, artista } = req.body;

    // console.log(nombreAlbum, artista);

    if (nombreAlbum == '' || artista == '') {
        let validacion = 'Rellene los campos correctamente..';
        res.render('forum', {
            titulo: 'Forum',
            validacion
        });
    } else{

        let datos = {
            Artista: artista, 
            Album: nombreAlbum, 
        };

        let sql = 'INSERT INTO recomendaciones SET ?';

        conexion.query(sql, datos, (err, result) => {
            if (err) throw err;
            res.render('enviado');

        });
    }
});



app.post('/', (req, res) => {
    
    const { nombre, email } = req.body;

    
    if (nombre == '' || email == '') {
        let validacion = 'Rellene la Suscripción correctamente..';
        res.render('/', {
            titulo: 'Formulario para Suscripción',
            validacion
        });
    } else{
        // console.log(nombre);
        // console.log(email);
        
        async function envioMail(){

            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.USEREMAIL,
                    pass: process.env.USERPASS
                }
            });

            let envio = await transporter.sendMail({
                from: process.env.USEREMAIL,
                to: `${email}`,
                subject: 'Gracias por Suscribirse a Trash.ly UTN newsletter',
                html: `Gracias por haber realizado la subscripción a Trash.ly UTN recuerde que es totalmente gratuita y puede cancelar la subscripción respondiendo este mismo mail.
                <br>
                Desde ya muchas gracias
                <br>
                - El equipo de trash.ly UTN`
            });
            
   
            res.render('enviadomail', {
                titulo: 'Mail Enviado',
                nombre, 
                email
            })
        }
        envioMail();    
    }
})



server.listen(PORT, () => {
    console.log(`Escuchando al puerto http://localhost:${PORT}/`);
  });


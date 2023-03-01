const express = require('express');
var router = express.Router();
const Firebird = require('node-firebird');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser'); // Importar o body-parser
const { Console } = require('console');
const Stream = require('node-rtsp-stream');

const app = express();
const port = 3000;

// Configuração do Express
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', './views');
// Configuração do body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

const cameraRoute = require('./routes/Cameras')
app.use("/cameras", cameraRoute)
// Conexão com o banco de dados
app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log(`VER AS CAMERAS http://localhost:${port}/cameras`);
    console.log(`ADICIONAR NOVA http://localhost:${port}/cameras/nova`)
});

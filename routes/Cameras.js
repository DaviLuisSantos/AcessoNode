const express = require('express');
var router = express.Router();
const Firebird = require('node-firebird');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser'); // Importar o body-parser
const { Console } = require('console');
const { request } = require('http');
const Stream = require('node-rtsp-stream');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.json());

// Configuração do body-parser
app.use(bodyParser.urlencoded({ extended: true }));


// Conexão com o banco de dados
const options = {
    database: 'C://AcessoLinear//Dados//BANCODEDADOS.FDB',
    user: 'SYSDBA',
    password: 'masterkey'
};

router.get('/', (req, res) => {
    const id = req.params.id;
    Firebird.attach(options, (err, db) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao conectar ao banco de dados');
        }

        db.query('SELECT * FROM LPR_MT_CAMERAS ORDER BY ID', (err, result) => {
            if (err) {
                console.error(err);
                db.detach();
                return res.status(500).send('Erro ao executar a consulta');
            }

            const cameras = result;
            db.detach();
            res.render('Cameras/cameras', { cameras });
            console.log(cameras[0].ID);
        });
    });
});

router.get('/nova', (req, res) => {
    res.render('./Cameras/nova-camera');
});

router.post('/nova', (req, res) => {
    const { local, ip, porta_api, modelo, direcao, id_area, desc_area, inativa, login, senha, porta_http } = req.body;

    Firebird.attach(options, (err, db) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao conectar ao banco de dados');
        }

        db.query(
            'INSERT INTO LPR_MT_CAMERAS (LOCAL, IP, PORTA_API, MODELO, DIRECAO, ID_AREA, DESC_AREA, INATIVA, LOGIN, SENHA, PORTA_HTTP) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [local, ip, porta_api, modelo, direcao, id_area, desc_area, inativa, login, senha, porta_http],
            (err, result) => {
                if (err) {
                    console.error(err);
                    db.detach();
                    return res.status(500).send('Erro ao executar a consulta');
                }

                db.detach();
                res.redirect('/');
            }
        );
    });
});

// Rota para carregar informações da câmera a ser editada
router.get('/:id/editar', (req, res) => {
    // Id da câmera a ser editada
    const id = req.params.id;

    Firebird.attach(options, (err, db) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao conectar ao banco de dados');
        }

        // Consulta para carregar informações da câmera a ser editada
        db.query('SELECT * FROM LPR_MT_CAMERAS WHERE ID = ?', [id], (err, result) => {
            if (err) {
                console.error(err);
                db.detach();
                return res.status(500).send('Erro ao executar a consulta');
            }

            // Renderiza a página de edição da câmera, passando as informações da câmera como parâmetro
            db.detach();
            res.render('Cameras/editar-camera', { camera: result[0] });
            console.log(result[0].ID)
        });
    });
});

// Rota para processar a edição das informações da câmera
router.post('/:id/editar', (req, res) => {
    const id = req.params.id;
    const { local, ip, porta_api, modelo, direcao, id_area, desc_area, inativa, login, senha, porta_http } = req.body;

    Firebird.attach(options, (err, db) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao conectar ao banco de dados');
        }

        db.query(
            'UPDATE LPR_MT_CAMERAS SET LOCAL = ?, IP = ?, PORTA_API = ?, MODELO = ?, DIRECAO = ?, ID_AREA = ?, DESC_AREA = ?, INATIVA = ?, LOGIN = ?, SENHA = ?, PORTA_HTTP = ? WHERE ID = ?',
            [local, ip, porta_api, modelo, direcao, id_area, desc_area, inativa, login, senha, porta_http, id],
            (err, result) => {

                if (err) {
                    console.error(err);
                    db.detach();
                    return res.status(500).send('Erro ao atualizar a câmera');

                }
                db.detach();
                res.redirect('/');
            }
        );
    });
});

router.get('/:id/excluir', (req, res) => {
    const id = req.params.id;
    Firebird.attach(options, (err, db) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao conectar ao banco de dados');
        }

        db.query('SELECT * FROM LPR_MT_CAMERAS WHERE ID = ?', [id], (err, result) => {
            if (err) {
                console.error(err);
                db.detach();
                return res.status(500).send('Erro ao executar a consulta');
            }

            const camera = result[0];
            db.detach();
            res.render('Cameras/excluir-camera', { camera });
        });
    });
});

router.post('/:id/excluir', (req, res) => {
    const id = req.params.id;
    Firebird.attach(options, (err, db) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao conectar ao banco de dados');
        }

        db.query('DELETE FROM LPR_MT_CAMERAS WHERE ID = ?', [id], (err, result) => {
            if (err) {
                console.error(err);
                db.detach();
                return res.status(500).send('Erro ao executar a consulta');
            }

            db.detach();
            res.redirect('/');
        });
    });
});

router.get('/:id/acesso', (req, res) => {
    const id = req.params.id;
    Firebird.attach(options, (err, db) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao conectar ao banco de dados');
        }
        db.query("SELECT * FROM LPR_MT_CAMERAS WHERE ID=?", [id], (err, result) => {
            if (err) {
                console.error(err);
                db.detach();
                return res.status(500).send('Erro ao executar a consulta');

            }
            const cam_tec = result[0];
            const local_query = `${cam_tec.DESC_AREA} - ${cam_tec.LOCAL} - ${cam_tec.DIRECAO}`;

            db.query(`SELECT FIRST 100 * FROM LPR_MT_ACESSO WHERE LOCAL= '${local_query}' ORDER BY ID DESC`, (err, result) => {
                if (err) {
                    console.error(err);
                    db.detach();
                    return res.status(500).send('Erro ao executar a consulta');
                }
                //console.log(result[0])
                //console.log(result);
                const acessos = result;
                res.render('Cameras/acesso-camera', { acessos });
                console.log(acessos);
            });




            db.detach();

            return;

        });

    });


});

router.get('/:id/stream', function (req, res) {
    var cameraId = req.params.id;
    var rtspUrl = 'rtsp://admin:123456@192.168.0.145:554/profile2'//getRtspUrl(cameraId); // função que retorna a URL do stream RTSP
    res.render('Cameras/stream-camera', { rtspUrl: rtspUrl });
});

function getRtspUrl(id_cam) {
    Firebird.attach(options, (err, db) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao conectar ao banco de dados');
        }

        db.query('SELECT * FROM LPR_MT_CAMERAS WHERE ID=?', [id_cam], (err, result) => {
            if (err) {
                console.error(err);
                db.detach();
                return res.status(500).send('Erro ao executar a consulta');
            }

            const cameras = result[0];
            db.detach();
            let stringcon = `rtsp://${cameras.LOGIN}:${cameras.SENHA}@${cameras.IP}:554/profile2`;
            return stringcon;
        });
    });
}

module.exports = router;
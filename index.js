const express = require('express');
const Firebird = require('node-firebird');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser'); // Importar o body-parser
const { Console } = require('console');

const app = express();
const port = 3000;

// Configuração do Express
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', './views');

// Configuração do body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// Conexão com o banco de dados
const options = {
    database: 'C://AcessoLinear//Dados//BANCODEDADOS.FDB',
    user: 'SYSDBA',
    password: 'masterkey'
};
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/cameras', (req, res) => {
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
            res.render('cameras', { cameras });
            console.log(cameras[0].ID);
        });
    });
});

app.get('/cameras/nova', (req, res) => {
    res.render('nova-camera');
});

app.post('/cameras/nova', (req, res) => {
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
                res.redirect('/cameras');
            }
        );
    });
});

// Rota para carregar informações da câmera a ser editada
app.get('/cameras/:id/editar', (req, res) => {
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
            res.render('editar-camera', { camera: result[0] });
            console.log(result[0].ID)
        });
    });
});

// Rota para processar a edição das informações da câmera
app.put('/cameras/:id/editar', (req, res) => {
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
                res.redirect('/cameras');
            }
        );
    });
});

app.get('/cameras/:id/excluir', (req, res) => {
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
            res.render('excluir-camera', { camera });
        });
    });
});

app.post('/cameras/:id/excluir', (req, res) => {
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
            res.redirect('/cameras');
        });
    });
});

app.get('/cameras/:id/acesso', (req, res) => {
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

            db.query(`SELECT * FROM LPR_MT_ACESSO WHERE LOCAL= '${local_query}' ORDER BY ID DESC`, (err, result) => {
                if (err) {
                    console.error(err);
                    db.detach();
                    return res.status(500).send('Erro ao executar a consulta');
                }
                //console.log(result[0])
                //console.log(result);
                const acessos = result;
                res.render('acesso-camera', { acessos });
                console.log(acessos);
            });




            db.detach();

            return;

        });

    });


});


app.listen(port, () => {
    console.log(`VER AS CAMERAS http://localhost:${port}/cameras`);
    console.log(`ADICIONAR NOVA http://localhost:${port}/cameras/nova`)
});

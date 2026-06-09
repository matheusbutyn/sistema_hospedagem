const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcryptjs'); 

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || 'senha_utilizada', 
    database: process.env.DB_NAME || 'hospedagem',
    multipleStatements: true
});

app.post('/api/fazer-cadastro', (req, res) => {
    const {nome, email, senha, cep} = req.body;
    const comandoSelect = "SELECT * FROM Usuario WHERE email = ?";
    
    db.query(comandoSelect, [email], (err, resultados) => {
        if (err) return res.status(500).send("Erro interno no servidor");
        
        if (resultados.length > 0) return res.status(409).send(
            "Já existe uma conta registrada com esse e-mail.");

        const salt = bcrypt.genSaltSync(10);
        const senha_cripto = bcrypt.hashSync(senha, salt);

        const comando = "INSERT INTO Usuario (nome, email, senha, cep) VALUES (?, ?, ?, ?)";
        
        db.query(comando, [nome, email, senha_cripto, cep], (err_insert, resultados) => {
            if (err_insert) return res.status(500).send("Erro ao salvar no banco de dados");
            res.status(201).send("Conta criada com sucesso!");
        });
    });
});

app.post('/api/fazer-login', (req, res) => {
    const {email, senha} = req.body;
    const comando = "SELECT * FROM Usuario WHERE email = ?";
    
    db.query(comando, [email], (err, resultados) => {
        if (err) return res.status(500).send("Erro interno no servidor");
        if (resultados.length === 0) return res.status(404).send("Usuário não encontrado!");

        const usuario = resultados[0];
        const validacao = bcrypt.compareSync(senha, usuario.senha);

        if(validacao){
            res.status(200).json({ 
                mensagem: "Login autorizado!", 
                nome: usuario.nome 
            });
        }
        else{
            res.status(401).send("Senha incorreta!");
        }
    });
});

app.post('/api/fazer-reserva', (req, res) => {
    const {email, quarto, data_ini, data_fim, qtd} = req.body;
    const comando_fk = "SELECT cod_user FROM Usuario WHERE email = ?";
    
    db.query(comando_fk, [email], (err, resultados) => {
        if (err) return res.status(500).send("Erro interno no servidor ao buscar usuário");
        if (resultados.length === 0) return res.status(404).send("Usuário da reserva não encontrado!");

        const cod_user = resultados[0].cod_user;

        const comando = `
            INSERT INTO Reserva (quarto, data_entrada, data_saida, qtd_pessoas, cod_user) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        db.query(comando, [quarto, data_ini, data_fim, qtd, cod_user], (err, resultado) => {
            if (err) {
                return res.status(500).send("Erro ao salvar a reserva no banco de dados");
            }
            res.status(201).send("Reserva realizada com sucesso!");
        });
    });
});

app.get('/api/listar-reservas', (req, res) => {
    const email = req.query.email;

    const comando = `
        SELECT r.cod_reser, r.quarto, r.data_entrada, r.data_saida, r.qtd_pessoas
        FROM Reserva r
        JOIN Usuario u ON r.cod_user = u.cod_user
        WHERE u.email = ?
    `;

    db.query(comando, [email], (err, resultados) => {
        if (err) {
            return res.status(500).send("Erro ao buscar reservas no banco.");
        }
        res.status(200).json(resultados);
    });
});

app.delete('/api/excluir-reserva/:id', (req, res) => {
    const id_reserva = req.params.id; 
    const comando = "DELETE FROM Reserva WHERE cod_reser = ?";

    db.query(comando, [id_reserva], (err, resultados) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Erro interno ao tentar excluir");
        }        
        res.status(200).send("Reserva excluída!");
    });
});

const PORTA = process.env.PORT || 3000; 

app.listen(PORTA, () => {
    console.log(`Servidor rodando na porta ${PORTA}`);
});

module.exports = app;
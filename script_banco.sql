CREATE DATABASE IF NOT EXISTS hospedagem;
USE hospedagem;
CREATE TABLE IF NOT EXISTS Usuario (
    cod_user INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    senha VARCHAR(100),
    cep VARCHAR(20)
);    
CREATE TABLE IF NOT EXISTS Reserva (
    cod_reser INT AUTO_INCREMENT PRIMARY KEY,
    quarto VARCHAR(100),
    data_entrada DATE,
    data_saida DATE,
    qtd_pessoas INT,
    cod_user INT NOT NULL,
    CONSTRAINT fk_reser_usuario FOREIGN KEY (cod_user) REFERENCES Usuario (cod_user)
);
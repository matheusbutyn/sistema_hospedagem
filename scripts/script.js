let tela_atual = document.querySelector(".tela_inicial");

let quartos = [document.querySelector('.qrt1 img'), document.querySelector('.qrt2 img'),
            document.querySelector('.qrt3 img'), document.querySelector('.qrt4 img')];
let nomes_qrt = ["Standard", "Superior", "Premium", "Luxo"];
let precos_qrt = {
    "Standard": 180.00,
    "Superior": 280.00,
    "Premium": 450.00,
    "Luxo": 750.00
}
let nome = document.querySelector('.tipo_qrt');

for(let i=0; i<4; i++){
    quartos[i].addEventListener('mouseover', function(evento){
        nome.innerHTML = nomes_qrt[i];
        quartos[i].style.border = '0.3vw solid white';
        quartos[i].style.transition = '0.3s';
    });
    quartos[i].addEventListener('mouseout', function(evento){
        nome.innerText = '';
        quartos[i].style.border = '';
    });
}

function trocarTela(elemento){
    tela_atual.style.display = 'none';
    tela_atual = document.querySelector(elemento);
    tela_atual.style.display = 'block';
}

function mostrarTelaIni(){
    trocarTela(".tela_inicial");
    document.querySelector('.form_cadastro .rua').innerHTML = `<p></p>`;
    document.querySelector('.form_cadastro .bairro').innerHTML = `<p></p>`;
    document.querySelector('.form_cadastro .cidade').innerHTML = `<p></p>`;
    document.querySelector(".form_reserva .total").innerHTML = `<p>Total: R$ 0,00</p>`;
    document.querySelector(".reservas_encon").innerHTML = '';
}

function mostrarLogin(){
    trocarTela(".form_login");
}

function fazerLogin(evento){
    evento.preventDefault();

    const email = document.querySelector('.form_login #email').value;
    const senha = document.querySelector('.form_login #senha').value;
    const dados = {email, senha};   

    fetch('/api/fazer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(resposta => {
        if (resposta.ok) {
            resposta.json().then(info_server => {
                localStorage.setItem('nome_user', info_server.nome);
                localStorage.setItem('email', email);
                document.querySelector('.form_login #email').value = '';
                document.querySelector('.form_login #senha').value = '';
                mostrarMenuLogado();
            })
        } 
        else {
            resposta.text().then(erro => {
            alert(erro); 
            });
        }
    })
    .catch(erro => {
        alert("Erro ao conectar com o servidor. Tente novamente mais tarde.");
    });
}

function mostrarMenuLogado(){
    trocarTela(".form_reserva");
    document.querySelector(".form_reserva .user_info h1").innerHTML = `Olá, ${localStorage.getItem('nome_user')}`
    document.querySelector(".form_reserva .img_selec").innerHTML = `<img class="img_qrt" src="images/standard.png">`;
    document.querySelector(".form_reserva .total").innerHTML = `<p>Total: R$ 0,00</p>`;
    document.querySelector(".reservas_encon").innerHTML = '';
}

function listarReservas(){
    trocarTela(".lista_reservas");
    const nome = localStorage.getItem('nome_user');
    const email = localStorage.getItem('email');
    document.querySelector(".lista_reservas .user_info h1").innerHTML = `Olá, ${nome}`;
    let reservas = document.querySelector(".reservas_encon");
    reservas.innerHTML = "";

    fetch(`/api/listar-reservas?email=${email}`)
    .then(resposta => {
        if (!resposta.ok) throw new Error("Erro na requisição");
        return resposta.json();
    })
    .then(lista_reservas => {
        if (lista_reservas.length === 0) {
            reservas.innerHTML = `<p class="aviso">Você ainda não possui nenhuma reserva agendada.</p>`;
            return;
        }

        lista_reservas.forEach(reserva => {
            const data_ini = new Date(reserva.data_entrada);
            const data_fim = new Date(reserva.data_saida);
            const quarto = reserva.quarto;
            const qtd = reserva.qtd_pessoas;

            const diarias = (data_fim-data_ini)/(1000*60*60*24);
            const total = precos_qrt[quarto]*diarias*qtd;

            reservas.innerHTML += `
                <div class="reserva">
                    <div class="atributo"><p>Tipo do Quarto:</p><p>${quarto}</p></div>
                    <div class="atributo"><p>Data de Entrada:</p><p>${data_ini.toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p></div>
                    <div class="atributo"><p>Data de Saída:</p><p>${data_fim.toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p></div>
                    <div class="atributo"><p>Quantidade de pessoas:</p><p>${qtd}</p></div>
                    <div class="atributo"><p>Total da Reserva:</p><p>${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
                    <button onclick="excluirReserva(${reserva.cod_reser})">CANCELAR RESERVA</button>
                </div>
            `;
        });
    })
    .catch(erro => {
        reservas.innerHTML = `<p class="aviso">Não foi possível carregar suas reservas no momento.</p>`;
    });
}

function fazerReserva(evento){
    evento.preventDefault();
    const quarto = document.querySelector('.form_reserva #quarto').value; 
    const data_ini = document.querySelector('.form_reserva #data_ini').value;
    const data_fim = document.querySelector('.form_reserva #data_fim').value;
    const qtd = document.querySelector('.form_reserva #qtd').value;
    const email = localStorage.getItem('email');

    if(new Date(data_ini) - new Date(data_fim) >= 0){
        alert('A data de saída deve ser posterior a data de entrada.');
        return;
    }

    const dados = {email, quarto, data_ini, data_fim, qtd};
    fetch('/api/fazer-reserva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(resposta => {
        if (resposta.ok) {
            const form = document.querySelector('.form_reserva');
            form.reset();
            document.querySelector(".form_reserva .img_selec").innerHTML = `<img class="img_qrt" src="images/standard.png">`;
            document.querySelector(".form_reserva .total").innerHTML = `<p>Total: R$ 0,00</p>`;
            alert("Reserva efetuada com sucesso!");
        } 
        else {
            resposta.text().then(erro => {
            alert(erro); 
            });
        }
    })
    .catch(erro => {
        alert("Erro ao conectar com o servidor. Tente novamente mais tarde");
    });
}

let data_ini_selec = document.querySelector('#data_ini');
let data_fim_selec = document.querySelector('#data_fim');
let qrt_selec = document.querySelector('#quarto');
let qtd_selec = document.querySelector('#qtd');
qrt_selec.addEventListener('change', atualizarValor);
data_ini_selec.addEventListener('change', atualizarValor);
data_fim_selec.addEventListener('change', atualizarValor);
qtd_selec.addEventListener('change', atualizarValor);

function atualizarValor() {
    const quarto = qrt_selec.value;
    const data_ini = data_ini_selec.value;
    const data_fim = data_fim_selec.value;
    const qtd = qtd_selec.value;
    const total = document.querySelector(".total");

    if (quarto && data_ini && data_fim) {
        const data_ent = new Date(data_ini);
        const data_sai = new Date(data_fim);
        
        const diarias = (data_sai-data_ent)/(1000*60*60*24);
        const valor = precos_qrt[quarto]*diarias*qtd;

        if (data_sai-data_ent > 0) {
            total.innerHTML = `<p>Total: ${valor.toLocaleString('pt-BR', {style:'currency',currency:'BRL'})}</p>`;
        } else {
            total.innerHTML = `<p>Total: R$ 0,00</p>`;
        }
    }
}

function mostrarCadastro(){
    trocarTela(".form_cadastro");
}

function fazerCadastro(evento){
    evento.preventDefault(); 

    const nome = document.querySelector('.form_cadastro #nome').value;
    const email = document.querySelector('.form_cadastro #email').value;
    const senha = document.querySelector('.form_cadastro #senha').value;
    const cep = document.querySelector('.form_cadastro #cep').value;
    const dados = {nome, email, senha, cep};    
    
    fetch('/api/fazer-cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(resposta => {
        if (resposta.ok) {
            localStorage.setItem('nome_user', nome);
            localStorage.setItem('email', email);
            document.querySelector('.form_cadastro #nome').value = '';
            document.querySelector('.form_cadastro #email').value = '';
            document.querySelector('.form_cadastro #senha').value = '';
            document.querySelector('.form_cadastro #cep').value = '';
            mostrarMenuLogado();
        } 
        else {
            resposta.text().then(erro => {
            alert(erro); 
            });
        }
    })
    .catch(erro => {
        alert("Erro ao conectar com o servidor. Tente novamente mais tarde");
    });
}

function buscarEndereco() {
        let cep = document.querySelector('#cep').value.replace(/\D/g, '');
        if (cep.length !== 8) {
            alert("CEP inválido.");
            return;
        }
        if (cep !== "") {
            let url = `https://viacep.com.br/ws/${cep}/json/`;

            fetch(url)
            .then(response => response.json())
            .then(data => {
                if (!("erro" in data)) {
                    document.querySelector('.rua').innerHTML = `<p>${data.logradouro}</p>`;
                    document.querySelector('.bairro').innerHTML = `<p>${data.bairro}</p>`;
                    document.querySelector('.cidade').innerHTML = `<p>${data.localidade} - ${data.uf}</p>`;
                } else {
                    alert("CEP não encontrado.");
                }
            });
        }
}

function trocarQuarto(){
    const imagem_atual = document.querySelector(".form_reserva #quarto").value;
    const imagem_selec = imagem_atual.charAt(0).toLowerCase() + imagem_atual.slice(1);
    document.querySelector(".img_selec").innerHTML = `<img class="img_qrt" src="images/${imagem_selec}.png">`;
}

function fazerLogout(){
    localStorage.clear();
    mostrarTelaIni();
}

function excluirReserva(codigo_reserva){
    if (confirm("Tem certeza que deseja cancelar esta reserva?")) {
        
        fetch(`/api/excluir-reserva/${codigo_reserva}`, {
            method: 'DELETE'
        })
        .then(resposta => {
            if (resposta.ok) {
                alert("Reserva cancelada com sucesso!");
                listarReservas(); 
            } else {
                alert("Erro ao excluir a reserva.");
            }
        })
        .catch(erro => {
            console.error(erro);
            alert("Falha na comunicação com o servidor.");
        });
    }
}
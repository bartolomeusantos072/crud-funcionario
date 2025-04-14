// Inicializa o banco de dados
const request = indexedDB.open("FuncionariosDB", 1);//abertura(open) da versao 1 do banco dados funcionáriosDB do indexedDB 

request.onupgradeneeded = function (event) { //onupgradeneeded - envento de atualizao, serve para atualizar versões
    let db = event.target.result; // retorna o objeto IDBDatabase do banco de dados que está sendo criado ou atualizado.
    let store = db.createObjectStore("funcionarios", { keyPath: "id", autoIncrement: true }); //cria um espaço onde os dados são armazenados.
    //store.createIndex() cria um índice no object store. Índices são usados para otimizar a pesquisa de registros.
    store.createIndex("nome", "nome", { unique: false });
    store.createIndex("cpf", "cpf", { unique: true });
    store.createIndex("email", "email", { unique: true });
    store.createIndex("telefone","telefone",{unique:true});
    store.createIndex("cargo","cargo",{unique:false});
};


request.onsuccess = function (event) { // evento que é executado quando a operação foi concluída com sucesso
    console.log("Banco de dados carregado com sucesso!");
    listarFuncionarios(); // Garante que os dados sejam carregados ao iniciar
};

request.onerror = function (event) { // evento que é executado quando houve erro na operação 
    console.error("Erro ao abrir o IndexedDB:", event.target.error);
};

// Função auxiliar para verificar se o banco de dados foi carregado corretamente
function verificarDB() {
    if (!request.result) {  //verifica se o banco esta disponivel caso não esteja retorna null
        console.error("O banco de dados não foi carregado corretamente.");
        return null;
    }
    return request.result;
}

// Captura o evento de envio do formulário
document.querySelector(".add_names").addEventListener("submit", function (event) {
    event.preventDefault();
    let funcionario = { // criando o objeto funcionario, as palavras seguidas de dois pontos são atributos
        nome: document.getElementById("nome").value,
        cpf: document.getElementById("cpf").value,
        email: document.getElementById("email").value,
        telefone: document.getElementById("telefone").value,
        data_nascimento: document.getElementById("data_nascimento").value,
        cargo: document.getElementById("cargo").value
    };

    adicionarFuncionario(funcionario);
});


// Função para listar funcionários com feedback visual
function listarFuncionarios() {
    let db = verificarDB();
    if (!db) {
        mostrarFeedback("Erro ao carregar banco de dados!", "error");
        return;
    }

    let transaction = db.transaction("funcionarios", "readonly"); //transacao readonly faz somente leitura
    let store = transaction.objectStore("funcionarios");

    let listaFuncionarios = document.querySelector(".your_dates"); // exibir lista no html
    listaFuncionarios.innerHTML = ""; // Limpa antes de exibir
    
    let cursorRequest = store.openCursor(); //é um jeito de percorrer todos os registros dentro da store "funcionarios".
    
    cursorRequest.onsuccess = function (event) { // lista executada com sucesso
        let cursor = event.target.result; //o curso aponta para cada registro
        if (cursor) { //se o registro existir
            let funcionario = cursor.value; // o curso busca as informações do funcionario
            listaFuncionarios.innerHTML += `<p>ID: ${funcionario.id} - Nome: ${funcionario.nome} - CPF: ${funcionario.cpf} </p>`;
            cursor.continue();
        } else {
            mostrarFeedback("Lista de funcionários carregada com sucesso!", "success");
        }
    };

    cursorRequest.onerror = function (event) { // erro ao listar funcionários
        console.error("Erro ao listar funcionários:", event.target.error);
        mostrarFeedback("Erro ao listar funcionários!", "error");
    };
}


// Função para adicionar um funcionário com feedback visual
function adicionarFuncionario(funcionario) {
    let db = verificarDB(); // let db chama a função verificarDB para ver o banco de dados
    if (!db) return;

    let transaction = db.transaction("funcionarios", "readwrite"); // reawrite gerencia o CRUD dos dados
    let store = transaction.objectStore("funcionarios"); // referencia de onde os dados serão armazenados
    
    let addRequest = store.add(funcionario); // adicionando funcionário  no store
    addRequest.onsuccess = function () {//funcionário adicionado com sucesso
        console.log("Funcionário adicionado com sucesso!"); 
        mostrarFeedback("Funcionário cadastrado com sucesso!", "success"); // Mostra feedback visual
        listarFuncionarios(); //executa a função listar funcionario
    };

    addRequest.onerror = function (event) {//erro ao adicionar funcionário
        console.error("Erro ao adicionar funcionário:", event.target.error);
        mostrarFeedback("Erro ao cadastrar funcionário!", "error"); // Exibe erro na interface
    };
}


// Função para atualizar um funcionário com feedback visual
function atualizarFuncionario(id, novosDados) {
    let db = verificarDB();
    if (!db) return;

    let transaction = db.transaction("funcionarios", "readwrite");
    let store = transaction.objectStore("funcionarios");

    let getRequest = store.get(id);
    getRequest.onsuccess = function () {
        let funcionario = getRequest.result;
        if (funcionario) {
            Object.assign(funcionario, novosDados); // Atualiza os dados do funcionário
            let updateRequest = store.put(funcionario);
            updateRequest.onsuccess = function () {
                console.log("Funcionário atualizado com sucesso!");
                mostrarFeedback("Dados atualizados com sucesso!", "success"); // Mostra feedback visual
                listarFuncionarios();
            };

            updateRequest.onerror = function (event) {
                console.error("Erro ao atualizar funcionário:", event.target.error);
                mostrarFeedback("Erro ao atualizar funcionário!", "error"); // Exibe erro na interface
            };
        }
    };

    getRequest.onerror = function (event) {
        console.error("Erro ao obter funcionário para atualização:", event.target.error);
        mostrarFeedback("Erro ao carregar funcionário para atualização!", "error"); // Feedback visual
    };
}


// Função para deletar um funcionário com feedback visual
function deletarFuncionario(id) {
    let db = verificarDB();
    if (!db) return;

    let transaction = db.transaction("funcionarios", "readwrite");
    let store = transaction.objectStore("funcionarios");

    let deleteRequest = store.delete(id);
    deleteRequest.onsuccess = function () {
        console.log("Funcionário deletado com sucesso!");
        mostrarFeedback("Funcionário removido com sucesso!", "success"); // Exibe feedback visual
        listarFuncionarios(); // Atualiza a lista após remoção
    };

    deleteRequest.onerror = function (event) {
        console.error("Erro ao deletar funcionário:", event.target.error);
        mostrarFeedback("Erro ao remover funcionário!", "error"); // Mostra mensagem de erro
    };
}



// Mostrar feedback
function mostrarFeedback(mensagem, tipo) {
    let feedback = document.getElementById("feedback-msg");
    feedback.textContent = mensagem;
    feedback.className = `feedback ${tipo}`; // Aplica classe de sucesso ou erro
    feedback.style.display = "block";

    setTimeout(() => {
        feedback.style.display = "none"; // Oculta após 3 segundos
    }, 3000);
}



// Chamada inicial para listar funcionários ao carregar a página
window.onload = listarFuncionarios;

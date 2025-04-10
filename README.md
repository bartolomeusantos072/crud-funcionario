---

### 📌 **Introdução ao IndexedDB**

IndexedDB é uma API de armazenamento de banco de dados NoSQL dentro do navegador, permitindo o armazenamento de grandes quantidades de dados estruturados, incluindo objetos JavaScript. Ele é assíncrono e baseado em transações, o que garante segurança e eficiência ao acessar dados.

### 🔹 **Principais métodos do IndexedDB**

1. `indexedDB.open(nome, versão)` → Abre ou cria um banco de dados.
2. `createObjectStore(nome, opções)` → Cria uma "tabela" (object store) dentro do banco de dados.
3. `transaction(nome, modo)` → Inicia uma transação (modo: "readonly" ou "readwrite").
4. `store.add(objeto)` → Adiciona um novo registro ao object store.
5. `store.get(chave)` → Obtém um item pelo seu identificador.
6. `store.put(objeto)` → Atualiza um item existente.
7. `store.delete(chave)` → Remove um item.
8. `store.openCursor()` → Percorre os registros no banco.

---

### 🚀 **Passo 1: Criando o Banco de Dados e Object Store**

Para iniciar, criamos e configuramos um banco chamado `"FuncionariosDB"` e definimos um object store `"funcionarios"` com um campo `id` autoincrementável.

```jsx
const request = indexedDB.open("FuncionariosDB", 1);

request.onupgradeneeded = function (event) {
    let db = event.target.result;
    let store = db.createObjectStore("funcionarios", { keyPath: "id", autoIncrement: true });

    store.createIndex("nome", "nome", { unique: false });
    store.createIndex("cpf", "cpf", { unique: true });
    store.createIndex("email", "email", { unique: true });
};

```

---

### 📥 **Passo 2: Adicionando Funcionários**

```jsx
function adicionarFuncionario(funcionario) {
    let db = request.result;
    let transaction = db.transaction("funcionarios", "readwrite");
    let store = transaction.objectStore("funcionarios");

    let addRequest = store.add(funcionario);
    addRequest.onsuccess = () => console.log("Funcionário cadastrado com sucesso!");
}

```

---

### 🔍 **Passo 3: Listando Funcionários**

```jsx
function listarFuncionarios() {
    let db = request.result;
    let transaction = db.transaction("funcionarios", "readonly");
    let store = transaction.objectStore("funcionarios");

    let cursorRequest = store.openCursor();
    cursorRequest.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            console.log(`ID: ${cursor.value.id} - Nome: ${cursor.value.nome}`);
            cursor.continue();
        }
    };
}

```

---

### ✏ **Passo 4: Atualizando Funcionário**

```jsx
function atualizarFuncionario(id, novosDados) {
    let db = request.result;
    let transaction = db.transaction("funcionarios", "readwrite");
    let store = transaction.objectStore("funcionarios");

    let getRequest = store.get(id);
    getRequest.onsuccess = function () {
        let funcionario = getRequest.result;
        Object.assign(funcionario, novosDados);
        store.put(funcionario);
    };
}

```

---

### 🗑 **Passo 5: Removendo Funcionário**

```jsx
function deletarFuncionario(id) {
    let db = request.result;
    let transaction = db.transaction("funcionarios", "readwrite");
    let store = transaction.objectStore("funcionarios");

    store.delete(id);
}

```

---

### 📌 **Passo 6: Verificando o Banco de Dados**

---

Antes de realizar operações no IndexedDB, é importante garantir que o banco de dados foi carregado corretamente.

```jsx
function verificarDB() {
    if (!request.result) {
        console.error("O banco de dados não foi carregado corretamente.");
        return null;
    }
    return request.result;
}

```

Essa função verifica se o banco está acessível antes de iniciar operações de leitura ou escrita.

---

## 📌 **Passo 7: Capturar Dados do Formulário**

O código abaixo captura os dados do formulário quando o usuário submete um novo funcionário:

```jsx
document.querySelector(".add_names").addEventListener("submit", function (event) {
    event.preventDefault(); // Evita o recarregamento da página

    let funcionario = {
        nome: document.getElementById("nome").value,
        cpf: document.getElementById("cpf").value,
        email: document.getElementById("email").value,
        telefone: document.getElementById("telefone").value,
        data_nascimento: document.getElementById("data_nascimento").value,
        cargo: document.getElementById("cargo").value
    };

    adicionarFuncionario(funcionario);
});

```

Aqui, coletamos os valores dos campos do formulário e chamamos a função `adicionarFuncionario()` para salvar os dados no banco de dados.

---

## 📌 **Passo 8: Exibir Funcionários na Interface**

Para mostrar os funcionários na tela de maneira organizada:

```jsx
function listarFuncionarios() {
    let db = verificarDB();
    if (!db) return;

    let transaction = db.transaction("funcionarios", "readonly");
    let store = transaction.objectStore("funcionarios");

    let listaFuncionarios = document.querySelector(".your_dates");
    listaFuncionarios.innerHTML = ""; // Limpa antes de exibir

    let cursorRequest = store.openCursor();
    cursorRequest.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            let funcionario = cursor.value;
            listaFuncionarios.innerHTML += `<p>ID: ${funcionario.id} - Nome: ${funcionario.nome} - CPF: ${funcionario.cpf}</p>`;
            cursor.continue();
        }
    };
}

```

Esse código percorre os dados no IndexedDB e exibe cada funcionário na página.

---

## 📌 **Passo 9: Adicionar Feedback Visual**

Para melhorar a experiência do usuário, adicionamos mensagens de confirmação ou erro:

```jsx
function mostrarFeedback(mensagem, tipo) {
    let feedback = document.getElementById("feedback-msg");
    feedback.textContent = mensagem;
    feedback.className = `feedback ${tipo}`; // Adiciona classe CSS para estilo
    feedback.style.display = "block";

    setTimeout(() => {
        feedback.style.display = "none"; // Oculta após 3 segundos
    }, 3000);
}

```

Agora, toda ação no CRUD mostrará um feedback na interface.

---

## 📌 **Passo 10: Inicializar ao Carregar a Página**

Chamamos a função `listarFuncionarios()` quando a página carrega para garantir que os dados sejam exibidos.

```jsx
window.onload = listarFuncionarios;

```

---

## ✅ **Conclusão**

Com essas implementações, seu CRUD no IndexedDB agora está totalmente funcional! 🚀 Você tem:
✔ Um banco de dados estruturado
✔ Métodos para adicionar, listar, atualizar e deletar registros
✔ Mensagens de feedback para o usuário
✔ Integração com um formulário

Caso queira expandir, podemos adicionar filtros de pesquisa, ordenação de dados ou exportação para JSON. 

O IndexedDB é excelente para armazenamento local no navegador, mas ele tem limitações quando o volume de dados cresce ou quando você precisa compartilhar informações entre diferentes dispositivos. Para resolver isso, normalmente se usa uma **API** que conecta IndexedDB a um banco de dados externo.

### 🔹 **Quando usar uma API para integrar IndexedDB**

- **Sincronização de dados:** Se vários usuários precisam acessar os mesmos dados de diferentes dispositivos.
- **Backup e persistência:** IndexedDB é baseado no navegador, então os dados podem ser perdidos se o usuário limpar o cache.
- **Consultas mais complexas:** Bancos como PostgreSQL, MySQL ou MongoDB oferecem recursos avançados de filtragem e agregação que IndexedDB não tem.
- **Segurança avançada:** IndexedDB não é ideal para armazenar dados sensíveis, já que é acessível via JavaScript no cliente.

### 🚀 **Como integrar IndexedDB a um banco de dados externo**

1️⃣ **Criar uma API (REST ou GraphQL) no backend** → Usar Node.js, Python (Django, Flask) ou outra tecnologia para expor um serviço.
2️⃣ **Comunicar IndexedDB com a API** → O IndexedDB pode enviar e receber dados via `fetch()`.
3️⃣ **Sincronizar os dados** → Criar um mecanismo para verificar se há novas informações no banco externo e atualizar IndexedDB localmente.
4️⃣ **Usar IndexedDB como cache** → Melhorar a performance reduzindo chamadas à API e armazenando temporariamente os dados no IndexedDB.

Se precisar de um exemplo mais detalhado, posso te ajudar a construir um modelo de API para sincronizar com IndexedDB! 🔥

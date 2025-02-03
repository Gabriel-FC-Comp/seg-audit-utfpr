// Acessando o formulário e o input de arquivo
const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("file");

// Controla a exibição do nome do arquivo selecionado para o usuário
fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0]; // Obtém o arquivo selecionado
    if (file) {
        document.getElementById('fileName').textContent = `Arquivo selecionado: ${file.name}`;
    } else {
        document.getElementById('fileName').textContent = '';
    }
});

// Controla o envio do formulário com o arquivo para o servidor
form.addEventListener("submit", function (event) {
    event.preventDefault(); // Previne o envio do formulário para poder processá-lo via JavaScript

    const file = fileInput.files[0];  // Captura o arquivo selecionado

    // Verifique se um arquivo foi selecionado
    if (file) {
        sendCryptedFile(file); // Encripta o arquivo para envio
    } else {
        alert("Nenhum arquivo selecionado.");
    }
});
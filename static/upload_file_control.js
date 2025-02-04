/**
 * Módulo para gerenciamento de upload de arquivos criptografados.
 * 
 * Autores: Daniel S. G. da Costa, Gabriel F. Conte e Vitor L. Q. Batista
 * 
 * Este módulo lida com o processo de seleção e envio de arquivos criptografados
 * para o servidor. Ele calcula o hash do arquivo, criptografa o arquivo e seu hash,
 * e os envia para o servidor usando AJAX. Além disso, ele gerencia a exibição do nome 
 * do arquivo selecionado pelo usuário.
 *
 * Variáveis:
 * -----------
 * @constant {HTMLFormElement} form - Formulário HTML que contém o campo para upload do arquivo.
 * @constant {HTMLInputElement} fileInput - Input HTML que permite ao usuário selecionar um arquivo.
 * @constant {HTMLElement} fileInputName - Elemento HTML onde será exibido o nome do arquivo selecionado.
 * 
 * Funções:
 * --------
 * @function sendCryptedFile - Função responsável por calcular o hash do arquivo, criptografá-lo e enviá-lo para o servidor.
 * @function form.addEventListener - Função que lida com o envio do formulário, acionando o envio do arquivo criptografado.
 */

// Busca elementos HTML
const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("file");
const fileInputName = document.getElementById('fileName');

// Controla a exibição do nome do arquivo selecionado para o usuário
fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0]; // Obtém o arquivo selecionado
    if (file) {
        fileInputName.textContent = `Arquivo selecionado: ${file.name}`;
    } else {
        fileInputName.textContent = 'Arquivo selecionado:';
    }
});

/**
 * Envia um arquivo criptografado junto com seu hash para o servidor.
 *
 * Esta função calcula o hash do arquivo, criptografa o arquivo e o hash, e então envia 
 * esses dados para o servidor usando uma requisição AJAX.
 * 
 * @async
 * @function sendCryptedFile
 * @param {File} file - O arquivo que será enviado para o servidor.
 * 
 * @throws {Error} Se houver falha no cálculo do hash ou na criptografia do arquivo.
 */
async function sendCryptedFile(file) {
    try {
        // Espera o hash ser calculado
        const file_hash = await calcFileHash(file); 

        // Espera criptografar o arquivo e o hash
        const encryptedFile = await encryptFile(file, Secret_Key); 
        const encrypted_hash = encryptText(file_hash, Secret_Key);

        // Formatando os dados para envio AJAX
        const formData = new FormData();
        formData.append("file", file);
        formData.append("hash", file_hash);
        formData.append("e_hash", encrypted_hash);
        formData.append("e_file", encryptedFile);
    
        // Enviando o arquivo e hash para o servidor Flask
        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                console.log('Arquivo enviado com sucesso!', data);
                alert('Arquivo enviado com sucesso!', data);
                // Limpa o input de arquivo
                fileInput.value = "";
                fileInputName.textContent = 'Arquivo selecionado:';
            })
            .catch(error => {
                console.error('Erro ao enviar arquivo:', error);
                alert('Erro ao enviar arquivo:', error);
            });
    } catch (error) {
        console.error("Erro ao calcular o hash: ", error);
        alert("Erro ao calcular o hash: ", error);
        throw error;
    }
}

/**
 * Controla o envio do formulário com o arquivo para o servidor.
 * 
 * Este evento é acionado ao submeter o formulário, impedindo o envio padrão e 
 * chamando a função para enviar o arquivo criptografado.
 * 
 * @param {Event} event - O evento de submit do formulário.
 */
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

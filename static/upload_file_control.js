// Acessando o formulário e o input de arquivo
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

// Função para encriptar e enviar um arquivo e seu hash par o servidor
async function sendCryptedFile(file) {
    try {
        // Espera o hash ser calculado
        const file_hash = await calcFileHash(file); 

        // Espera criptografar o arquivo
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
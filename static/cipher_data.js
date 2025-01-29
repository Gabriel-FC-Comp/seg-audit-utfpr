// Acessando o formulário e o input de arquivo
const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("file");

function getHash(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const fileBuffer = e.target.result;
        const wordArray = CryptoJS.lib.WordArray.create(fileBuffer);
        const hash = CryptoJS.SHA512(wordArray).toString(CryptoJS.enc.Hex);
        
        console.log("SHA-512 Hash: " + hash);
        return hash
    };

    // Lê o arquivo como ArrayBuffer
    reader.readAsArrayBuffer(file);
}

function encrypt(text, key) {
    const iv = CryptoJS.lib.WordArray.random(16); // IV aleatório de 16 bytes

    const encrypted = CryptoJS.AES.encrypt(text, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    // Concatenamos IV + Texto Criptografado e codificamos em Base64
    const result = CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));
    return result;
}

// Evento para capturar o arquivo antes de enviar
form.addEventListener("submit", function(event) {
    event.preventDefault(); // Previne o envio do formulário para poder processá-lo via JavaScript

    const file = fileInput.files[0];  // Captura o arquivo selecionado

    const file_hash = getHash(file);

    const message = "Olá Mundo";

    const crypted_message = encrypt(message,Secret_Key);
    console.log("Decript");
    console.log(message);
    console.log(crypted_message);

    // Verifique se um arquivo foi selecionado
    if (file) {
        console.log("Arquivo selecionado:", file.name);

        // Caso queira enviar o arquivo via AJAX, use FormData
        const formData = new FormData();
        formData.append("file", file);
        formData.append("test", crypted_message);

        // Agora você pode enviar o arquivo para o Flask via fetch (ou Ajax)
        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())  // Supondo que o servidor retorne JSON
        .then(data => {
            console.log('Arquivo enviado com sucesso!', data);
        })
        .catch(error => {
            console.error('Erro ao enviar arquivo:', error);
        });
    } else {
        console.log("Nenhum arquivo selecionado.");
    }
});
// Acessando o formulário e o input de arquivo
const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("file");

function calcFileHash(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                const fileBuffer = e.target.result;
                const wordArray = CryptoJS.lib.WordArray.create(fileBuffer);
                const hash = CryptoJS.SHA512(wordArray).toString(CryptoJS.enc.Hex);
                // console.log("SHA512: ", hash);
                resolve(hash);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = function (error) {
            reject(error);
        };

        // Lê o arquivo como ArrayBuffer
        reader.readAsArrayBuffer(file);
    });
}

function encryptText(text, key) {
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

async function sendCryptedFile(file) {
    try {
        const file_hash = await calcFileHash(file); // Espera o hash ser calculado
        console.log("Encriptando File_Hash: ", file_hash);
        const crypted_hash = encryptText(file_hash, Secret_Key);
    
        // Caso queira enviar o arquivo via AJAX, use FormData
        const formData = new FormData();
        formData.append("file", file);
        formData.append("test", crypted_hash);
    
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
    } catch (error) {
        console.error("Erro ao calcular o hash: ", error);
        throw error; // Propaga o erro para quem chamou a função
    }
}

// Evento para capturar o arquivo antes de enviar
form.addEventListener("submit", function (event) {
    event.preventDefault(); // Previne o envio do formulário para poder processá-lo via JavaScript

    const file = fileInput.files[0];  // Captura o arquivo selecionado

    // Verifique se um arquivo foi selecionado
    if (file) {
        sendCryptedFile(file);
    } else {
        console.log("Nenhum arquivo selecionado.");
    }
});
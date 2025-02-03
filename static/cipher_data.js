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

function encryptFile(file, key) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                const iv = CryptoJS.lib.WordArray.random(16); // IV aleatório de 16 bytes
                const fileData = new Uint8Array(e.target.result); // Converte o ArrayBuffer para Uint8Array
                const wordArray = CryptoJS.lib.WordArray.create(fileData); // Converte para WordArray

                // Criptografa o arquivo
                const encrypted = CryptoJS.AES.encrypt(wordArray, key, {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                });

                // Concatena IV + Texto Criptografado e codifica em Base64
                const result = CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));

                // Cria um Blob com o resultado criptografado
                const encryptedBlob = new Blob([result], { type: "application/octet-stream" });

                // Retorna o Blob criptografado
                resolve(encryptedBlob);
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

async function sendCryptedFile(file) {
    try {
        const file_hash = await calcFileHash(file); // Espera o hash ser calculado

        const encryptedFile = await encryptFile(file, Secret_Key); // Espera criptografar o arquivo

        console.log("Encriptando File_Hash: ", file_hash);
        const encrypted_hash = encryptText(file_hash, Secret_Key);
        console.log("File: ", encryptedFile);

        // Caso queira enviar o arquivo via AJAX, use FormData
        const formData = new FormData();
        formData.append("file", file);
        formData.append("hash", file_hash);
        formData.append("e_hash", encrypted_hash);
        formData.append("e_file", encryptedFile);
    
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
        alert("Nenhum arquivo selecionado.");
    }
});
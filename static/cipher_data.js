// Função para calcular o Hash SHA512 de um arquivo
function calcFileHash(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                const fileBuffer = e.target.result;
                const wordArray = CryptoJS.lib.WordArray.create(fileBuffer);
                const hash = CryptoJS.SHA512(wordArray).toString(CryptoJS.enc.Hex);
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

// Função para encriptar uma string usando AES CBC
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

// Função para encriptar um arquivo, considerando sua forma binária, usando AES CBC
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
            })
            .catch(error => {
                console.error('Erro ao enviar arquivo:', error);
            });
    } catch (error) {
        console.error("Erro ao calcular o hash: ", error);
        throw error;
    }
}
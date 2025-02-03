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
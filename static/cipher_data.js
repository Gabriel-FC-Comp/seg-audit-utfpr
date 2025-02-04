/**
 * Módulo de criptografia e cálculo de hash.
 * 
 * Autores: Daniel S. G. da Costa, Gabriel F. Conte e Vitor L. Q. Batista
 * 
 * Este módulo contém funções para calcular o hash de um arquivo utilizando SHA512,
 * criptografar textos e arquivos utilizando AES em modo CBC, e manipular os dados binários
 * durante o processo de criptografia. Ele utiliza a biblioteca CryptoJS para as operações de criptografia.
 *
 * Funções:
 * --------
 * @function calcFileHash - Calcula o hash SHA512 de um arquivo.
 * @function encryptText - Criptografa uma string utilizando AES com modo CBC.
 * @function encryptFile - Criptografa um arquivo utilizando AES com modo CBC.
 */

/**
 * Calcula o Hash SHA512 de um arquivo.
 * 
 * Esta função utiliza o FileReader para ler o conteúdo de um arquivo e, em seguida, calcula 
 * o hash SHA512 do conteúdo utilizando a biblioteca CryptoJS.
 * 
 * @async
 * @function calcFileHash
 * @param {File} file - O arquivo cujo hash será calculado.
 * @returns {Promise<string>} - Retorna uma Promise que resolve para o hash SHA512 do arquivo.
 * 
 * @throws {Error} Se houver erro ao ler o arquivo ou calcular o hash.
 */
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

/**
 * Criptografa um texto utilizando AES em modo CBC.
 * 
 * Esta função criptografa uma string de texto utilizando a cifra AES no modo CBC, 
 * gerando um vetor de inicialização (IV) aleatório e aplicando padding PKCS7.
 * 
 * @param {string} text - O texto que será criptografado.
 * @param {string} key - A chave de criptografia para a operação AES.
 * @returns {string} - Retorna o texto criptografado em Base64 (IV + texto criptografado).
 */
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

/**
 * Criptografa um arquivo utilizando AES em modo CBC.
 * 
 * Esta função criptografa um arquivo binário utilizando a cifra AES no modo CBC, 
 * gerando um vetor de inicialização (IV) aleatório, concatenando o nome do arquivo
 * e o conteúdo do arquivo, e codificando o resultado em um formato binário (não Base64).
 * 
 * @async
 * @function encryptFile
 * @param {File} file - O arquivo que será criptografado.
 * @param {string} key - A chave de criptografia para a operação AES.
 * @returns {Promise<Blob>} - Retorna uma Promise que resolve para o arquivo criptografado (Blob).
 * 
 * @throws {Error} Se houver erro ao ler o arquivo ou criptografá-lo.
 */
function encryptFile(file, key) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                const iv = CryptoJS.lib.WordArray.random(16); // IV aleatório de 16 bytes
                const fileData = new Uint8Array(e.target.result); // Converte o ArrayBuffer para Uint8Array
                const filename = new TextEncoder().encode(file.name); // Converte o nome do arquivo para bytes
                const separator = new TextEncoder().encode("||"); // Delimitador para separar nome dos dados

                // Junta o nome do arquivo + delimitador + dados do arquivo
                const combinedData = new Uint8Array(filename.length + separator.length + fileData.length);
                combinedData.set(filename, 0);
                combinedData.set(separator, filename.length);
                combinedData.set(fileData, filename.length + separator.length);

                // Converte para WordArray para encriptar
                const wordArray = CryptoJS.lib.WordArray.create(combinedData);

                // Criptografa os dados
                const encrypted = CryptoJS.AES.encrypt(wordArray, key, {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                });

                // Concatena IV + dados criptografados
                const encryptedBytes = new Uint8Array(iv.words.length * 4 + encrypted.ciphertext.words.length * 4);
                encryptedBytes.set(new Uint8Array(iv.words.flatMap(word => [(word >> 24) & 0xFF, (word >> 16) & 0xFF, (word >> 8) & 0xFF, word & 0xFF])));
                encryptedBytes.set(new Uint8Array(encrypted.ciphertext.words.flatMap(word => [(word >> 24) & 0xFF, (word >> 16) & 0xFF, (word >> 8) & 0xFF, word & 0xFF])), iv.words.length * 4);

                // Cria um Blob binário (não Base64)
                const encryptedBlob = new Blob([encryptedBytes], { type: "application/octet-stream" });

                resolve(encryptedBlob);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = function (error) {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
}
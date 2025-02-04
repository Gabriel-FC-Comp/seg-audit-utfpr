/**
 * Módulo de cálculo de chaves Diffie-Hellman.
 * 
 * Autores: Daniel S. G. da Costa, Gabriel F. Conte e Vitor L. Q. Batista
 * 
 * Este arquivo contém as funções responsáveis pelo cálculo de chaves públicas e secretas
 * utilizando o algoritmo Diffie-Hellman, que é um método de troca de chaves criptográficas 
 * para comunicação segura. A biblioteca utiliza exponenciação modular para calcular as chaves.
 * 
 * Funções:
 * --------
 * @function modExp - Função para realizar a exponenciação modular.
 * @function calc_kpu_diff_helman - Calcula a chave pública do cliente com base no algoritmo Diffie-Hellman.
 * @function calc_secret_diff_helman - Calcula a chave secreta compartilhada com base no algoritmo Diffie-Hellman.
 * 
 * Variáveis:
 * -----------
 * @constant {number} Kpr_client - Chave privada do cliente, usada para gerar a chave pública do cliente.
 * @variable {number} Kpu_client - Chave pública do cliente, calculada usando o algoritmo Diffie-Hellman.
 * @variable {string} Secret_Key - Chave secreta compartilhada entre o cliente e o servidor, calculada através do algoritmo Diffie-Hellman.
 */

// Declarando as variáveis do diffie_hellman
const Kpr_client = 31;
var Kpu_client = null;
var Secret_Key = null;

/**
 * Função para exponenciação modular.
 * 
 * Esta função executa a exponenciação modular utilizando o método de "exponenciação rápida", 
 * o que permite calcular potências de números grandes de maneira eficiente.
 * 
 * @param {BigInt} base - A base que será elevada à potência.
 * @param {BigInt} exp - O expoente da operação de exponenciação.
 * @param {BigInt} mod - O módulo para a operação de exponenciação modular.
 * 
 * @returns {BigInt} O resultado da exponenciação modular.
 */
function modExp(base, exp, mod) {
    let result = BigInt(1);
    base = base % mod;  // Ajusta a base no módulo

    while (exp > 0) {
        if (exp % 2n === 1n) {
            result = (result * base) % mod;
        }
        exp = exp / 2n;  // Divide exp por 2
        base = (base * base) % mod;  // Eleva a base ao quadrado
    }

    return result;
}

/**
 * Calcula a chave pública do cliente utilizando o algoritmo Diffie-Hellman.
 * 
 * A chave pública é calculada pela exponenciação modular do gerador (g) elevado à chave privada 
 * do cliente (Kpr_client), com o número primo (p) como módulo.
 * 
 * @param {number} p - Número primo utilizado no cálculo de chaves.
 * @param {number} g - Gerador utilizado no cálculo de chaves.
 * @param {number} kpr_client - Chave privada do cliente.
 * 
 * @returns {number} A chave pública do cliente calculada.
 */
function calc_kpu_diff_helman(p, g, kpr_client) {    
    // Converte os números para BigInt para lidar com números grandes
    p = BigInt(p);
    g = BigInt(g);
    kpr_client = BigInt(kpr_client);
    
    // Função de Exponenciação Modular
    const result = modExp(g, kpr_client, p);
    
    return Number(result);  // Retorna o resultado como string, pois pode ser muito grande
}

/**
 * Calcula a chave secreta compartilhada utilizando o algoritmo Diffie-Hellman.
 * 
 * A chave secreta compartilhada é calculada pela exponenciação modular da chave pública do servidor 
 * (Kpu_serv) elevada à chave privada do cliente (Kpr_client), com o número primo (p) como módulo.
 * 
 * @param {number} p - Número primo utilizado no cálculo de chaves.
 * @param {number} kpr_client - Chave privada do cliente.
 * @param {number} kpu_serv - Chave pública do servidor.
 * 
 * @returns {number} A chave secreta compartilhada calculada.
 */
function calc_secret_diff_helman(p, kpr_client, kpu_serv) {
    // Converte os números para BigInt para lidar com números grandes
    kpu_serv = BigInt(kpu_serv);
    kpr_client = BigInt(kpr_client);
    p = BigInt(p);
    const result = modExp(kpu_serv, kpr_client, p);
    return Number(result); 
}

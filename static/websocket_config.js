/**
 * Conexão WebSocket para comunicação segura com o servidor.
 * 
 * Autores: Daniel S. G. da Costa, Gabriel F. Conte e Vitor L. Q. Batista
 * 
 * Este script gerencia a troca de chaves Diffie-Hellman com o servidor 
 * via WebSocket. O cliente emite um evento para solicitar a chave pública 
 * e parâmetros do servidor, realiza o cálculo da chave pública do cliente 
 * e da chave secreta compartilhada, e em seguida envia a chave pública do 
 * cliente de volta para o servidor.
 *
 * Variáveis:
 * -----------
 * @constant {string} endpoint_ip - Endereço IP do servidor para a conexão WebSocket.
 * @constant {Socket} socket - Instância do WebSocket.
 * @constant {number} Kpr_client - Chave privada do cliente.
 * @constant {number} Kpu_client - Chave pública do cliente, calculada via Diffie-Hellman.
 * @constant {string} Secret_Key - Chave secreta compartilhada, calculada a partir do Diffie-Hellman e SHA256.
 *
 */

// Primeiro IP para tentar (VM Ubuntu Server)
let endpoint_ip = window.location.hostname + ":8001";

// Conexão WebSocket
const socket = io(endpoint_ip);

// Solicita a chave pública e parâmetros do servidor
socket.emit('exchange_kpu'); 

/**
 * Função que é executada quando o servidor envia os parâmetros Diffie-Hellman e a chave pública.
 * 
 * Esta função calcula a chave pública do cliente e a chave secreta compartilhada, 
 * além de enviar a chave pública do cliente de volta para o servidor.
 * 
 * @param {Object} data - Os dados enviados pelo servidor, contendo os parâmetros Diffie-Hellman e chave pública do servidor.
 * @param {number} data.p - Número primo utilizado no cálculo de chaves.
 * @param {number} data.g - Gerador utilizado no cálculo de chaves.
 * @param {number} data.kpu_serv - Chave pública do servidor.
 */
socket.on('server_kpu', (data) => {
    console.log('Parâmetros recebidos no namespace:', data);
    console.log(Kpr_client);

    // Cálculos das chaves
    Kpu_client = calc_kpu_diff_helman(data.p, data.g, Kpr_client);
    Secret_Key = String(calc_secret_diff_helman(p = data.p, kpr_client = Kpr_client, kpu_serv = data.kpu_serv));
    Secret_Key = CryptoJS.SHA256(Secret_Key);

    // Logs para debug
    console.log('Kpu_client:', Kpu_client);
    console.log('Secret_Key:', Secret_Key);

    // Envia a chave pública do cliente para o servidor
    socket.emit('kpu_client', { client_kpu: Kpu_client });
});
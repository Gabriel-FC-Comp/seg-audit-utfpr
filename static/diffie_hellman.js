// Função para exponenciação modular
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

function calc_kpu_diff_helman(p, g, kpr_client) {    
    // Converte os números para BigInt para lidar com números grandes
    p = BigInt(p);
    g = BigInt(g);
    kpr_client = BigInt(kpr_client);
    
    // Função de Exponenciação Modular
    const result = modExp(g, kpr_client, p);
    
    return Number(result);  // Retorna o resultado como string, pois pode ser muito grande
}

function calc_secret_diff_helman(p, kpr_client, kpu_serv) {
     // Converte os números para BigInt para lidar com números grandes
    kpu_serv = BigInt(kpu_serv);
    kpr_client = BigInt(kpr_client);
    p = BigInt(p);
    const result = modExp(kpu_serv, kpr_client, p);
    return Number(result); 
}

// Conectando ao servidor
const socket = io('http://127.0.0.1:8001');

const Kpr_client = 31;
var Kpu_client = null;
var Secret_Key = null;
// Solicita a chave pública e parâmetros
socket.emit('exchange_kpu'); 

socket.on('server_kpu', (data) => {
    console.log('Parâmetros recebidos no namespace:', data);

    // Funções de cálculo
    Kpu_client = calc_kpu_diff_helman(data.p, data.g, Kpr_client);
    Secret_Key = String(calc_secret_diff_helman(p=data.p, kpr_client=Kpr_client, kpu_serv=data.kpu_serv));
    Secret_Key = CryptoJS.SHA256(Secret_Key);
    
    // Logs para debug
    console.log('Kpu_client:', Kpu_client);
    console.log('Secret_Key:', Secret_Key);

    // Envia o Kpu do cliente para o servidor
    socket.emit('kpu_client', { client_kpu: Kpu_client });
});
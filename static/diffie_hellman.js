const Kpr_client = 31;
var Kpu_client = null;
var Secret_Key = null;

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

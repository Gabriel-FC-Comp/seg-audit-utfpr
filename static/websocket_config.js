// Primeiro IP para tentar (VM Ubuntu Server)
let endpoint_ip = window.location.hostname + ":8001";

const socket = io(endpoint_ip);

// Solicita a chave pública e parâmetros
socket.emit('exchange_kpu'); 

socket.on('server_kpu', (data) => {
    console.log('Parâmetros recebidos no namespace:', data);
    console.log(Kpr_client);
    // Funções de cálculo
    Kpu_client = calc_kpu_diff_helman(data.p, data.g, Kpr_client);
    Secret_Key = String(calc_secret_diff_helman(p = data.p, kpr_client = Kpr_client, kpu_serv = data.kpu_serv));
    Secret_Key = CryptoJS.SHA256(Secret_Key);

    // Logs para debug
    console.log('Kpu_client:', Kpu_client);
    console.log('Secret_Key:', Secret_Key);

    // Envia o Kpu do cliente para o servidor
    socket.emit('kpu_client', { client_kpu: Kpu_client });
});
# Importando bibliotecas necessárias
from flask import Flask, render_template,send_file,request, jsonify  # Para criar o aplicativo Flask e renderizar modelos HTML
from flask_socketio import SocketIO, emit  # Para suporte a WebSocket
from Crypto.Cipher import AES
import os
import hashlib
import json

def calc_kpu_diff_helman(p: int, g: int, Kpr: int) -> int:
    """
    Calcula a chave pública no algoritmo Diffie-Hellman.

    Args:
        p (int): Um número primo usado como módulo.
        g (int): O gerador (base) do grupo cíclico.
        Kpr (int): A chave privada do participante.

    Returns:
        int: A chave pública calculada.
    """
    Kpu = (g ** Kpr) % p
    return Kpu


def calc_secret_diff_helman(p: int, Kpr_a: int, Kpu_b: int) -> int:
    """
    Calcula a chave secreta compartilhada no algoritmo Diffie-Hellman.

    Args:
        p (int): Um número primo usado como módulo.
        Kpr_a (int): A chave privada do participante atual.
        Kpu_b (int): A chave pública do outro participante.

    Returns:
        int: A chave secreta compartilhada calculada.
    """
    K = (Kpu_b ** Kpr_a) % p
    return K

# Valores públicos (primo + int gerador)
diffie_hellman_p: int = 23
diffie_hellman_g: int = 5

# Chave Privada do servidor
Kpr_serv: int = 57

# Chave pública do servidor
Kpu_serv = calc_kpu_diff_helman(diffie_hellman_p,diffie_hellman_g,Kpr_serv)

Diffie_Hellman_Secret = None

# Inicializanod o Hasher
hasher = hashlib.new('sha512')

# Configurando a decriptação dos dados
def decript_data(received_cipherdata,received_nonce,received_tag):
    cipher = AES.new(Diffie_Hellman_Secret, AES.MODE_EAX, nonce=received_nonce)
    plaintext = cipher.decrypt(received_cipherdata)
    try:
        cipher.verify(received_tag)
        print("Mensagem autêntica:", plaintext)
    except ValueError:
        print("A mensagem foi corrompida ou a chave está errada")


# Inicializando o Flask com WebSocket
app = Flask(__name__)
socketio = SocketIO(app)

# Definindo a rota principal
@app.route('/')
def homepage():
    # Renderiza o modelo HTML da página inicial
    return render_template('homepage.html')  


@socketio.on('exchange_kpu')
def handle_exchange_kpu():
    # Cria os parâmetros Diffie-Hellman como um dicionário
    diffie_hellman_parameters = {
        "p": diffie_hellman_p,
        "g": diffie_hellman_g,
        "kpu_serv": Kpu_serv
    }
    # Emite os dados para o cliente no evento 'server_kpu'
    emit('server_kpu', diffie_hellman_parameters,room=request.sid)

@socketio.on('kpu_client')
def calc_secret(data):
    global Diffie_Hellman_Secret
    Diffie_Hellman_Secret = calc_secret_diff_helman(p=diffie_hellman_p, Kpr_a=Kpr_serv, Kpu_b=data['client_kpu'])
    print(f"ServKPU = {Kpu_serv}")
    print(f"Secret: {Diffie_Hellman_Secret}")
    
# Diretório para salvar os arquivos enviados
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST'])
def upload_file_and_calculate_hash():
    # print(request.form.get('test'))
    """Recebe um arquivo do cliente, salva no servidor e calcula seu hash SHA-512."""
    if 'file' not in request.files:
        return jsonify({"error": "Nenhum arquivo foi enviado"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "Nome do arquivo vazio"}), 400
    
    # Salva o arquivo no diretório especificado
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    # Calcula o hash SHA-512 do arquivo
    sha512_hash = hashlib.sha512()
    try:
        with open(file_path, "rb") as f:
            # Lê o arquivo em blocos para eficiência
            for block in iter(lambda: f.read(4096), b""):
                sha512_hash.update(block)
    except Exception as e:
        return jsonify({"error": f"Erro ao calcular o hash: {str(e)}"}), 500

    # Retorna o hash calculado junto com a mensagem de sucesso
    return jsonify({
        "message": f"Arquivo {file.filename} recebido e salvo com sucesso!",
        "filename": file.filename,
        "sha512": sha512_hash.hexdigest()
    })

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    """Permite que o cliente faça o download de um arquivo salvo no servidor."""
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    # Verifica se o arquivo existe
    if not os.path.exists(file_path):
        return jsonify({"error": f"Arquivo {filename} não encontrado"}), 404

    # Envia o arquivo para download
    try:
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": f"Erro ao enviar o arquivo: {str(e)}"}), 500


# Verifica se o arquivo foi executado diretamente
if __name__ == "__main__":
    # Inicia o servidor Flask com suporte a WebSocket
    socketio.run(app, debug=True, port=8001)

# Importando bibliotecas necessárias
from flask import Flask, render_template,send_file,request, jsonify  # Para criar o aplicativo Flask e renderizar modelos HTML
from flask_socketio import SocketIO, emit  # Para suporte a WebSocket
from flask_cors import CORS # Para configurar o WebSocket
from Crypto.Cipher import AES
import os
import hashlib
import base64

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
def decrypt_text(ciphertext, key):
    raw_data = base64.b64decode(ciphertext)
    iv = raw_data[:16]  # Os primeiros 16 bytes são o IV
    encrypted_bytes = raw_data[16:]  # O restante é o texto criptografado

    cipher = AES.new(key, AES.MODE_CBC, iv)  # A chave deve ter 32 bytes (SHA-256 já garante isso)
    decrypted = cipher.decrypt(encrypted_bytes)

    # Remover padding PKCS7 corretamente
    pad_len = decrypted[-1]  # O último byte indica o número de bytes de padding
    decrypted = decrypted[:-pad_len]  # Removendo o padding

    return decrypted.decode('utf-8')

# Função para descriptografar
def decrypt_file(encrypted_data,key):
    # Decodifica o Base64
    encrypted_data = base64.b64decode(encrypted_data)

    # Extrai o IV (primeiros 16 bytes)
    iv = encrypted_data[:16]

    # Extrai os dados criptografados (restante dos bytes)
    ciphertext = encrypted_data[16:]

    # Cria o objeto AES para descriptografia
    cipher = AES.new(key, AES.MODE_CBC, iv)

    # Descriptografa os dados
    decrypted_data = cipher.decrypt(ciphertext)

    # Remove o padding (preenchimento PKCS7)
    pad_len = decrypted_data[-1]  # O último byte indica o número de bytes de padding
    decrypted_data = decrypted_data[:-pad_len]  # Removendo o padding

    return decrypted_data

# Inicializando o Flask com WebSocket
app = Flask(__name__)
CORS(app)  # Habilita CORS para a aplicação Flask
socketio = SocketIO(app,cors_allowed_origins=["*"])

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
    print("Encoded: ", Diffie_Hellman_Secret)
    Diffie_Hellman_Secret = hashlib.sha256(f"{Diffie_Hellman_Secret}".encode('utf-8')).digest()
    print(f"ServKPU = {Kpu_serv}")
    print(f"Secret: {Diffie_Hellman_Secret.hex()}")
    
# Diretório para salvar os arquivos enviados
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST'])
def upload_file_and_calculate_hash():
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

    file_hash = sha512_hash.hexdigest()

    received_file_hash = decrypt_text(request.form.get('e_hash'), Diffie_Hellman_Secret)
    print("FH:  ", file_hash)
    print("RFH: ", received_file_hash)
    if(file_hash == received_file_hash):
        print("Arquivo sem corrupção!")

    if "e_file" not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400

    # Recebe o arquivo criptografado
    encrypted_file = request.files["e_file"].read()

    with open(f".\\uploads\\{file.filename}","wb") as received_file:
        print("Creating File: ", f"|{file.filename}|")
        received_file.write(decrypt_file(encrypted_file,Diffie_Hellman_Secret))

    # Retorna o hash calculado junto com a mensagem de sucesso
    return jsonify({
        "message": f"Arquivo {file.filename} recebido e salvo com sucesso!",
        "filename": file.filename,
        "sha512": file_hash
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
    socketio.run(app, debug=True, port=8001, host='0.0.0.0')
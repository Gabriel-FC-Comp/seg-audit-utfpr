#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Módulo Flask para Upload, Download e Troca de Chaves Diffie-Hellman

Autores: Daniel S. G. da Costa, Gabriel F. Conte e Vitor L. Q. Batista

Este módulo implementa um servidor Flask que permite a troca segura de arquivos 
através de criptografia AES e autenticação via Diffie-Hellman. Ele também fornece 
um WebSocket para troca de chaves públicas.

Funcionalidades:
----------------
- Troca de chaves Diffie-Hellman para comunicação segura.
- Upload de arquivos criptografados, decriptografia e cálculo de hash SHA-512.
- Comparação do hash para garantir a integridade do arquivo.
- Download de arquivos salvos no servidor (omitida por não ter criptografia implementada).

Dependências:
-------------
- Flask
- Flask-SocketIO
- PyCryptodome (Crypto.Cipher.AES)
- hashlib
- os

Rotas e Eventos:
----------------
- `GET /` -> Retorna a página inicial.
- `POST /upload` -> Recebe um arquivo criptografado, decripta, calcula hash e valida a integridade.
- `GET /download/<filename>` -> Permite baixar um arquivo salvo no servidor.
- `exchange_kpu` (WebSocket) -> Envia os parâmetros públicos e chave pública do servidor.
- `kpu_client` (WebSocket) -> Recebe a chave pública do cliente e calcula a chave secreta.
"""

#=================================================================================
# Importando pacotes/módulos necessários
#=================================================================================

from flask import Flask, render_template,send_file,request, jsonify  
from flask_socketio import SocketIO, emit  
from utils.diffie_helman import calc_kpu_diff_helman,calc_secret_diff_helman
from utils.aes_decrypt import decrypt_text, decrypt_file
import hashlib
import os

#=================================================================================
# Importando pacotes/módulos necessários
#=================================================================================

# Valores públicos (primo + int gerador)
diffie_hellman_p: int = 23
diffie_hellman_g: int = 5

# Chave Privada do servidor
Kpr_serv: int = 57

# Chave pública do servidor
Kpu_serv = calc_kpu_diff_helman(diffie_hellman_p,diffie_hellman_g,Kpr_serv)
Diffie_Hellman_Secret = None

# Inicializando o Flask com WebSocket
app = Flask(__name__)
socketio = SocketIO(app)

# Instância o diretório para salvar os arquivos enviados ao servidor
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '.\\uploads'))
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
del UPLOAD_FOLDER

#=================================================================================
# Definindo comunicação do WebSocket
#=================================================================================

@socketio.on('exchange_kpu')
def handle_exchange_kpu():
    """ Realiza a troca da chave pública e parâmetros do Diffie-Hellman com o Cliente """
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
    """ Recebe a chave pública do cliente e calcula a chave secreta pelo algoritmo Diffie-Hellman e SHA256 """
    global Diffie_Hellman_Secret
    # Calcula a chave secreta
    Diffie_Hellman_Secret = calc_secret_diff_helman(p=diffie_hellman_p, Kpr_a=Kpr_serv, Kpu_b=data['client_kpu'])
    print("Encoded: ", Diffie_Hellman_Secret)
    # Configura a chave secreta como o Hash SHA256 do valor obtido pelo algoritmo Diffie-Hellman
    Diffie_Hellman_Secret = hashlib.sha256(f"{Diffie_Hellman_Secret}".encode('utf-8')).digest()
    print(f"ServKPU = {Kpu_serv}")
    print(f"Secret: {Diffie_Hellman_Secret.hex()}")

#=================================================================================
# Definindo rotas do Flask
#=================================================================================

# Definindo a rota principal
@app.route('/')
def homepage():
    """ Renderiza o modelo HTML da página inicial """
    return render_template('homepage.html')  


@app.route('/upload', methods=['POST'])
def upload_file_and_calculate_hash():
    """ Recebe um arquivo do cliente, salva no servidor e calcula seu hash SHA-512 """

    if 'file' not in request.files:
        return jsonify({"error": "Nenhum arquivo foi enviado"}), 400
    
    # Extrai o arquivo encriptado da requisição
    encrypted_file = request.files['e_file'].read()
    
    # Decripta o arquivo
    filename, file = decrypt_file(encrypted_file,Diffie_Hellman_Secret)
    
    if filename == '':
        return jsonify({"error": "Nome do arquivo vazio"}), 400

    # Salva o arquivo no diretório especificado
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    with open(file_path,"wb") as received_file:
        received_file.write(file)

    # Calcula o hash SHA-512 do arquivo
    sha512_hash = hashlib.sha512()
    try:
        with open(file_path, "rb") as f:
            # Lê o arquivo em blocos para eficiência
            for block in iter(lambda: f.read(4096), b""):
                sha512_hash.update(block)
    except Exception as e:
        return jsonify({"error": f"Erro ao calcular o hash: {str(e)}"}), 500
    finally:
        file_hash = sha512_hash.hexdigest()

    # Decripta o Hash recebido
    received_file_hash = decrypt_text(request.form.get('e_hash'), Diffie_Hellman_Secret)

    # Compara o hash calculado com o recebido junto ao arquivo
    if(file_hash != received_file_hash):
        return jsonify({"error": "Hash incoerente, arquivo corrompido!"}), 500

    # Retorna o hash calculado junto com a mensagem de sucesso
    return jsonify({
        "message": f"Arquivo {filename} recebido e salvo com sucesso!",
        "filename": filename,
        "sha512": file_hash
    })

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    """ Permite que o cliente faça o download de um arquivo salvo no servidor """
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    # Verifica se o arquivo existe
    if not os.path.exists(file_path):
        return jsonify({"error": f"Arquivo {filename} não encontrado"}), 404

    # Envia o arquivo para download
    try:
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": f"Erro ao enviar o arquivo: {str(e)}"}), 500


#=================================================================================
# Configurando a inicialização do servidor
#=================================================================================

if __name__ == "__main__":
    # Inicia o servidor Flask com suporte a WebSocket
    socketio.run(app, debug=True, port=8001, host='0.0.0.0')
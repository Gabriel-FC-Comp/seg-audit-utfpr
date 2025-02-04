#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Módulo de Decriptação AES-CBC

Autores: Daniel S. G. da Costa, Gabriel F. Conte e Vitor L. Q. Batista

Este módulo fornece funções para descriptografar textos e arquivos que foram criptografados 
usando o algoritmo AES no modo CBC. O objetivo é garantir a segurança dos dados, permitindo 
a recuperação do conteúdo original.

Funções:
--------
- decrypt_text(ciphertext: str, key: bytes) -> str
    Descriptografa um texto criptografado em Base64 e retorna a string original.

- decrypt_file(encrypted_data: bytes, key: bytes) -> tuple[str, bytes]
    Descriptografa um arquivo criptografado, recuperando seu nome original e conteúdo.

"""

#=================================================================================
# Importando pacotes/módulos necessários
#=================================================================================

from Crypto.Cipher import AES
import base64

#=================================================================================
# Definindo as funções de decriptografia
#=================================================================================

# Função para descriptografar uma string
def decrypt_text(ciphertext: str, key: bytes) -> str:
    raw_data = base64.b64decode(ciphertext)
    iv = raw_data[:16]  # Os primeiros 16 bytes são o IV
    encrypted_bytes = raw_data[16:]  # O restante é o texto criptografado

    cipher = AES.new(key, AES.MODE_CBC, iv)  # A chave deve ter 32 bytes (SHA-256 já garante isso)
    decrypted = cipher.decrypt(encrypted_bytes)

    # Remover padding PKCS7 corretamente
    pad_len = decrypted[-1]  # O último byte indica o número de bytes de padding
    decrypted = decrypted[:-pad_len]  # Removendo o padding

    return decrypted.decode('utf-8')

# Função para descriptografar um arquivo
def decrypt_file(encrypted_data: bytes, key: bytes) -> tuple[str, bytes]:

    # Extrai o IV (primeiros 16 bytes)
    iv = encrypted_data[:16]
    
    # Extrai os dados criptografados
    ciphertext = encrypted_data[16:]

    # Cria o objeto AES para descriptografar
    cipher = AES.new(key, AES.MODE_CBC, iv)

    # Descriptografa os dados
    decrypted_data = cipher.decrypt(ciphertext)

    # Remove o padding (PKCS7)
    pad_len = decrypted_data[-1]  # Último byte indica o padding
    decrypted_data = decrypted_data[:-pad_len]

    # Recupera o nome do arquivo
    decoded_string = decrypted_data.decode(errors="ignore")  # Converte bytes para string
    filename, file_content = decoded_string.split("||", 1)  # Separa pelo delimitador

    # Retorna o nome e o conteúdo do arquivo
    return filename, file_content.encode()
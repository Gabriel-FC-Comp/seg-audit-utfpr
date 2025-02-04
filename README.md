# Segurança e Auditoria de Sistemas (2024/2)

Este repositório contém os trabalhos desenvolvidos na disciplina de Segurança e Auditoria de Sistemas (2024/2). O projeto implementa um servidor Flask que permite a comunicação segura e criptografada entre um cliente e o servidor, utilizando algoritmos de criptografia como AES CBC e Diffie-Hellman.

## Descrição

O servidor permite que o cliente envie um arquivo para o servidor de forma criptografada. O processo de criptografia e comunicação ocorre da seguinte maneira:

1. **Compartilhamento de chave secreta (Diffie-Hellman):** O cliente e o servidor realizam um processo de troca de chaves através do algoritmo Diffie-Hellman.
2. **Gerando a chave de criptografia (SHA256):** Após o compartilhamento da chave secreta, ambos os lados calculam o SHA256 da chave compartilhada para utilizá-la como chave de criptografia.
3. **Criptografia do arquivo (AES CBC):** O cliente criptografa o arquivo com o algoritmo AES CBC antes de enviá-lo ao servidor.
4. **Envio de dados:** O cliente envia um POST com os seguintes dados:
    - `file`: O arquivo original.
    - `hash`: O hash do arquivo original.
    - `e_file`: O arquivo criptografado com AES CBC.
    - `e_hash`: O hash criptografado com AES CBC.
5. **Descriptografando o arquivo (AES CBC)**: O servidor recebe os dados, descriptografa o arquivo e o salva na pasta uploads/.

Além disso, com um capturador de pacotes (por exemplo, Wireshark), é possível verificar o fluxo dos dados e como a criptografia protege as informações durante a transmissão.

## Estrutura do Repositório
A estrutura do repositório é a seguinte:

```bash
|- static
   |- crypto.js
   |- socket.io
   cipher_data.js
   diffie_hellman.js
   styles.css
   upload_file_control.js
   websocket_config.js
|- templates
   homepage.html
|- uploads
|- utils
   aes_decrypt.py
   diffie_helman.py
.gitignore
__init__.py
LICENSE
package.json
package-lock.json
README.md
requirements.txt
```

## Como Executar

1. **Clonar o repositório:**

    ```bash
    git clone https://github.com/Gabriel-FC-Comp/seg-audit-utfpr
    ```

2. **Criar um ambiente virtual Python chamado `fvenv`:**

    ```nginx
    python3 -m venv fvenv
    ```

3. **Acessar o ambiente virtual:**

    - No Linux/Mac:
      ```bash
      source fvenv/bin/activate
      ```
    - No Windows:
      ```bash
      fvenv\Scripts\activate
      ```

4. **Instalar os requisitos:**

    ```nginx
    pip install -r requirements.txt
    ```

5. **Executar o servidor Flask:** Execute o arquivo `__init__.py` para iniciar o servidor:

    ```markdown
    python __init__.py
    ```

## Autores

Este projeto foi desenvolvido por:

- **Daniel Silva Gonçalves da Costa** - [GitHub/danielcosta001](https://github.com/danielcosta001)
- **Gabriel Finger Conte** - [GitHub/Gabriel-FC-Comp](https://github.com/Gabriel-FC-Comp)
- **Vitor Luis de Queiroz Batista** - [GitHub/VectorBatesta](https://github.com/VectorBatesta)

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).
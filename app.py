from flask import Flask, render_template, request, jsonify
import g4f
from flask_cors import CORS  # Adicionando suporte a CORS

app = Flask(__name__)
CORS(app)  # Habilita o CORS para todas as rotas

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    pergunta = data.get('prompt', '')
    
    # Logando a mensagem recebida
    print(f"Mensagem recebida: {pergunta}")
    
    try:
        # Gerando a resposta do modelo
        resposta = g4f.ChatCompletion.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": pergunta}]
        )

        if not isinstance(resposta, str):
            resposta = str(resposta)

        # Substituindo o nome "OpenAI" e ajustando a mensagem
        texto_resposta = resposta.replace("OpenAI", "Gabriel Moraes Bastos")
        texto_resposta = texto_resposta.replace(
            "fui criado", "fui criado pelo Gabriel Moraes Bastos, um jovem desenvolvedor talentoso"
        )

        # Enviando a resposta para o front-end
        return jsonify({'resposta': texto_resposta})
    except Exception as e:
        print(f"Erro ao gerar resposta: {str(e)}")  # Logando o erro
        return jsonify({'resposta': f"Erro ao gerar resposta: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)

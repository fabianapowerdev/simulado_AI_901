# AI-901 ExamLab

Laboratório interativo de simulados focado na certificação **Microsoft Azure AI Fundamentals (AI-901)**, desenvolvido com foco em clareza visual, feedback detalhado e alinhamento às habilidades cobradas no exame e no **Microsoft Foundry**.

---

## ✨ Recursos Principais

- **Dois Modos de Prática:**
  - **Modo Estudo:** sem limite de tempo, com correção imediata, explicação da resposta correta, análise das demais alternativas e dicas de estudo.
  - **Modo Prova:** simulação cronometrada (padrão de 40 questões em 60 minutos) para treinar ritmo e gestão de tempo.
- **Configuração Flexível:** filtre por tema de estudo, ajuste a quantidade de questões no modo estudo, personalize o tempo de prova e defina sua meta de aprovação (%).
- **Navegação e Controle:** mapa de questões interativo, marcação de questões para revisão (`☆ Marcar` / `★ Marcada`) e barra de progresso.
- **Diagnóstico e Revisão Detalhada:** ao finalizar, visualize percentual de acerto, pontuação estimada (escala de 0 a 1000), tempo gasto, desempenho por tópico, recomendação de prioridade e revisão completa questão por questão.
- **Histórico Local:** salva automaticamente as últimas tentativas no `localStorage` do navegador.

---

## 🧠 Domínios e Habilidades Cobertos

O banco de questões está organizado em torno dos grandes eixos do exame e do ecossistema **Microsoft Foundry**:

1. **IA Responsável:** imparcialidade, confiabilidade e segurança, privacidade e segurança, inclusão, transparência e responsabilidade.
2. **Componentes e Configurações do Modelo:** funcionamento de modelos generativos, tokens e janela de contexto, modelos multimodais, opções de implantação e parâmetros (`temperature`, `top_p`, `max tokens`, penalidades de repetição).
3. **Cargas de Trabalho de IA:** IA generativa e agentes, análise de texto (frases-chave, entidades, sentimento e resumo), reconhecimento e síntese de fala, visão computacional, geração de imagem e extração de informações de texto, imagem, áudio e vídeo.
4. **Soluções com Microsoft Foundry:** prompts de sistema e usuário, implantação e testes no portal, clientes leves com SDK, agentes únicos, texto e fala (*Azure Speech*), visão e geração de imagem, além de extração estruturada com *Azure Content Understanding*.

---

## 📁 Estrutura do Projeto

```text
├── index.html      # Estrutura da interface (setup, simulado, modal de resultado e revisão)
├── style.css       # Estilos, temas, componentes visuais e responsividade
├── questions.js    # Banco de questões (BLUEPRINTS), guia de alternativas e embaralhamento
└── app.js          # Lógica do simulador, cronômetro, diagnóstico, revisão e histórico local
```

---

## 🚀 Como Executar

Como o projeto é composto por arquivos estáticos client-side, você não precisa instalar dependências:

1. Baixe ou clone os arquivos do projeto na mesma pasta.
2. Abra o arquivo `index.html` diretamente em seu navegador (ou sirva a pasta com um servidor local simples, como *Live Server* no VS Code).
3. Escolha o modo (**Modo estudo** ou **Modo prova**), ajuste as configurações e clique em **Iniciar simulado →**.

---

## 🛠️ Personalização

- **Adicionar ou editar questões:** abra o `questions.js` e adicione novos itens no array `BLUEPRINTS`, complementando as descrições em `OPTION_GUIDE` quando necessário.
- **Ajustar cores e layout:** modifique as variáveis CSS no topo do arquivo `style.css` (`:root`).

---

## 📌 Observação

Este projeto é uma ferramenta independente de apoio aos estudos e não possui vínculo oficial com a Microsoft. Sempre consulte o guia oficial atualizado da certificação antes da prova.

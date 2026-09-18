### [Aula 02b] Desafio Extra: Requisições Encadeadas de 3º Nível e Desempenho

**Descrição:**

Esta atividade contém exercícios avançados para aprofundar o conhecimento sobre requisições HTTP encadeadas, interface do usuário e análise de desempenho de rede.

#### **Tarefas a serem desenvolvidas:**
- [ ] **Requisição Encadeada em 3º Nível (Comentários):** Permitir que, ao clicar em um post específico, sejam buscados e exibidos os seus **comentários** (`/comments?postId=X`).
- [ ] **Feedback Visual de Carregamento (Spinner):** Substituir as mensagens simples de texto por um *spinner* visual do Bootstrap durante o carregamento e a transição entre telas.
- [ ] **Análise de Latência de Rede:** Utilizar a aba **Network** do DevTools para comparar o tempo de resposta das requisições na API remota (`JSONPlaceholder`) em relação ao arquivo `.json` local utilizado na aula anterior (pacientes.json).

**Reflexão para a tarefa de análise:**
- Repare no tempo (*Latency/TTFB*) das requisições HTTP locais vs. remotas e identifique a diferença no tempo de carregamento da interface.
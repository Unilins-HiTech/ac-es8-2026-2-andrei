### [Aula 02b] Estudo Dirigido: Perguntas para Discussão em Sala

**Descrição:**

Análise do código desenvolvido na aula e reflexão sobre a arquitetura de requisições HTTP assíncronas, consumo de APIs remotas e transição para o backend.

> 💬 **Instruções para Entrega:**
> Responda às perguntas abaixo **diretamente nos comentários desta Issue**.

#### **Perguntas:**

1. **Padrão Fetch API:** O que mudou no código do `fetch` em relação à Aula 2, agora que estamos falando com uma API remota em vez de um arquivo local?
2. **Dependência de Dados Assíncronos:** Por que precisamos esperar a primeira requisição (`/users`) terminar antes de poder fazer a segunda (`/posts?userId=...`)?
3. **Ordem de Execução:** O que aconteceria se tentássemos buscar os posts **antes** de sabermos o ID do usuário?
4. **Aplicações no Mundo Real:** Que tipo de sistema real você imagina que poderia ser construído usando esse padrão de "lista → detalhe com nova requisição"? (Ex: e-commerce, rede social, prontuário médico).
5. **Visão de Futuro (Backend):** Esse mesmo padrão de código vai servir, com pouquíssimas mudanças, para quando nosso próprio servidor Node.js estiver pronto. O que você acha que vai precisar mudar e o que vai continuar igual do ponto de vista do cliente?
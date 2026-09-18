### [Aula 02b] Exercícios de Fixação: Exibição de Dados, Filtros e Detalhes

**Descrição:**

Implemente as melhorias solicitadas no projeto `aula-02b-jsonplaceholder` para consolidar o consumo de APIs REST, manipulação do DOM e tratamento de dados retornados pela API.

#### **Tarefas a serem desenvolvidas:**
- [ ] **Informações Adicionais do Usuário:** Exibir também o **telefone** e o **website** de cada usuário no seu respectivo `card`.
- [ ] **Contador de Posts:** Na tela de detalhe, exibir a quantidade total de posts que aquele usuário possui (ex: *"3 posts encontrados"*).
- [ ] **Filtro de Usuários em Tempo Real:** Adicionar um campo de busca para filtrar os cards de usuários por nome em tempo real, realizando o filtro sobre o array de usuários já carregado (sem fazer novas requisições HTTP).
- [ ] **Tratamento de Usuário sem Posts:** Tratar o cenário onde um usuário não possui nenhum post retornado, exibindo uma mensagem amigável na interface em vez de uma lista vazia.

**Dicas e pontos de atenção:**
- Utilize a propriedade `.length` do array de posts para exibir a contagem na tela de detalhe.
- Para o filtro, escute o evento `input` do campo de busca e reutilize a função de renderização.
- Verifique sempre se os dados existem antes de exibi-los na tela para evitar erros de leitura (`undefined`).
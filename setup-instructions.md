# Configuração e Execução do Projeto Harmonia

## Pré-requisitos
- Node.js (versão 14.x ou superior)
- NPM (normalmente instalado com o Node.js)
- Navegador moderno com suporte a WebGL (Chrome, Firefox, Edge, Safari)

## Instalação

1. Clone ou baixe os arquivos do projeto para sua máquina local
2. Abra um terminal na pasta raiz do projeto
3. Execute o comando para instalar as dependências:

```bash
npm install
```

## Execução do Servidor

1. Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

Este comando iniciará o servidor Node.js com hot-reload usando nodemon.

2. Para iniciar o cliente em desenvolvimento:

```bash
npm run client
```

3. Para iniciar ambos simultaneamente:

```bash
npm run dev:all
```

## Acesso ao Jogo

- Servidor de desenvolvimento: http://localhost:3000
- Cliente (quando executado separadamente): http://localhost:8080

## Executando em Produção

Para executar em produção, você pode usar:

```bash
npm start
```

## Estrutura de Pastas

```
harmonia-game/
│
├── client/               # Frontend do jogo
│   ├── css/              # Estilos CSS
│   ├── js/               # Scripts do cliente
│   │   ├── avatar.js     # Renderização dos avatares
│   │   ├── controls.js   # Controles FPS
│   │   ├── game.js       # Lógica principal do jogo
│   │   ├── network.js    # Comunicação com o servidor
│   │   ├── ui.js         # Interface do usuário
│   │   ├── utils.js      # Funções utilitárias
│   │   └── world.js      # Ambiente 3D
│   └── index.html        # Página principal
│
├── server/               # Backend do jogo
│   └── index.js          # Servidor Node.js com Socket.IO
│
├── assets/               # Recursos do jogo (a ser expandido)
│   ├── textures/         # Texturas
│   ├── sounds/           # Efeitos sonoros e música
│   └── models/           # Modelos 3D
│
└── package.json          # Configuração NPM
```

## Depuração

Para depurar o jogo:

1. **Cliente**: Abra as ferramentas de desenvolvedor do navegador (F12) para ver logs e erros
2. **Servidor**: Observe os logs no terminal onde o servidor está executando

## Recomendações para Desenvolvimento

- Utilize o modo de desenvolvimento com `npm run dev:all` para ter hot-reload automático
- Teste em diferentes navegadores para garantir compatibilidade
- Utilize o console do navegador para depurar problemas do cliente
- Monitore o terminal para erros do servidor

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuração do servidor
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Porta do servidor
const PORT = process.env.PORT || 3000;

// Configuração CORS para Express
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Servir arquivos estáticos da pasta client
app.use(express.static(path.join(__dirname, '../client')));

// Rota para verificar se o servidor está rodando
app.get('/status', (req, res) => {
  res.json({ status: 'online', timestamp: new Date() });
});

// Armazenamento em memória dos jogadores (em produção, usar Redis)
const players = {};

// Divisão espacial do mundo em células (spatial hash grid)
const CELL_SIZE = 100; // tamanho da célula em unidades do mundo
const cells = {};

// Funções auxiliares para o grid espacial
function getCellId(x, z) {
  const cellX = Math.floor(x / CELL_SIZE);
  const cellZ = Math.floor(z / CELL_SIZE);
  return `${cellX}:${cellZ}`;
}

function addPlayerToCell(playerId, x, z) {
  const cellId = getCellId(x, z);
  if (!cells[cellId]) {
    cells[cellId] = new Set();
  }
  cells[cellId].add(playerId);
  return cellId;
}

function removePlayerFromCell(playerId, cellId) {
  if (cells[cellId] && cells[cellId].has(playerId)) {
    cells[cellId].delete(playerId);
    if (cells[cellId].size === 0) {
      delete cells[cellId];
    }
  }
}

function getPlayersInProximity(cellId) {
  const [cellX, cellZ] = cellId.split(':').map(Number);
  const nearbyPlayers = new Set();
  
  // Aumentar a área de verificação de células vizinhas (5x5 grid em vez de 3x3)
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      const neighborCellId = `${cellX + x}:${cellZ + z}`;
      if (cells[neighborCellId]) {
        cells[neighborCellId].forEach(id => nearbyPlayers.add(id));
      }
    }
  }
  
  return Array.from(nearbyPlayers);
}

// Configuração do Socket.IO
io.on('connection', (socket) => {
  console.log(`Novo jogador conectado: ${socket.id}`);
  
  // Evento de entrada do jogador
  socket.on('join', (playerData) => {
    // Criar jogador com ID único
    const playerId = socket.id;
    const initialPosition = {
      x: 0,
      y: 1.7, // altura do olho
      z: 0
    };
    
    // Armazenar dados do jogador
    players[playerId] = {
      id: playerId,
      position: initialPosition,
      rotation: { y: 0 }, // Rotação no eixo Y (olhar para onde)
      profile: playerData.profile || {}, // Dados do perfil do jogador
      cellId: addPlayerToCell(playerId, initialPosition.x, initialPosition.z),
      lastUpdate: Date.now()
    };
    
    // Informar ao jogador seu ID e posição inicial
    // Modificar para enviar apenas jogadores ATIVOS (não inativos)
    const activePlayers = {};
    Object.keys(players).forEach(id => {
      // Verificar se o jogador tem atualização recente (últimos 60 segundos)
      if (Date.now() - players[id].lastUpdate < 60000) {
        activePlayers[id] = players[id];
      }
    });
    
    socket.emit('initialize', {
      id: playerId,
      position: initialPosition,
      players: activePlayers // Enviar todos os jogadores ativos
    });
    
    // Informar aos outros jogadores sobre o novo jogador
    socket.broadcast.emit('playerJoined', {
      id: playerId,
      position: initialPosition,
      profile: players[playerId].profile
    });
  });

  // Emote de um jogador
  socket.on('emote', (data) => {
    const playerId = socket.id;
    const { emoteId } = data;
    
    if (players[playerId]) {
      // Atualizar timestamp de última atividade
      players[playerId].lastUpdate = Date.now();
      
      // Transmitir emote para jogadores próximos
      const nearbyPlayers = getPlayersInProximity(players[playerId].cellId);
      nearbyPlayers.forEach(nearbyPlayerId => {
        if (nearbyPlayerId !== playerId) {
          io.to(nearbyPlayerId).emit('playerEmote', {
            playerId: playerId,
            emoteId: emoteId
          });
        }
      });
    }
  });
  
  // Atualização de posição do jogador
  socket.on('updatePosition', (data) => {
    const playerId = socket.id;
    if (players[playerId]) {
      // Atualizar a posição
      players[playerId].position = data.position;
      players[playerId].rotation = data.rotation;
      players[playerId].lastUpdate = Date.now();
      
      // Verificar se o jogador mudou de célula
      const newCellId = getCellId(data.position.x, data.position.z);
      if (players[playerId].cellId !== newCellId) {
        // Remover da célula antiga
        removePlayerFromCell(playerId, players[playerId].cellId);
        
        // Adicionar à nova célula
        players[playerId].cellId = addPlayerToCell(playerId, data.position.x, data.position.z);
        
        // Obter novos jogadores na proximidade - enviar TODOS os jogadores ativos
        const activePlayers = [];
        Object.keys(players).forEach(id => {
          // Verificar se o jogador tem atualização recente (últimos 60 segundos)
          if (Date.now() - players[id].lastUpdate < 60000) {
            activePlayers.push(players[id]);
          }
        });
        
        // Enviar informações dos jogadores próximos
        socket.emit('proximityUpdate', {
          players: activePlayers
        });
      }
      
      // Enviar atualizações para TODOS os jogadores, não apenas os próximos
      socket.broadcast.emit('playerMoved', {
        id: playerId,
        position: data.position,
        rotation: data.rotation
      });
    }
  });
  
  // Interação social entre jogadores
  socket.on('socialInteraction', (data) => {
    const { targetPlayerId, interactionType, message } = data;
    const sourcePlayerId = socket.id;
    
    if (players[targetPlayerId]) {
      io.to(targetPlayerId).emit('interaction', {
        sourcePlayerId,
        interactionType,
        message
      });
    }
  });
  
  // Desconexão do jogador
  socket.on('disconnect', () => {
    const playerId = socket.id;
    console.log(`Jogador desconectado: ${playerId}`);
    
    if (players[playerId]) {
      // Remover do grid espacial
      removePlayerFromCell(playerId, players[playerId].cellId);
      
      // Informar aos outros jogadores na proximidade
      const nearbyPlayers = getPlayersInProximity(players[playerId].cellId);
      nearbyPlayers.forEach(nearbyPlayerId => {
        io.to(nearbyPlayerId).emit('playerLeft', { id: playerId });
      });
      
      // Remover jogador da lista
      delete players[playerId];
    }
  });
});

// Limpar jogadores inativos a cada minuto
setInterval(() => {
  const now = Date.now();
  Object.keys(players).forEach(playerId => {
    if (now - players[playerId].lastUpdate > 60000) { // 1 minuto
      console.log(`Removendo jogador inativo: ${playerId}`);
      removePlayerFromCell(playerId, players[playerId].cellId);
      delete players[playerId];
    }
  });
}, 60000);

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse http://localhost:${PORT} para visualizar o jogo`);
});
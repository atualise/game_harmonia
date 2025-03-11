class Network {
  constructor(game) {
    this.game = game;
    this.socket = null;
    this.connected = false;
    this.lastUpdateTime = 0;
    this.updateRate = 100; // ms entre atualizações de posição
  }
  
  connect() {
    try {
      // Conectar ao servidor Socket.IO usando a porta correta
      const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `http://${window.location.hostname}:3000` 
        : window.location.origin;
      
      console.log("Conectando ao servidor:", serverUrl);
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });
      
      // Configurar handlers de eventos
      this.setupEventHandlers();
      
      // Enviar dados do perfil para o servidor
      this.socket.on('connect', () => {
        console.log('Conectado ao servidor com ID:', this.socket.id);
        this.connected = true;
        
        this.socket.emit('join', {
          profile: this.game.profile
        });
      });
    } catch (error) {
      console.error("Erro ao conectar ao servidor:", error);
      alert("Erro ao conectar ao servidor. Verifique o console para mais detalhes.");
    }
  }
  
  setupEventHandlers() {
    // Desconexão
    this.socket.on('disconnect', () => {
      console.log('Desconectado do servidor!');
      this.connected = false;
      
      // Mostrar mensagem para o jogador
      if (this.game.ui) {
        this.game.ui.showNotification('Conexão perdida. Tentando reconectar...', 'error');
      }
    });
    
    // Inicialização do jogador
    this.socket.on('initialize', (data) => {
      console.log('Inicializado com ID:', data.id);
      console.log('Jogadores recebidos do servidor:', Object.keys(data.players).length);
      
      // Guardar o ID do jogador
      this.game.playerId = data.id;
      
      // Inicializar outros jogadores que já estão no mundo
      Object.values(data.players).forEach(playerData => {
        if (playerData.id !== this.game.playerId) {
          this.game.addPlayer(playerData);
        }
      });
    });
    
    // Novo jogador entrou
    this.socket.on('playerJoined', (data) => {
      console.log('Novo jogador entrou:', data.id);
      
      // Adicionar o novo jogador ao mundo
      this.game.addPlayer(data);
    });
    
    // Jogador saiu
    this.socket.on('playerLeft', (data) => {
      console.log('Jogador saiu:', data.id);
      
      // Remover o jogador do mundo
      this.game.removePlayer(data.id);
    });

    // Receber emote de outro jogador
    this.socket.on('playerEmote', (data) => {
      console.log('Emote recebido:', data);
      
      // Mostrar emote localmente
      if (this.game.emoteSystem) {
        this.game.emoteSystem.showEmote(data.playerId, data.emoteId);
      }
    });
    
    // Atualização de posição de jogador
    this.socket.on('playerMoved', (data) => {
      // Atualizar a posição do jogador no mundo
      this.game.updatePlayerPosition(data);
    });
    
    // Atualização de jogadores próximos
    this.socket.on('proximityUpdate', (data) => {
      console.log('Atualização de proximidade recebida');
      
      // Remover jogadores que não estão mais na proximidade
      const currentPlayerIds = Object.keys(this.game.players);
      const nearbyPlayerIds = data.players.map(p => p.id);
      
      currentPlayerIds.forEach(id => {
        if (id !== this.game.playerId && !nearbyPlayerIds.includes(id)) {
          this.game.removePlayer(id);
        }
      });
      
      // Adicionar novos jogadores que entraram na proximidade
      data.players.forEach(playerData => {
        if (playerData.id !== this.game.playerId && !this.game.players[playerData.id]) {
          this.game.addPlayer(playerData);
        }
      });
    });
    
    // Receber interação de outro jogador
    this.socket.on('interaction', (data) => {
      console.log('Interação recebida:', data);
      
      // Processar a interação
      this.game.receiveInteraction(data);
    });
    
    // Tratamento de erros
    this.socket.on('error', (error) => {
      console.error('Erro na conexão:', error);
      if (this.game.ui) {
        this.game.ui.showNotification('Erro na conexão com o servidor', 'error');
      }
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Erro ao conectar:', error);
      if (this.game.ui) {
        this.game.ui.showNotification('Erro ao conectar ao servidor', 'error');
      }
    });
  }
  
  // Enviar atualização de posição para o servidor
  updatePosition(data) {
    const now = Date.now();
    
    // Limitar a taxa de envio para não sobrecarregar a rede
    if (this.connected && now - this.lastUpdateTime > this.updateRate) {
      this.socket.emit('updatePosition', data);
      this.lastUpdateTime = now;
    }
  }
  
  // Enviar interação com outro jogador
  sendInteraction(data) {
    if (this.connected) {
      this.socket.emit('socialInteraction', data);
    }
  }
  
  // Desconectar do servidor
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  /**
   * Enviar emote para o servidor
   * @param {string} emoteId - ID do emote a ser exibido
   */
  sendEmote(emoteId) {
    if (this.connected) {
      this.socket.emit('emote', {
        emoteId: emoteId
      });
    }
  }
}


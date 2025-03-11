// Inicialização do jogo
class Game {
  // Atualizar o construtor para incluir emoteSystem
  constructor() {
    // Propriedades principais
    this.playerId = null;
    this.players = {};
    this.profile = null;
    
    // Referências aos componentes
    this.world = null;
    this.controls = null;
    this.network = null;
    this.ui = null;
    this.compatibilitySystem = null;
    this.emoteSystem = null; // Nova propriedade
    
    // Estado do jogo
    this.isRunning = false;
    this.lastTime = 0;
    this.nearbyPlayers = new Set();
    this.currentInteraction = null;
    
    // Inicializar os componentes
    this.init();
  }
  
  init() {
    // Inicializar a UI
    this.ui = new UI(this);
    
    // Eventos de formulário
    document.getElementById('profile-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.startGame();
    });
    
    // Botões de interação
    document.getElementById('observe-btn').addEventListener('click', () => this.interact('observe'));
    document.getElementById('greet-btn').addEventListener('click', () => this.interact('greet'));
    document.getElementById('avoid-btn').addEventListener('click', () => this.interact('avoid'));
    
    // Chat
    document.getElementById('send-chat-btn').addEventListener('click', () => this.sendChatMessage());
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendChatMessage();
    });
  }
  
  // Atualizar o método startGame para inicializar o sistema de emotes
  startGame() {
    // Coletar dados do perfil
    const form = document.getElementById('profile-form');
    const formData = new FormData(form);
    
    // Criar objeto de perfil
    this.profile = {
      name: formData.get('name'),
      spiritual: formData.get('spiritual'),
      political: formData.get('political'),
      personality: formData.getAll('personality')
    };
    
    // Verificar se estamos em um dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log("Iniciando jogo em dispositivo:", isMobile ? "Móvel" : "Desktop");
    
    // Inicializar mundo 3D
    this.world = new World();
    
    // Inicializar controles com passagem explícita do canvas
    this.controls = new Controls(this.world.camera, document.getElementById('game-canvas'));
    
    // Definir controles como bloqueados automaticamente em mobile
    if (isMobile) {
      this.controls.isLocked = true;
    } else {
      // Em desktop, ativar o bloqueio do ponteiro no clique
      document.getElementById('game-canvas').addEventListener('click', () => {
        if (!this.controls.isLocked) {
          this.controls.lock();
        }
      });
    }
    
    // Inicializar sistema de compatibilidade
    this.compatibilitySystem = new CompatibilitySystem();
    
    // Inicializar sistema de emotes
    this.emoteSystem = new EmoteSystem(this);
    
    // Inicializar rede
    this.network = new Network(this);
    this.network.connect();
    
    // Mostrar tela do jogo
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    // Iniciar loop de animação
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
    
    console.log("Jogo iniciado com perfil:", this.profile);
  }

  // Atualizar o método animate para atualizar o sistema de emotes
  animate(time = 0) {
    if (!this.isRunning) return;
    
    requestAnimationFrame((t) => this.animate(t));
    
    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;
    
    // Atualizar controles - modificado para aceitar controles móveis
    if (this.controls) {
      this.controls.update(delta);
      
      // Enviar atualizações de posição para o servidor
      this.network.updatePosition({
        position: this.controls.getPosition(),
        rotation: this.controls.getRotation()
      });
      
      // Verificar interações com outros jogadores
      this.checkPlayerInteractions();
      
      // Atualizar sistema de compatibilidade
      if (this.compatibilitySystem) {
        this.compatibilitySystem.update(time);
      }
      
      // Atualizar sistema de emotes
      if (this.emoteSystem) {
        this.emoteSystem.update();
      }
    }
    
    // Atualizar mundo
    if (this.world) {
      this.world.update(delta);
    }
  }

  // Atualizar removePlayer para limpar emotes
  removePlayer(playerId) {
    if (this.players[playerId]) {
      // Remover do mundo
      this.world.removePlayerAvatar(playerId);
      
      // Remover efeitos de compatibilidade
      if (this.compatibilitySystem) {
        this.compatibilitySystem.hideCompatibilityEffect(playerId);
      }
      
      // Remover emotes ativos
      if (this.emoteSystem && this.emoteSystem.activeEmotes[playerId]) {
        this.emoteSystem.hideEmote(playerId);
      }
      
      // Remover da lista de jogadores próximos
      this.nearbyPlayers.delete(playerId);
      
      // Remover referência
      delete this.players[playerId];
      
      console.log(`Jogador removido: ${playerId}`);
    }
  }

  // Adicionar um jogador ao mundo
  addPlayer(playerData) {
    const { id, position, profile } = playerData;
    
    // Ignorar se o jogador é o próprio jogador local
    if (id === this.playerId) return;
    
    // Se o jogador já existe, atualizar sua posição
    if (this.players[id]) {
      this.updatePlayerPosition({
        id,
        position,
        rotation: playerData.rotation || { y: 0 }
      });
      console.log(`Jogador existente atualizado: ${id}`);
      return;
    }
    
    console.log(`Adicionando novo jogador: ${id} na posição:`, position);
    
    // Criar avatar baseado no perfil
    const avatar = new Avatar(profile);
    
    // Adicionar ao mundo
    this.world.addPlayerAvatar(id, avatar, position);
    
    // Armazenar referência
    this.players[id] = {
      id,
      profile,
      avatar,
      lastPosition: { ...position },
      lastInteraction: null
    };
    
    console.log(`Jogador adicionado com sucesso: ${id}`);
    console.log(`Total de jogadores ativos: ${Object.keys(this.players).length}`);
  }

  // Adicionar método para atualizar o HTML:
  updateHtmlFile() {
    // No index.html, adicionar a referência ao script de compatibilidade após utils.js:
    // <script src="js/utils.js"></script>
    // <script src="js/compatibility.js"></script>
    // <script src="js/avatar.js"></script>
  }

  // Atualizar posição de um jogador
  updatePlayerPosition(playerData) {
    const { id, position, rotation } = playerData;
    
    // Ignorar se for o próprio jogador
    if (id === this.playerId) return;
    
    // Verificar se o jogador existe
    if (!this.players[id]) {
      console.log(`Tentando atualizar jogador inexistente: ${id}`);
      return;
    }
    
    // Atualizar posição no mundo 3D
    this.world.updatePlayerAvatar(id, new THREE.Vector3(position.x, position.y, position.z), rotation);
    
    // Atualizar posição no registro
    this.players[id].lastPosition = { ...position };
  }
  
  // Verificar interações com outros jogadores
  checkPlayerInteractions() {
    // Obter a posição atual do jogador
    const playerPosition = this.controls.getPosition();
    
    // Distância para interação
    const INTERACTION_DISTANCE = 5;
    
    // Verificar todos os jogadores
    let foundInteraction = false;
    
    Object.values(this.players).forEach(player => {
      if (player.id !== this.playerId) {
        const playerDistance = this.calculateDistance(
          playerPosition,
          player.lastPosition
        );
        
        // Se estiver próximo o suficiente
        if (playerDistance < INTERACTION_DISTANCE) {
          this.nearbyPlayers.add(player.id);
          
          // Verificar se está olhando para o jogador
          if (this.isLookingAt(player.lastPosition)) {
            // Mostrar opções de interação
            this.ui.showInteractionPrompt(player.id);
            this.currentInteraction = player.id;
            foundInteraction = true;
          }
        } else {
          this.nearbyPlayers.delete(player.id);
        }
      }
    });
    
    // Se não encontrou nenhuma interação, esconder o prompt
    if (!foundInteraction && this.currentInteraction) {
      this.ui.hideInteractionPrompt();
      this.currentInteraction = null;
    }
  }
  
  // Calcular distância entre dois pontos
  calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
  
  // Verificar se está olhando para uma posição
  isLookingAt(targetPosition) {
    // Obter direção do olhar
    const direction = this.controls.getDirection();
    
    // Obter vetor para o alvo
    const playerPosition = this.controls.getPosition();
    const toTarget = {
      x: targetPosition.x - playerPosition.x,
      z: targetPosition.z - playerPosition.z
    };
    
    // Normalizar
    const length = Math.sqrt(toTarget.x * toTarget.x + toTarget.z * toTarget.z);
    toTarget.x /= length;
    toTarget.z /= length;
    
    // Calcular produto escalar (coseno do ângulo)
    const dot = direction.x * toTarget.x + direction.z * toTarget.z;
    
    // Se o coseno for maior que 0.7 (cerca de 45 graus), está olhando para o alvo
    return dot > 0.7;
  }
  
  // Interagir com um jogador
  interact(type) {
    if (this.currentInteraction) {
      this.network.sendInteraction({
        targetPlayerId: this.currentInteraction,
        interactionType: type,
        message: null
      });
      
      // Processamento específico por tipo
      switch (type) {
        case 'greet':
          this.ui.showChat();
          break;
        case 'avoid':
          this.ui.hideInteractionPrompt();
          this.currentInteraction = null;
          break;
      }
    }
  }
  
  // Enviar mensagem de chat
  sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message && this.currentInteraction) {
      this.network.sendInteraction({
        targetPlayerId: this.currentInteraction,
        interactionType: 'chat',
        message
      });
      
      // Adicionar mensagem à interface
      this.ui.addChatMessage('Você', message);
      
      // Limpar input
      input.value = '';
    }
  }
  
  // Receber interação de outro jogador
  receiveInteraction(data) {
    const { sourcePlayerId, interactionType, message } = data;
    const sourcePlayer = this.players[sourcePlayerId];
    
    if (sourcePlayer) {
      switch (interactionType) {
        case 'observe':
          // Mostrar efeito de "sendo observado"
          this.world.showObserveEffect(sourcePlayerId);
          break;
        case 'greet':
          // Mostrar efeito de cumprimento
          this.world.showGreetEffect(sourcePlayerId);
          this.ui.showChat();
          break;
        case 'chat':
          // Adicionar mensagem à interface
          if (message) {
            this.ui.addChatMessage(sourcePlayer.profile.name || 'Desconhecido', message);
          }
          break;
        case 'avoid':
          // Esconder chat se estiver aberto
          this.ui.hideChat();
          break;
      }
    }
  }
}

// Iniciar o jogo quando a página carregar
window.addEventListener('load', () => {
  window.game = new Game();
});
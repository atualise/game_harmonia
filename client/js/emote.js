/**
 * Sistema de Emotes
 * 
 * Este módulo gerencia a exibição de emotes e expressões para comunicação não-verbal
 * entre jogadores no mundo virtual.
 */

class EmoteSystem {
  constructor(game) {
    this.game = game;
    this.activeEmotes = {}; // Emotes ativos por ID de jogador
    
    // Configuração dos emotes disponíveis
    this.emotes = {
      'wave': {
        name: 'Acenar',
        icon: '👋',
        duration: 3000,
        animation: this.animateWave
      },
      'smile': {
        name: 'Sorrir',
        icon: '😊',
        duration: 3000,
        animation: this.animateSmile
      },
      'think': {
        name: 'Pensar',
        icon: '🤔',
        duration: 4000,
        animation: this.animateThink
      },
      'agree': {
        name: 'Concordar',
        icon: '👍',
        duration: 2000,
        animation: this.animateAgree
      },
      'disagree': {
        name: 'Discordar',
        icon: '👎',
        duration: 2000,
        animation: this.animateDisagree
      },
      'clap': {
        name: 'Aplaudir',
        icon: '👏',
        duration: 3000,
        animation: this.animateClap
      },
      'surprise': {
        name: 'Surpreso',
        icon: '😲',
        duration: 2500,
        animation: this.animateSurprise
      },
      'laugh': {
        name: 'Rir',
        icon: '😂',
        duration: 3500,
        animation: this.animateLaugh
      }
    };
    
    // Inicializar interface de emotes
    this.initEmoteUI();
  }
  
  /**
   * Inicializar interface de usuário para emotes
   */
  initEmoteUI() {
    // Criar painel de emotes
    const emotePanel = document.createElement('div');
    emotePanel.id = 'emote-panel';
    emotePanel.className = 'emote-panel hidden';
    
    // Botão para abrir/fechar o painel
    const emoteButton = document.createElement('button');
    emoteButton.id = 'emote-toggle';
    emoteButton.className = 'emote-toggle';
    emoteButton.innerHTML = '😊';
    emoteButton.title = 'Emotes';
    
    // Adicionar emotes ao painel
    Object.entries(this.emotes).forEach(([id, emote]) => {
      const emoteButton = document.createElement('button');
      emoteButton.className = 'emote-button';
      emoteButton.innerHTML = emote.icon;
      emoteButton.title = emote.name;
      emoteButton.dataset.emoteId = id;
      
      emoteButton.addEventListener('click', () => {
        this.triggerEmote(id);
        this.toggleEmotePanel();
      });
      
      emotePanel.appendChild(emoteButton);
    });
    
    // Adicionar botão e painel ao HUD
    const hud = document.getElementById('hud');
    
    emoteButton.addEventListener('click', () => {
      this.toggleEmotePanel();
    });
    
    hud.appendChild(emoteButton);
    hud.appendChild(emotePanel);
    
    // Adicionar estilo CSS para os emotes
    this.addEmoteStyles();
  }
  
  /**
   * Alternar visibilidade do painel de emotes
   */
  toggleEmotePanel() {
    const panel = document.getElementById('emote-panel');
    panel.classList.toggle('hidden');
  }
  
  /**
   * Disparar um emote
   * @param {string} emoteId - ID do emote a ser exibido
   */
  triggerEmote(emoteId) {
    // Validar se o emote existe
    if (!this.emotes[emoteId]) return;
    
    // Enviar emote para o servidor
    this.game.network.sendEmote(emoteId);
    
    // Exibir emote localmente
    this.showEmote(this.game.playerId, emoteId);
  }
  
  /**
   * Mostrar emote para um jogador
   * @param {string} playerId - ID do jogador
   * @param {string} emoteId - ID do emote
   */
  showEmote(playerId, emoteId) {
    const emote = this.emotes[emoteId];
    if (!emote) return;
    
    // Cancelar emote ativo anterior, se houver
    if (this.activeEmotes[playerId]) {
      this.hideEmote(playerId);
    }
    
    // Obter posição do avatar
    let position;
    if (playerId === this.game.playerId) {
      // Emote do jogador local
      position = this.game.controls.getPosition();
    } else if (this.game.players[playerId] && this.game.players[playerId].avatar) {
      // Emote de outro jogador
      position = this.game.players[playerId].avatar.mesh.position.clone();
    } else {
      return; // Não foi possível determinar a posição
    }
    
    // Criar objeto 3D para o emote
    const emoteObject = new THREE.Group();
    
    // Criar sprite com o ícone
    const spriteMap = this.createEmoteTexture(emote.icon);
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: spriteMap,
      transparent: true
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5, 0.5, 1);
    sprite.position.y = 2.2; // Posicionar acima da cabeça
    
    emoteObject.add(sprite);
    
    // Posicionar emote
    emoteObject.position.copy(position);
    
    // Adicionar ao mundo
    this.game.world.scene.add(emoteObject);
    
    // Armazenar referência
    this.activeEmotes[playerId] = {
      object: emoteObject,
      emoteId: emoteId,
      startTime: Date.now(),
      duration: emote.duration
    };
    
    // Iniciar animação
    if (emote.animation) {
      emote.animation.call(this, playerId);
    }
    
    // Configurar remoção automática após a duração
    setTimeout(() => {
      this.hideEmote(playerId);
    }, emote.duration);
  }
  
  /**
   * Esconder emote de um jogador
   * @param {string} playerId - ID do jogador
   */
  hideEmote(playerId) {
    if (this.activeEmotes[playerId]) {
      // Remover do mundo
      this.game.world.scene.remove(this.activeEmotes[playerId].object);
      
      // Limpar recursos
      const emote = this.activeEmotes[playerId];
      emote.object.children.forEach(child => {
        if (child.material && child.material.map) {
          child.material.map.dispose();
        }
        if (child.material) {
          child.material.dispose();
        }
        if (child.geometry) {
          child.geometry.dispose();
        }
      });
      
      // Remover referência
      delete this.activeEmotes[playerId];
    }
  }
  
  /**
   * Atualizar posições dos emotes ativos
   */
  update() {
    // Atualizar posição dos emotes para seguir os jogadores
    Object.keys(this.activeEmotes).forEach(playerId => {
      const emote = this.activeEmotes[playerId];
      let position;
      
      if (playerId === this.game.playerId) {
        // Emote do jogador local
        position = this.game.controls.getPosition();
      } else if (this.game.players[playerId] && this.game.players[playerId].avatar) {
        // Emote de outro jogador
        position = this.game.players[playerId].avatar.mesh.position.clone();
      } else {
        return; // Não foi possível determinar a posição
      }
      
      // Atualizar posição do emote
      emote.object.position.copy(position);
      
      // Calcular progresso da animação (0-1)
      const elapsed = Date.now() - emote.startTime;
      const progress = Math.min(1, elapsed / emote.duration);
      
      // Atualizar animação baseada no progresso
      this.updateEmoteAnimation(playerId, progress);
    });
  }
  
  /**
   * Criar textura para o emote a partir do emoji
   * @param {string} emoji - Emoji a ser exibido
   * @returns {THREE.Texture} - Textura com o emoji
   */
  createEmoteTexture(emoji) {
    // Criar canvas para renderizar o emoji
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    
    const context = canvas.getContext('2d');
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar emoji
    context.font = '200px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(emoji, canvas.width / 2, canvas.height / 2);
    
    // Criar textura
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  }
  
  /**
   * Atualizar animação do emote
   * @param {string} playerId - ID do jogador
   * @param {number} progress - Progresso da animação (0-1)
   */
  updateEmoteAnimation(playerId, progress) {
    const emote = this.activeEmotes[playerId];
    if (!emote) return;
    
    const sprite = emote.object.children[0];
    
    // Animação de entrada e saída
    let scale;
    if (progress < 0.2) {
      // Entrada
      scale = progress / 0.2;
    } else if (progress > 0.8) {
      // Saída
      scale = 1 - ((progress - 0.8) / 0.2);
    } else {
      // Mostrar completo
      scale = 1;
    }
    
    // Aplicar escala
    sprite.scale.set(0.5 * scale, 0.5 * scale, 1);
    
    // Movimento suave para cima
    const bounceHeight = Math.sin(progress * Math.PI) * 0.2;
    sprite.position.y = 2.2 + bounceHeight;
  }
  
  /**
   * Adicionar estilos CSS para emotes
   */
  addEmoteStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .emote-toggle {
        position: absolute;
        right: 20px;
        top: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        font-size: 24px;
        border: none;
        cursor: pointer;
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.3s;
      }
      
      .emote-toggle:hover {
        background-color: rgba(0, 0, 0, 0.7);
      }
      
      .emote-panel {
        position: absolute;
        right: 20px;
        top: 80px;
        background-color: rgba(0, 0, 0, 0.7);
        border-radius: 10px;
        padding: 10px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 5px;
        pointer-events: auto;
      }
      
      .emote-button {
        width: 40px;
        height: 40px;
        border-radius: 5px;
        background-color: rgba(255, 255, 255, 0.1);
        border: none;
        font-size: 20px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .emote-button:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }
      
      .hidden {
        display: none;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Funções de animação para cada emote
  
  animateWave(playerId) {
    // A animação é gerenciada pelo método update
  }
  
  animateSmile(playerId) {
    // A animação é gerenciada pelo método update
  }
  
  animateThink(playerId) {
    const emote = this.activeEmotes[playerId];
    if (!emote) return;
    
    // Adicionar bolhas de pensamento
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        if (!this.activeEmotes[playerId]) return;
        
        const bubbleSize = 0.1 + i * 0.05;
        const bubbleGeometry = new THREE.SphereGeometry(bubbleSize, 8, 8);
        const bubbleMaterial = new THREE.MeshBasicMaterial({
          color: 0xFFFFFF,
          transparent: true,
          opacity: 0.7
        });
        
        const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
        bubble.position.set(0.2 + i * 0.15, 2.0 + i * 0.15, 0);
        
        emote.object.add(bubble);
      }, 500 * i);
    }
  }
  
  animateAgree(playerId) {
    // A animação é gerenciada pelo método update
  }
  
  animateDisagree(playerId) {
    // A animação é gerenciada pelo método update
  }
  
  animateClap(playerId) {
    // Adicionar efeito de brilho para palmas
    const emote = this.activeEmotes[playerId];
    if (!emote) return;
    
    // Intervalos para criar efeitos de brilho
    const interval = setInterval(() => {
      if (!this.activeEmotes[playerId]) {
        clearInterval(interval);
        return;
      }
      
      const sparkleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const sparkleMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFD700,
        transparent: true,
        opacity: 0.8
      });
      
      const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
      
      // Posição aleatória ao redor das mãos
      sparkle.position.set(
        (Math.random() - 0.5) * 0.4,
        1.5 + Math.random() * 0.3,
        (Math.random() - 0.5) * 0.4
      );
      
      emote.object.add(sparkle);
      
      // Animação de fadeout
      const startTime = Date.now();
      const animate = () => {
        if (!emote.object || !emote.object.parent) return;
        
        const elapsed = Date.now() - startTime;
        const fadeProgress = elapsed / 500; // 500ms de duração
        
        if (fadeProgress < 1) {
          sparkle.material.opacity = 0.8 * (1 - fadeProgress);
          sparkle.position.y += 0.01;
          requestAnimationFrame(animate);
        } else {
          emote.object.remove(sparkle);
          sparkle.geometry.dispose();
          sparkle.material.dispose();
        }
      };
      
      animate();
    }, 300);
    
    // Limpar intervalo quando o emote for removido
    setTimeout(() => {
      clearInterval(interval);
    }, emote.duration);
  }
  
  animateSurprise(playerId) {
    const emote = this.activeEmotes[playerId];
    if (!emote) return;
    
    // Adicionar símbolo de exclamação
    const exclamationGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const exclamationMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.9
    });
    
    const exclamation = new THREE.Mesh(exclamationGeometry, exclamationMaterial);
    exclamation.position.set(0.3, 2.2, 0);
    
    emote.object.add(exclamation);
    
    // Animação de pulso
    const startScale = exclamation.scale.clone();
    const animate = () => {
      if (!emote.object || !emote.object.parent) return;
      
      const pulseFactor = 1 + 0.2 * Math.sin(Date.now() * 0.01);
      exclamation.scale.set(
        startScale.x * pulseFactor,
        startScale.y * pulseFactor,
        startScale.z * pulseFactor
      );
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  animateLaugh(playerId) {
    const emote = this.activeEmotes[playerId];
    if (!emote) return;
    
    // Adicionar "haha" em texto 3D
    // Seria implementado com TextGeometry em uma versão completa
    
    // Simulando com sprites
    const sprite = emote.object.children[0];
    
    // Animação de tremor para o sprite principal
    const originalPosition = sprite.position.clone();
    
    const animate = () => {
      if (!emote.object || !emote.object.parent) return;
      
      const shake = 0.03;
      sprite.position.set(
        originalPosition.x + (Math.random() - 0.5) * shake,
        originalPosition.y + (Math.random() - 0.5) * shake,
        originalPosition.z
      );
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
}

// Exportar classe
window.EmoteSystem = EmoteSystem;
/**
 * Sistema de Compatibilidade
 * 
 * Este módulo gerencia a visualização e cálculo de compatibilidade entre jogadores,
 * criando efeitos visuais para indicar a "ressonância" entre diferentes perfis.
 */

class CompatibilitySystem {
  constructor(game) {
    this.game = game;
    this.effects = {}; // Armazena efeitos ativos por ID de jogador
    this.compatibilityScores = {}; // Cache de pontuações de compatibilidade
    
    // Configurações visuais
    this.config = {
      // Limiares de compatibilidade
      thresholds: {
        low: 30,     // Abaixo disso é baixa compatibilidade
        medium: 60,  // Abaixo disso é média compatibilidade
        high: 80     // Acima disso é alta compatibilidade
      },
      
      // Cores para cada nível
      colors: {
        low: 0xE74C3C,     // Vermelho
        medium: 0xF39C12,  // Laranja
        high: 0x2ECC71     // Verde
      },
      
      // Intensidade dos efeitos (0-1)
      intensity: {
        low: 0.2,
        medium: 0.5,
        high: 0.8
      },
      
      // Distância máxima para mostrar efeitos (em unidades do mundo)
      maxDistance: 10,
      
      // Taxa de atualização (ms)
      updateRate: 1000
    };
    
    // Iniciar sistema
    this.lastUpdateTime = 0;
  }
  
  /**
   * Atualizar efeitos de compatibilidade
   * @param {number} time - Timestamp atual
   */
  update(time) {
    // Limitar taxa de atualização
    if (time - this.lastUpdateTime < this.config.updateRate) return;
    this.lastUpdateTime = time;
    
    // Obter a posição do jogador atual
    const playerPosition = this.game.controls.getPosition();
    
    // Verificar todos os outros jogadores
    Object.values(this.game.players).forEach(player => {
      if (player.id === this.game.playerId) return;
      
      // Calcular distância
      const distance = this.calculateDistance(
        playerPosition,
        player.lastPosition
      );
      
      // Se estiver dentro do alcance, mostrar efeito
      if (distance <= this.config.maxDistance) {
        this.showCompatibilityEffect(player);
      } else {
        this.hideCompatibilityEffect(player.id);
      }
    });
  }
  
  /**
   * Calcular distância entre dois pontos
   */
  calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  /**
   * Mostrar efeito de compatibilidade para um jogador
   */
  showCompatibilityEffect(player) {
    // Calcular pontuação de compatibilidade
    const score = this.getCompatibilityScore(this.game.profile, player.profile);
    
    // Determinar nível baseado na pontuação
    let level, color, intensity;
    if (score >= this.config.thresholds.high) {
      level = 'high';
    } else if (score >= this.config.thresholds.medium) {
      level = 'medium';
    } else {
      level = 'low';
    }
    
    color = this.config.colors[level];
    intensity = this.config.intensity[level];
    
    // Se já existe um efeito para este jogador, atualizá-lo
    if (this.effects[player.id]) {
      this.updateEffect(player.id, color, intensity);
    } else {
      // Caso contrário, criar um novo
      this.createEffect(player.id, color, intensity);
    }
  }
  
  /**
   * Esconder efeito de compatibilidade
   */
  hideCompatibilityEffect(playerId) {
    if (this.effects[playerId]) {
      // Remover o efeito do mundo
      if (this.effects[playerId].parent) {
        this.game.world.scene.remove(this.effects[playerId]);
      }
      
      // Limpar recursos
      if (this.effects[playerId].children) {
        this.effects[playerId].children.forEach(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      }
      
      // Remover referência
      delete this.effects[playerId];
    }
  }
  
  /**
   * Criar efeito visual para um jogador
   */
  createEffect(playerId, color, intensity) {
    // Obter a mesh do avatar
    const avatarMesh = this.game.players[playerId]?.avatar?.mesh;
    if (!avatarMesh) return;
    
    // Criar grupo para o efeito
    const effectGroup = new THREE.Group();
    
    // Efeito de aura (circulo no chão)
    const auraGeometry = new THREE.RingGeometry(0.7, 0.8, 32);
    const auraMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5 * intensity,
      side: THREE.DoubleSide
    });
    
    const aura = new THREE.Mesh(auraGeometry, auraMaterial);
    aura.rotation.x = -Math.PI / 2; // Rotacionar para ficar horizontal
    aura.position.y = 0.02; // Ligeiramente acima do chão
    effectGroup.add(aura);
    
    // Partículas ascendentes
    const particleCount = Math.floor(10 * intensity);
    for (let i = 0; i < particleCount; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.7 * intensity
      });
      
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      // Posição inicial aleatória ao redor do avatar
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.4;
      particle.position.set(
        Math.cos(angle) * radius,
        Math.random() * 0.2,
        Math.sin(angle) * radius
      );
      
      // Dados para animação
      particle.userData.speed = 0.003 + Math.random() * 0.003;
      particle.userData.angle = angle;
      particle.userData.radius = radius;
      particle.userData.phaseOffset = Math.random() * Math.PI * 2;
      
      effectGroup.add(particle);
    }
    
    // Adicionar ao mundo e posicionar no avatar
    this.game.world.scene.add(effectGroup);
    
    // Atualizar posição para seguir o avatar
    effectGroup.position.copy(avatarMesh.position);
    
    // Guardar referência
    this.effects[playerId] = effectGroup;
    
    // Iniciar animação
    this.animateEffect(playerId);
  }
  
  /**
   * Atualizar efeito existente
   */
  updateEffect(playerId, color, intensity) {
    const effect = this.effects[playerId];
    if (!effect) return;
    
    // Atualizar cor e intensidade das partículas
    effect.children.forEach(child => {
      if (child.material) {
        child.material.color.setHex(color);
        if (child.geometry.type === 'RingGeometry') {
          child.material.opacity = 0.5 * intensity;
        } else {
          child.material.opacity = 0.7 * intensity;
        }
      }
    });
  }
  
  /**
   * Animar efeito de compatibilidade
   */
  animateEffect(playerId) {
    const effect = this.effects[playerId];
    if (!effect) return;
    
    // Obter a mesh do avatar para seguir
    const avatarMesh = this.game.players[playerId]?.avatar?.mesh;
    if (!avatarMesh) return;
    
    // Atualizar posição
    effect.position.copy(avatarMesh.position);
    
    // Animar partículas (todos os filhos exceto o primeiro, que é o anel)
    for (let i = 1; i < effect.children.length; i++) {
      const particle = effect.children[i];
      
      // Movimento circular com ascensão
      const time = Date.now() * 0.001;
      const angle = particle.userData.angle + time * 0.5;
      const radius = particle.userData.radius;
      
      particle.position.x = Math.cos(angle) * radius;
      particle.position.z = Math.sin(angle) * radius;
      particle.position.y += particle.userData.speed;
      
      // Resetar partícula quando chegar ao topo
      if (particle.position.y > 2) {
        particle.position.y = 0;
      }
      
      // Pulsar opacidade
      const pulseFactor = Math.sin(time * 2 + particle.userData.phaseOffset) * 0.3 + 0.7;
      particle.material.opacity = pulseFactor * 0.7;
    }
    
    // Pulsar o anel
    const ring = effect.children[0];
    const pulseFactor = Math.sin(Date.now() * 0.002) * 0.3 + 0.7;
    ring.scale.set(pulseFactor, pulseFactor, pulseFactor);
    
    // Continuar animação se o efeito ainda existir
    if (this.effects[playerId]) {
      requestAnimationFrame(() => this.animateEffect(playerId));
    }
  }
  
  /**
   * Calcular pontuação de compatibilidade entre dois perfis
   */
  getCompatibilityScore(profile1, profile2) {
    // Criar ID único para o par de perfis
    const pairId = this.getProfilePairId(profile1, profile2);
    
    // Retornar do cache se disponível
    if (this.compatibilityScores[pairId] !== undefined) {
      return this.compatibilityScores[pairId];
    }
    
    // Calcular compatibilidade
    const score = GameUtils.calculateCompatibility(profile1, profile2);
    
    // Armazenar no cache
    this.compatibilityScores[pairId] = score;
    
    return score;
  }
  
  /**
   * Gerar ID único para um par de perfis
   */
  getProfilePairId(profile1, profile2) {
    // Usar algum identificador único de cada perfil (como nome)
    const id1 = profile1.name || 'unknown1';
    const id2 = profile2.name || 'unknown2';
    
    // Ordenar para garantir que (A,B) e (B,A) tenham o mesmo ID
    return [id1, id2].sort().join('-');
  }
  
  /**
   * Limpar todos os efeitos
   */
  clearAllEffects() {
    Object.keys(this.effects).forEach(playerId => {
      this.hideCompatibilityEffect(playerId);
    });
  }
}

// Exportar classe
window.CompatibilitySystem = CompatibilitySystem;
// Funções utilitárias para o jogo

// Gerar uma cor baseada em um valor numérico
function generateColorFromValue(value, min, max) {
  // Normalizar o valor entre 0 e 1
  const normalized = (value - min) / (max - min);
  
  // Converter para HSL (hue, saturation, lightness)
  // Usamos HSL pois é fácil gerar cores relacionadas visualmente
  const hue = normalized * 240; // 0 = vermelho, 120 = verde, 240 = azul
  
  return `hsl(${hue}, 70%, 60%)`;
}

// Gerar uma cor aleatória
function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

// Calcular compatibilidade entre dois perfis (0-100%)
function calculateCompatibility(profile1, profile2) {
  if (!profile1 || !profile2) return 0;
  
  let score = 0;
  let factors = 0;
  
  // Verificar espiritualidade
  if (profile1.spiritual && profile2.spiritual) {
    // Matriz de compatibilidade para visão espiritual
    const spiritualMatrix = {
      'religious': {
        'religious': 100,
        'spiritual': 70,
        'agnostic': 40,
        'atheist': 20
      },
      'spiritual': {
        'religious': 70,
        'spiritual': 100,
        'agnostic': 60,
        'atheist': 40
      },
      'agnostic': {
        'religious': 40,
        'spiritual': 60,
        'agnostic': 100,
        'atheist': 80
      },
      'atheist': {
        'religious': 20,
        'spiritual': 40,
        'agnostic': 80,
        'atheist': 100
      }
    };
    
    if (spiritualMatrix[profile1.spiritual] && 
        spiritualMatrix[profile1.spiritual][profile2.spiritual]) {
      score += spiritualMatrix[profile1.spiritual][profile2.spiritual];
      factors++;
    }
  }
  
  // Verificar política
  if (profile1.political !== undefined && profile2.political !== undefined) {
    const political1 = parseInt(profile1.political);
    const political2 = parseInt(profile2.political);
    
    // Calcular diferença política (0-100)
    const politicalDifference = Math.abs(political1 - political2);
    
    // Converter para compatibilidade (quanto menor a diferença, maior a compatibilidade)
    const politicalCompatibility = 100 - politicalDifference;
    
    score += politicalCompatibility;
    factors++;
  }
  
  // Verificar personalidade
  if (profile1.personality && profile2.personality && 
      profile1.personality.length > 0 && profile2.personality.length > 0) {
    
    // Calcular quantos traços de personalidade são compartilhados
    let sharedTraits = 0;
    profile1.personality.forEach(trait => {
      if (profile2.personality.includes(trait)) {
        sharedTraits++;
      }
    });
    
    // Calcular pontuação baseada em traços compartilhados
    const maxPossibleTraits = Math.max(profile1.personality.length, profile2.personality.length);
    const personalityCompatibility = (sharedTraits / maxPossibleTraits) * 100;
    
    score += personalityCompatibility;
    factors++;
  }
  
  // Calcular média
  return factors > 0 ? Math.round(score / factors) : 0;
}

// Calcular cor de compatibilidade
function getCompatibilityColor(compatibilityScore) {
  // 0 = vermelho, 50 = amarelo, 100 = verde
  const hue = compatibilityScore * 1.2; // Multiplicar por 1.2 para chegar ao verde (120)
  return `hsl(${hue}, 80%, 60%)`;
}

// Converter coordenadas 3D para coordenadas em célula do grid
function worldToGrid(position, cellSize) {
  return {
    x: Math.floor(position.x / cellSize),
    z: Math.floor(position.z / cellSize)
  };
}

// Converter ID de célula do grid para string
function gridCellToString(gridX, gridZ) {
  return `${gridX}:${gridZ}`;
}

// Gerar um ID para célula do grid a partir de posição no mundo
function getGridCellId(position, cellSize) {
  const grid = worldToGrid(position, cellSize);
  return gridCellToString(grid.x, grid.z);
}

// Gerar um efeito de partículas em uma posição
function createParticleEffect(scene, position, color, count = 20, duration = 2000) {
  const particles = [];
  
  // Criar partículas
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8
    });
    
    const particle = new THREE.Mesh(geometry, material);
    
    // Posição inicial
    particle.position.set(
      position.x + (Math.random() - 0.5) * 0.5,
      position.y + Math.random() * 0.5,
      position.z + (Math.random() - 0.5) * 0.5
    );
    
    // Velocidade
    particle.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      Math.random() * 0.05,
      (Math.random() - 0.5) * 0.02
    );
    
    scene.add(particle);
    particles.push(particle);
  }
  
  // Animar partículas
  const startTime = Date.now();
  
  function animateParticles() {
    const elapsed = Date.now() - startTime;
    
    if (elapsed < duration) {
      // Atualizar cada partícula
      particles.forEach(particle => {
        // Mover baseado na velocidade
        particle.position.add(particle.userData.velocity);
        
        // Reduzir opacidade com o tempo
        const opacity = 0.8 * (1 - elapsed / duration);
        particle.material.opacity = opacity;
      });
      
      requestAnimationFrame(animateParticles);
    } else {
      // Remover partículas
      particles.forEach(particle => {
        scene.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
      });
    }
  }
  
  animateParticles();
}

// Exportar funções
window.GameUtils = {
  generateColorFromValue,
  getRandomColor,
  calculateCompatibility,
  getCompatibilityColor,
  worldToGrid,
  gridCellToString,
  getGridCellId,
  createParticleEffect
};
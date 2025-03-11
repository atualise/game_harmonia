class Avatar {
  constructor(profile) {
    this.profile = profile || {};
    this.mesh = null;
    this.animations = {};
  }
  
  createMesh() {
    // Criar grupo para o avatar
    const avatarGroup = new THREE.Group();
    
    // Características visuais baseadas no perfil
    const colors = this.getColorsFromProfile();
    
    // Cabeça
    const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: colors.skin,
      roughness: 0.7,
      metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    head.castShadow = true;
    avatarGroup.add(head);
    
    // Corpo
    const bodyGeometry = new THREE.BoxGeometry(0.6, 1, 0.3);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: colors.clothing,
      roughness: 0.8,
      metalness: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.7;
    body.castShadow = true;
    avatarGroup.add(body);
    
    // Braços
    const armGeometry = new THREE.BoxGeometry(0.2, 0.7, 0.2);
    
    // Braço esquerdo
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial.clone());
    leftArm.position.set(-0.4, 0.7, 0);
    leftArm.castShadow = true;
    avatarGroup.add(leftArm);
    
    // Braço direito
    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial.clone());
    rightArm.position.set(0.4, 0.7, 0);
    rightArm.castShadow = true;
    avatarGroup.add(rightArm);
    
    // Pernas
    const legGeometry = new THREE.BoxGeometry(0.25, 0.7, 0.25);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: colors.pants,
      roughness: 0.8,
      metalness: 0.2
    });
    
    // Perna esquerda
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.15, 0.1, 0);
    leftLeg.castShadow = true;
    avatarGroup.add(leftLeg);
    
    // Perna direita
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.15, 0.1, 0);
    rightLeg.castShadow = true;
    avatarGroup.add(rightLeg);
    
    // Acessórios baseados no perfil
    this.addProfileAccessories(avatarGroup, colors);
    
    // Guardar referência
    this.mesh = avatarGroup;
    
    return avatarGroup;
  }
  
  getColorsFromProfile() {
    const colors = {
      skin: 0xECCC68, // Cor de pele padrão
      clothing: 0x3498DB, // Azul
      pants: 0x2F3640, // Preto escuro
      accent: 0xFFFFFF, // Branco
      detail: 0xE74C3C // Vermelho
    };
    
    // Ajustar cores baseadas nas respostas do perfil
    if (this.profile) {
      // Visão espiritual afeta cor de destaque (accent)
      if (this.profile.spiritual === 'religious') {
        colors.accent = 0xF1C40F; // Amarelo dourado
      } else if (this.profile.spiritual === 'spiritual') {
        colors.accent = 0x9B59B6; // Roxo
      } else if (this.profile.spiritual === 'agnostic') {
        colors.accent = 0x3498DB; // Azul
      } else if (this.profile.spiritual === 'atheist') {
        colors.accent = 0x2ECC71; // Verde
      }
      
      // Espectro político afeta cor da roupa
      if (this.profile.political) {
        const political = parseInt(this.profile.political);
        if (political < 30) {
          colors.clothing = 0xE74C3C; // Vermelho para progressista
        } else if (political < 60) {
          colors.clothing = 0x3498DB; // Azul para moderado
        } else {
          colors.clothing = 0x2C3E50; // Azul escuro para conservador
        }
      }
      
      // Personalidade afeta detalhes
      if (this.profile.personality) {
        if (this.profile.personality.includes('analytical')) {
          colors.detail = 0x1ABC9C; // Turquesa
        } else if (this.profile.personality.includes('creative')) {
          colors.detail = 0xE67E22; // Laranja
        } else if (this.profile.personality.includes('social')) {
          colors.detail = 0xF1C40F; // Amarelo
        } else if (this.profile.personality.includes('reserved')) {
          colors.detail = 0x7F8C8D; // Cinza
        }
      }
    }
    
    return colors;
  }
  
  addProfileAccessories(avatarGroup, colors) {
    // Adicionar acessórios específicos baseados no perfil
    
    // Visão espiritual: adiciona um símbolo na cabeça
    if (this.profile.spiritual) {
      let symbolGeometry;
      
      if (this.profile.spiritual === 'religious') {
        // Uma espécie de coroa/auréola
        symbolGeometry = new THREE.TorusGeometry(0.2, 0.03, 8, 16);
        const symbol = new THREE.Mesh(
          symbolGeometry,
          new THREE.MeshStandardMaterial({
            color: colors.accent,
            roughness: 0.4,
            metalness: 0.6
          })
        );
        symbol.position.set(0, 1.8, 0);
        symbol.rotation.x = Math.PI / 2;
        avatarGroup.add(symbol);
      } else if (this.profile.spiritual === 'spiritual') {
        // Um cristal
        symbolGeometry = new THREE.ConeGeometry(0.1, 0.2, 4);
        const symbol = new THREE.Mesh(
          symbolGeometry,
          new THREE.MeshStandardMaterial({
            color: colors.accent,
            roughness: 0.3,
            metalness: 0.7,
            transparent: true,
            opacity: 0.8
          })
        );
        symbol.position.set(0, 1.8, 0);
        avatarGroup.add(symbol);
      } else if (this.profile.spiritual === 'agnostic' || this.profile.spiritual === 'atheist') {
        // Um símbolo de dúvida ou razão
        symbolGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const symbol = new THREE.Mesh(
          symbolGeometry,
          new THREE.MeshStandardMaterial({
            color: colors.accent,
            roughness: 0.5,
            metalness: 0.2
          })
        );
        symbol.position.set(0, 1.8, 0);
        avatarGroup.add(symbol);
      }
    }
    
    // Personalidade afeta detalhes do corpo
    if (this.profile.personality) {
      if (this.profile.personality.includes('analytical')) {
        // Óculos
        const glassesFrameGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.05);
        const glassesMaterial = new THREE.MeshStandardMaterial({
          color: colors.detail,
          roughness: 0.3,
          metalness: 0.7
        });
        const glassesFrame = new THREE.Mesh(glassesFrameGeometry, glassesMaterial);
        glassesFrame.position.set(0, 1.52, 0.25);
        avatarGroup.add(glassesFrame);
        
        // Lentes
        const lensGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.01);
        const lensMaterial = new THREE.MeshStandardMaterial({
          color: 0xEBF5FB,
          roughness: 0.1,
          metalness: 0.5,
          transparent: true,
          opacity: 0.5
        });
        
        const leftLens = new THREE.Mesh(lensGeometry, lensMaterial);
        leftLens.position.set(-0.1, 1.52, 0.26);
        avatarGroup.add(leftLens);
        
        const rightLens = new THREE.Mesh(lensGeometry, lensMaterial);
        rightLens.position.set(0.1, 1.52, 0.26);
        avatarGroup.add(rightLens);
      } 
      
      if (this.profile.personality.includes('creative')) {
        // Boina/Chapéu
        const hatGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const hatMaterial = new THREE.MeshStandardMaterial({
          color: colors.detail,
          roughness: 0.8,
          metalness: 0.2
        });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.set(0, 1.8, 0);
        avatarGroup.add(hat);
      }
      
      if (this.profile.personality.includes('social')) {
        // Colar/Emblema
        const badgeGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.05);
        const badgeMaterial = new THREE.MeshStandardMaterial({
          color: colors.detail,
          roughness: 0.3,
          metalness: 0.7
        });
        const badge = new THREE.Mesh(badgeGeometry, badgeMaterial);
        badge.position.set(0, 1.05, 0.18);
        avatarGroup.add(badge);
      }
      
      if (this.profile.personality.includes('reserved')) {
        // Capuz
        const hoodGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.5);
        const hoodMaterial = new THREE.MeshStandardMaterial({
          color: colors.detail,
          roughness: 0.8,
          metalness: 0.1,
          transparent: true,
          opacity: 0.9
        });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.set(0, 1.5, 0);
        avatarGroup.add(hood);
      }
    }
    
    // Adicionar nome sobre a cabeça se disponível
    if (this.profile.name) {
      // No ambiente Three.js real, você usaria TextGeometry para isso
      // Por simplicidade, não implementaremos aqui, mas pode ser adicionado depois
    }
  }
  
  // Método para animar o avatar (ações simples)
  playAnimation(type) {
    // Pular, Acenar, etc.
    // Requer acompanhamento do estado e uso de TWEEN para animações
    // Por simplicidade, não implementaremos completamente aqui
  }
}
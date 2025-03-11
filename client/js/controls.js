class Controls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    // Estado do controle
    this.isLocked = false;
    
    // Sensibilidade do mouse
    this.mouseSensitivity = 0.002;
    this.touchSensitivity = 0.005; // Sensibilidade para toque
    
    // Ângulos da câmera
    this.pitch = 0; // Olhar para cima/baixo
    this.yaw = 0;   // Olhar para esquerda/direita
    
    // Velocidade de movimento
    this.moveSpeed = 5.0;
    
    // Estado das teclas
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      run: false,
      jump: false
    };
    
    // Física
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.gravity = 9.8;
    this.jumpStrength = 5.0;
    this.isOnGround = true;
    
    // Detectar dispositivo móvel
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Valores do joystick virtual
    this.joystick = {
      active: false,
      startX: 0,
      startY: 0,
      moveX: 0,
      moveY: 0,
      deltaX: 0,
      deltaY: 0
    };
    
    // Controle de movimento da câmera
    this.cameraControl = {
      active: false,
      lastX: 0,
      lastY: 0
    };
    
    // Inicializar
    this.init();
  }
  
  init() {
    // Adicionar eventos do ponteiro
    this.domElement.addEventListener('click', () => this.lock());
    document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
    document.addEventListener('mozpointerlockchange', () => this.onPointerLockChange());
    document.addEventListener('webkitpointerlockchange', () => this.onPointerLockChange());
    
    // Adicionar eventos do mouse
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    
    // Adicionar eventos do teclado
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
    
    // Eventos para dispositivos móveis (controles touch)
    this.setupMobileControls();
    
    // Em dispositivos móveis, definir isLocked como true por padrão
    if (this.isMobile) {
      this.isLocked = true;
      console.log("Dispositivo móvel detectado, controles touch ativados");
    }
  }
  
  lock() {
    if (this.isMobile) {
      this.isLocked = true;
      return;
    }
    
    this.domElement.requestPointerLock = 
      this.domElement.requestPointerLock || 
      this.domElement.mozRequestPointerLock ||
      this.domElement.webkitRequestPointerLock;
    
    if (this.domElement.requestPointerLock) {
      this.domElement.requestPointerLock();
    }
  }
  
  unlock() {
    document.exitPointerLock = 
      document.exitPointerLock || 
      document.mozExitPointerLock ||
      document.webkitExitPointerLock;
    
    if (document.exitPointerLock) {
      document.exitPointerLock();
    }
  }
  
  onPointerLockChange() {
    this.isLocked = 
      document.pointerLockElement === this.domElement ||
      document.mozPointerLockElement === this.domElement ||
      document.webkitPointerLockElement === this.domElement;
  }
  
  onMouseMove(event) {
    if (!this.isLocked) return;
    
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    
    // Atualizar ângulos da câmera
    this.yaw -= movementX * this.mouseSensitivity;
    this.pitch -= movementY * this.mouseSensitivity;
    
    // Limitar o ângulo de pitch (evitar virar a câmera de cabeça para baixo)
    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    
    // Aplicar rotação à câmera
    this.updateCameraRotation();
  }
  
  updateCameraRotation() {
    // Aplicar rotação usando quaternions para evitar gimbal lock
    this.camera.quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
  }
  
  onKeyDown(event) {
    this.updateKeyState(event.code, true);
  }
  
  onKeyUp(event) {
    this.updateKeyState(event.code, false);
  }
  
  updateKeyState(code, pressed) {
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = pressed;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = pressed;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = pressed;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = pressed;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.run = pressed;
        break;
      case 'Space':
        if (pressed && this.isOnGround) {
          this.keys.jump = true;
        } else {
          this.keys.jump = false;
        }
        break;
    }
  }
  
  setupMobileControls() {
    if (!this.isMobile) return;
    
    console.log("Configurando controles para dispositivo móvel");
    
    // Criar elementos de controle no DOM
    this.createMobileControlElements();
    
    // Adicionar eventos de toque
    this.addTouchEventListeners();
  }
  
  createMobileControlElements() {
    // Container para controles móveis
    const mobileControls = document.createElement('div');
    mobileControls.id = 'mobile-controls';
    mobileControls.className = 'mobile-controls';
    
    // Joystick para movimento
    const joystickContainer = document.createElement('div');
    joystickContainer.id = 'joystick-container';
    joystickContainer.className = 'joystick-container';
    
    const joystickBase = document.createElement('div');
    joystickBase.id = 'joystick-base';
    joystickBase.className = 'joystick-base';
    
    const joystickThumb = document.createElement('div');
    joystickThumb.id = 'joystick-thumb';
    joystickThumb.className = 'joystick-thumb';
    
    joystickBase.appendChild(joystickThumb);
    joystickContainer.appendChild(joystickBase);
    
    // Botão de pulo
    const jumpButton = document.createElement('div');
    jumpButton.id = 'jump-button';
    jumpButton.className = 'mobile-button';
    jumpButton.textContent = 'PULAR';
    
    // Dica sobre o controle da câmera
    const cameraHint = document.createElement('div');
    cameraHint.className = 'camera-control-hint';
    cameraHint.textContent = 'Deslize o lado direito da tela para olhar ao redor';
    
    // Adicionar controles ao container
    mobileControls.appendChild(joystickContainer);
    mobileControls.appendChild(jumpButton);
    mobileControls.appendChild(cameraHint);
    
    // Adicionar ao DOM
    document.body.appendChild(mobileControls);
    
    // Salvar referências
    this.mobileControls = {
      container: mobileControls,
      joystickContainer: joystickContainer,
      joystickBase: joystickBase,
      joystickThumb: joystickThumb,
      jumpButton: jumpButton,
      cameraHint: cameraHint
    };
    
    // Ocultar a dica após alguns segundos
    setTimeout(() => {
      cameraHint.style.opacity = '0';
      
      // Remover após a transição
      setTimeout(() => {
        cameraHint.style.display = 'none';
      }, 1000);
    }, 5000);
    
    // Adicionar estilos CSS
    this.addMobileControlsStyles();
  }
  
  addMobileControlsStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .mobile-controls {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 40%; /* Altura da área de controles */
        z-index: 100;
        pointer-events: none;
      }
      
      /* Joystick posicionado no canto inferior esquerdo */
      .joystick-container {
        position: absolute;
        bottom: 20px;
        left: 20px;
        width: 130px; /* Tamanho ajustado */
        height: 130px; /* Tamanho ajustado */
        pointer-events: auto;
      }
      
      .joystick-base {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(41, 128, 185, 0.6); /* Azul mais escuro */
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid rgba(52, 152, 219, 0.9); /* Borda azul mais visível */
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); /* Sombra para destacar */
      }
      
      .joystick-thumb {
        width: 40%;
        height: 40%;
        background-color: rgba(52, 152, 219, 0.9); /* Azul mais forte */
        border-radius: 50%;
        pointer-events: none;
        border: 2px solid rgba(255, 255, 255, 0.8); /* Borda branca para contraste */
      }
      
      /* Botão de pulo posicionado no canto inferior direito */
      .mobile-button {
        position: absolute;
        bottom: 20px;
        right: 20px;
        width: 100px; /* Tamanho ajustado */
        height: 100px; /* Tamanho ajustado */
        background-color: rgba(46, 204, 113, 0.7); /* Verde mais escuro */
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        pointer-events: auto;
        user-select: none;
        border: 3px solid rgba(39, 174, 96, 0.9); /* Borda verde mais visível */
        color: white;
        font-size: 16px; /* Texto ajustado */
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); /* Sombra para destacar */
      }
      
      .mobile-button:active {
        background-color: rgba(39, 174, 96, 0.9); /* Verde mais escuro ao pressionar */
        transform: scale(0.95); /* Efeito de pressionar */
      }
      
      .camera-control-hint {
        position: absolute;
        top: 20px;
        right: 20px;
        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 14px;
        opacity: 0.8;
        pointer-events: none;
        transition: opacity 1s ease-in-out;
      }
      
      /* Estilo para o chat e menus em dispositivos móveis */
      @media (max-width: 768px) {
        /* Reposicionar chat para evitar sobreposição com os controles */
        #chat-container {
          bottom: 160px !important; /* Posicionar acima do joystick */
          left: 10px !important;
          width: calc(100% - 20px) !important;
          max-height: 160px !important;
        }
        
        /* Reposicionar menu de interação para evitar sobreposição */
        #interaction-prompt {
          bottom: 160px !important; /* Posicionar acima do botão de pulo */
          left: 50% !important;
          transform: translateX(-50%) !important;
          max-width: 90% !important;
        }
        
        /* Reduzir tamanho dos botões de interação para melhor ajuste */
        .interaction-options button {
          padding: 8px 12px !important;
          font-size: 14px !important;
          margin: 0 3px !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  addTouchEventListeners() {
    // Evento de toque no joystick
    const joystickBase = this.mobileControls.joystickBase;
    joystickBase.addEventListener('touchstart', (e) => this.onJoystickStart(e));
    joystickBase.addEventListener('touchmove', (e) => this.onJoystickMove(e));
    joystickBase.addEventListener('touchend', (e) => this.onJoystickEnd(e));
    joystickBase.addEventListener('touchcancel', (e) => this.onJoystickEnd(e));
    
    // Evento de toque no botão de pulo
    const jumpButton = this.mobileControls.jumpButton;
    jumpButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      console.log("Botão de pulo: touchstart");
      this.onJumpButtonPress();
    });
    jumpButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      console.log("Botão de pulo: touchend");
    });
    
    // Evento de toque na tela para controle da câmera
    this.domElement.addEventListener('touchstart', (e) => this.onCameraControlStart(e));
    this.domElement.addEventListener('touchmove', (e) => this.onCameraControlMove(e));
    this.domElement.addEventListener('touchend', (e) => this.onCameraControlEnd(e));
    this.domElement.addEventListener('touchcancel', (e) => this.onCameraControlEnd(e));
  }
  
  onJoystickStart(event) {
    event.preventDefault();
    console.log("Joystick: touchstart");
    const touch = event.touches[0];
    const rect = this.mobileControls.joystickBase.getBoundingClientRect();
    
    this.joystick.active = true;
    this.joystick.startX = rect.left + rect.width / 2;
    this.joystick.startY = rect.top + rect.height / 2;
    
    this.onJoystickMove(event);
  }
  
  onJoystickMove(event) {
    if (!this.joystick.active) return;
    event.preventDefault();
    
    console.log("Joystick: touchmove");
    const touch = event.touches[0];
    
    // Calcular distância do centro
    let deltaX = touch.clientX - this.joystick.startX;
    let deltaY = touch.clientY - this.joystick.startY;
    
    // Limitar distância ao raio do joystick
    const maxDistance = this.mobileControls.joystickBase.offsetWidth / 2;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > maxDistance) {
      const scale = maxDistance / distance;
      deltaX *= scale;
      deltaY *= scale;
    }
    
    // Atualizar posição visual do controle
    this.mobileControls.joystickThumb.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    
    // Normalizar valores para -1 a 1
    this.joystick.deltaX = deltaX / maxDistance;
    this.joystick.deltaY = deltaY / maxDistance;
    
    // Diminuir o limite para facilitar o movimento (0.2 em vez de 0.3)
    this.keys.forward = this.joystick.deltaY < -0.2;
    this.keys.backward = this.joystick.deltaY > 0.2;
    this.keys.left = this.joystick.deltaX < -0.2;
    this.keys.right = this.joystick.deltaX > 0.2;
    
    console.log(`Joystick delta: X=${this.joystick.deltaX.toFixed(2)}, Y=${this.joystick.deltaY.toFixed(2)}`);
  }
  
  onJoystickEnd(event) {
    event.preventDefault();
    this.joystick.active = false;
    
    // Resetar posição visual do joystick
    this.mobileControls.joystickThumb.style.transform = 'translate(0px, 0px)';
    
    // Resetar movimento
    this.keys.forward = false;
    this.keys.backward = false;
    this.keys.left = false;
    this.keys.right = false;
    
    this.joystick.deltaX = 0;
    this.joystick.deltaY = 0;
  }
  
  onJumpButtonPress() {
    console.log("Botão de pulo pressionado");
    
    // Em dispositivos móveis, sempre permitir pular se estiver no chão
    if (this.isOnGround) {
      console.log("Iniciando pulo, player está no chão");
      this.velocity.y = this.jumpStrength;
      this.isOnGround = false;
      this.keys.jump = true;
      
      // Resetar o sinalizador de pulo após 100ms para permitir pulos repetidos
      setTimeout(() => {
        this.keys.jump = false;
      }, 100);
    } else {
      console.log("Pulo ignorado, player não está no chão");
    }
  }
  
  onCameraControlStart(event) {
    // Ignorar toques na área de controles
    if (event.target.closest('#mobile-controls')) {
      return;
    }
    
    // Apenas processa se o toque for na metade direita da tela (área de controle da câmera)
    const touch = event.touches[0];
    if (touch.clientX > window.innerWidth / 2) {
      this.cameraControl.active = true;
      this.cameraControl.lastX = touch.clientX;
      this.cameraControl.lastY = touch.clientY;
      event.preventDefault();
    }
  }
  
  onCameraControlMove(event) {
    if (!this.cameraControl.active) return;
    
    const touch = event.touches[0];
    
    // Calcular delta
    const movementX = this.cameraControl.lastX - touch.clientX;
    const movementY = this.cameraControl.lastY - touch.clientY;
    
    // Atualizar última posição
    this.cameraControl.lastX = touch.clientX;
    this.cameraControl.lastY = touch.clientY;
    
    // Atualizar ângulos da câmera (com sensibilidade para toque)
    this.yaw -= movementX * this.touchSensitivity;
    this.pitch -= movementY * this.touchSensitivity;
    
    // Limitar o ângulo de pitch
    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    
    // Aplicar rotação à câmera
    this.updateCameraRotation();
    
    event.preventDefault();
  }
  
  onCameraControlEnd(event) {
    this.cameraControl.active = false;
  }
  
  update(deltaTime) {
    // Remover qualquer verificação de isLocked para mobile para garantir que os controles funcionem
    if (!this.isMobile && !this.isLocked) return;
    
    // Debug de movimento
    if (this.keys.forward || this.keys.backward || this.keys.left || this.keys.right) {
      console.log("Movimento: ", 
                  this.keys.forward ? "Frente " : "", 
                  this.keys.backward ? "Trás " : "", 
                  this.keys.left ? "Esquerda " : "", 
                  this.keys.right ? "Direita" : "");
    }
    
    if (this.keys.jump) {
      console.log("Tecla de pulo ativa");
    }
    
    // Calcular velocidade baseada em entrada
    const actualSpeed = this.keys.run ? this.moveSpeed * 1.5 : this.moveSpeed;
    
    // Direção para frente da câmera (ignorando eixo Y)
    const cameraDirection = new THREE.Vector3();
    this.camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    // Direção para o lado (perpendicular à direção da câmera)
    const cameraSide = new THREE.Vector3(-cameraDirection.z, 0, cameraDirection.x);
    
    // Resetar velocidade horizontal
    this.velocity.x = 0;
    this.velocity.z = 0;
    
    // Aplicar movimento baseado em entrada
    if (this.keys.forward) {
      this.velocity.x += cameraDirection.x * actualSpeed;
      this.velocity.z += cameraDirection.z * actualSpeed;
    }
    if (this.keys.backward) {
      this.velocity.x -= cameraDirection.x * actualSpeed;
      this.velocity.z -= cameraDirection.z * actualSpeed;
    }
    if (this.keys.left) {
      this.velocity.x += cameraSide.x * actualSpeed;
      this.velocity.z += cameraSide.z * actualSpeed;
    }
    if (this.keys.right) {
      this.velocity.x -= cameraSide.x * actualSpeed;
      this.velocity.z -= cameraSide.z * actualSpeed;
    }
    
    // Normalizar movimento diagonal para evitar velocidade extra
    if (this.velocity.x !== 0 && this.velocity.z !== 0) {
      this.velocity.x *= 0.7071; // 1 / sqrt(2)
      this.velocity.z *= 0.7071;
    }
    
    // Aplicar pulo - simplificado para garantir que funcione corretamente em mobile
    if (this.keys.jump && this.isOnGround) {
      console.log("Aplicando pulo");
      this.velocity.y = this.jumpStrength;
      this.isOnGround = false;
      this.keys.jump = false; // Reset imediato para evitar pulos repetidos
    }
    
    // Mostrar posição atual para depuração
    if (this.isMobile && (this.velocity.x !== 0 || this.velocity.z !== 0 || this.velocity.y !== 0)) {
      console.log("Posição:", 
                  this.camera.position.x.toFixed(2), 
                  this.camera.position.y.toFixed(2), 
                  this.camera.position.z.toFixed(2),
                  "Vel:", 
                  this.velocity.x.toFixed(2), 
                  this.velocity.y.toFixed(2), 
                  this.velocity.z.toFixed(2));
    }
    
    // Aplicar gravidade se não estiver no chão
    if (!this.isOnGround) {
      this.velocity.y -= this.gravity * deltaTime;
    }
    
    // Mover a câmera
    this.camera.position.x += this.velocity.x * deltaTime;
    this.camera.position.y += this.velocity.y * deltaTime;
    this.camera.position.z += this.velocity.z * deltaTime;
    
    // Simples detecção de colisão com o chão
    if (this.camera.position.y < 1.7) { // Altura dos olhos
      this.camera.position.y = 1.7;
      this.velocity.y = 0;
      this.isOnGround = true;
    }
    
    // Restringir movimento do jogador dentro dos limites do mundo
    const WORLD_LIMIT = 100;
    if (Math.abs(this.camera.position.x) > WORLD_LIMIT) {
      this.camera.position.x = Math.sign(this.camera.position.x) * WORLD_LIMIT;
    }
    if (Math.abs(this.camera.position.z) > WORLD_LIMIT) {
      this.camera.position.z = Math.sign(this.camera.position.z) * WORLD_LIMIT;
    }
  }
  
  // Métodos para obter informações de posição/rotação
  getPosition() {
    return this.camera.position;
  }
  
  getRotation() {
    return { y: this.yaw };
  }
  
  getDirection() {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return {
      x: direction.x,
      y: direction.y,
      z: direction.z
    };
  }
}
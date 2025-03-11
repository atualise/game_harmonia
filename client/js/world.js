class World {
  constructor() {
    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // Player avatars
    this.avatars = {};
    
    // Visual effects
    this.effects = {};
    
    // Initialize the 3D world
    this.init();
    this.createEnvironment();
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }
  
  init() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
    this.scene.fog = new THREE.Fog(0x87ceeb, 20, 100);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near plane
      1000 // Far plane
    );
    this.camera.position.y = 1.7; // Eye height
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('game-canvas'),
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    
    // Add lighting
    this.setupLighting();
  }
  
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    
    // Shadow settings
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    
    this.scene.add(directionalLight);
  }
  
  createEnvironment() {
    // Main ground plane
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3CB371, // Medium sea green
      roughness: 0.8,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Create central plaza
    this.createCentralPlaza();
    
    // Create buildings around the plaza
    this.createBuildings();
    
    // Add some trees and decoration
    this.createDecoration();
  }
  
  createCentralPlaza() {
    // Plaza floor
    const plazaGeometry = new THREE.CircleGeometry(20, 32);
    const plazaMaterial = new THREE.MeshStandardMaterial({
      color: 0xDCDCDC, // Light gray
      roughness: 0.5,
      metalness: 0.1
    });
    const plaza = new THREE.Mesh(plazaGeometry, plazaMaterial);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.05; // Slightly above ground
    plaza.receiveShadow = true;
    this.scene.add(plaza);
    
    // Central fountain
    const fountainBase = new THREE.CylinderGeometry(3, 4, 1, 32);
    const fountainMid = new THREE.CylinderGeometry(1.5, 2, 1, 32);
    const fountainTop = new THREE.CylinderGeometry(0.5, 1, 0.5, 32);
    
    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.8,
      metalness: 0.2
    });
    
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x4682B4, // Steel blue
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.8
    });
    
    const base = new THREE.Mesh(fountainBase, stoneMaterial);
    base.position.set(0, 0.5, 0);
    base.receiveShadow = true;
    base.castShadow = true;
    this.scene.add(base);
    
    const mid = new THREE.Mesh(fountainMid, stoneMaterial);
    mid.position.set(0, 1.5, 0);
    mid.receiveShadow = true;
    mid.castShadow = true;
    this.scene.add(mid);
    
    const top = new THREE.Mesh(fountainTop, stoneMaterial);
    top.position.set(0, 2.25, 0);
    top.receiveShadow = true;
    top.castShadow = true;
    this.scene.add(top);
    
    // Water surface
    const waterGeometry = new THREE.CircleGeometry(2.8, 32);
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 1.05;
    this.scene.add(water);
  }
  
  createBuildings() {
    // District portals - 4 buildings at cardinal directions
    const districts = [
      { name: 'Art', position: { x: 0, z: -30 }, color: 0xE74C3C }, // North - Red
      { name: 'Philosophy', position: { x: 30, z: 0 }, color: 0x3498DB }, // East - Blue
      { name: 'Science', position: { x: 0, z: 30 }, color: 0x2ECC71 }, // South - Green
      { name: 'Meditation', position: { x: -30, z: 0 }, color: 0xF1C40F } // West - Yellow
    ];
    
    districts.forEach(district => {
      this.createDistrictPortal(district);
    });
  }
  
  createDistrictPortal(district) {
    // Base of the building
    const baseGeometry = new THREE.BoxGeometry(10, 8, 10);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: district.color,
      roughness: 0.7,
      metalness: 0.3
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(district.position.x, 4, district.position.z);
    base.castShadow = true;
    base.receiveShadow = true;
    this.scene.add(base);
    
    // Add a portal entrance
    const portalGeometry = new THREE.BoxGeometry(4, 6, 0.5);
    const portalMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.3,
      metalness: 0.7,
      emissive: district.color,
      emissiveIntensity: 0.5
    });
    
    // Determine portal orientation
    let portalPos = { ...district.position };
    let portalRot = 0;
    
    if (district.position.x === 0 && district.position.z < 0) {
      // North
      portalPos.z += 5;
      portalRot = 0;
    } else if (district.position.x > 0 && district.position.z === 0) {
      // East
      portalPos.x -= 5;
      portalRot = Math.PI / 2;
    } else if (district.position.x === 0 && district.position.z > 0) {
      // South
      portalPos.z -= 5;
      portalRot = Math.PI;
    } else {
      // West
      portalPos.x += 5;
      portalRot = -Math.PI / 2;
    }
    
    const portal = new THREE.Mesh(portalGeometry, portalMaterial);
    portal.position.set(portalPos.x, 3, portalPos.z);
    portal.rotation.y = portalRot;
    portal.castShadow = true;
    this.scene.add(portal);
    
    // Sign with district name
    // Using Three.js text would require loading fonts, so we'll use a simple sign for this example
    const signGeometry = new THREE.BoxGeometry(4, 1, 0.1);
    const signMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.5,
      metalness: 0.1
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(portalPos.x, 7, portalPos.z);
    sign.rotation.y = portalRot;
    sign.castShadow = true;
    this.scene.add(sign);
  }
  
  createDecoration() {
    // Add trees around the plaza
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 25;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      
      this.createTree(x, z);
    }
    
    // Add benches around the fountain
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 10;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      
      this.createBench(x, z, angle);
    }
  }
  
  createTree(x, z) {
    // Tree trunk
    const trunkGeometry = new THREE.BoxGeometry(0.5, 2, 0.5);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513, // Saddle brown
      roughness: 0.9,
      metalness: 0.1
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, 1, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    this.scene.add(trunk);
    
    // Tree foliage - using voxel-like blocks for a pixelated look
    const foliageColors = [0x228B22, 0x006400, 0x2E8B57]; // Different greens
    
    for (let i = 0; i < 3; i++) {
      const size = 3 - i * 0.5;
      const height = 2 + i * 1.5;
      
      const foliageGeometry = new THREE.BoxGeometry(size, size, size);
      const foliageMaterial = new THREE.MeshStandardMaterial({
        color: foliageColors[i % foliageColors.length],
        roughness: 0.8,
        metalness: 0.1
      });
      
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.set(x, height, z);
      foliage.castShadow = true;
      foliage.receiveShadow = true;
      this.scene.add(foliage);
    }
  }
  
  createBench(x, z, rotation) {
    // Bench base
    const baseGeometry = new THREE.BoxGeometry(2, 0.5, 0.7);
    const benchMaterial = new THREE.MeshStandardMaterial({
      color: 0xA0522D, // Sienna
      roughness: 0.9,
      metalness: 0.1
    });
    
    const base = new THREE.Mesh(baseGeometry, benchMaterial);
    base.position.set(x, 0.25, z);
    base.rotation.y = rotation;
    base.castShadow = true;
    base.receiveShadow = true;
    this.scene.add(base);
    
    // Bench back
    const backGeometry = new THREE.BoxGeometry(2, 1, 0.2);
    const back = new THREE.Mesh(backGeometry, benchMaterial);
    back.position.set(
      x + Math.sin(rotation) * 0.25,
      0.75,
      z + Math.cos(rotation) * 0.25
    );
    back.rotation.y = rotation;
    back.castShadow = true;
    back.receiveShadow = true;
    this.scene.add(back);
  }
  
  // Add a player avatar to the world
  addPlayerAvatar(playerId, avatar, position) {
    const mesh = avatar.createMesh();
    mesh.position.copy(position);
    this.scene.add(mesh);
    
    this.avatars[playerId] = {
      mesh,
      avatar
    };
    
    return mesh;
  }
  
  // Remove a player avatar
  removePlayerAvatar(playerId) {
    if (this.avatars[playerId]) {
      this.scene.remove(this.avatars[playerId].mesh);
      delete this.avatars[playerId];
    }
  }
  
  // Update player avatar position
  updatePlayerAvatar(playerId, position, rotation) {
    if (this.avatars[playerId] && this.avatars[playerId].mesh) {
      const mesh = this.avatars[playerId].mesh;
      
      // Certifique-se de que a posição é um Vector3
      const targetPosition = position instanceof THREE.Vector3 
        ? position 
        : new THREE.Vector3(position.x, position.y, position.z);
      
      // Use lerp para movimento mais suave
      mesh.position.lerp(targetPosition, 0.3);
      
      // Atualizar rotação (apenas eixo Y por enquanto)
      if (rotation && rotation.y !== undefined) {
        mesh.rotation.y = rotation.y;
      }
      
      // Depuração
      console.log(`Avatar do jogador ${playerId} atualizado para posição:`, 
                  mesh.position.x.toFixed(2), 
                  mesh.position.y.toFixed(2), 
                  mesh.position.z.toFixed(2));
    } else {
      console.warn(`Tentativa de atualizar avatar inexistente: ${playerId}`);
    }
  }
  
  // Show observe effect around a player
  showObserveEffect(playerId) {
    if (this.avatars[playerId]) {
      const mesh = this.avatars[playerId].mesh;
      
      // Create a glowing ring effect
      const ringGeometry = new THREE.RingGeometry(1, 1.2, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(mesh.position);
      ring.position.y = 0.1;
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      
      // Store effect reference
      if (!this.effects[playerId]) {
        this.effects[playerId] = [];
      }
      this.effects[playerId].push(ring);
      
      // Remove after a few seconds
      setTimeout(() => {
        if (ring.parent) {
          this.scene.remove(ring);
        }
        if (this.effects[playerId]) {
          const index = this.effects[playerId].indexOf(ring);
          if (index !== -1) {
            this.effects[playerId].splice(index, 1);
          }
        }
      }, 3000);
    }
  }
  
  // Show greet effect
  showGreetEffect(playerId) {
    if (this.avatars[playerId]) {
      const mesh = this.avatars[playerId].mesh;
      
      // Create a particle effect
      const particles = new THREE.Group();
      
      for (let i = 0; i < 10; i++) {
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        const material = new THREE.MeshBasicMaterial({
          color: 0xFFFF00,
          transparent: true,
          opacity: 0.8
        });
        
        const particle = new THREE.Mesh(geometry, material);
        
        // Random position around the avatar
        particle.position.set(
          mesh.position.x + (Math.random() - 0.5) * 0.5,
          mesh.position.y + 1 + Math.random() * 0.5,
          mesh.position.z + (Math.random() - 0.5) * 0.5
        );
        
        // Store initial position for animation
        particle.userData.initialY = particle.position.y;
        particle.userData.speed = 0.01 + Math.random() * 0.02;
        
        particles.add(particle);
      }
      
      this.scene.add(particles);
      
      // Store effect reference
      if (!this.effects[playerId]) {
        this.effects[playerId] = [];
      }
      this.effects[playerId].push(particles);
      
      // Animation
      const animateParticles = () => {
        particles.children.forEach(particle => {
          particle.position.y += particle.userData.speed;
          particle.material.opacity -= 0.01;
          
          if (particle.position.y > particle.userData.initialY + 1) {
            particle.position.y = particle.userData.initialY;
            particle.material.opacity = 0.8;
          }
        });
        
        if (particles.parent) {
          requestAnimationFrame(animateParticles);
        }
      };
      
      animateParticles();
      
      // Remove after a few seconds
      setTimeout(() => {
        if (particles.parent) {
          this.scene.remove(particles);
        }
        if (this.effects[playerId]) {
          const index = this.effects[playerId].indexOf(particles);
          if (index !== -1) {
            this.effects[playerId].splice(index, 1);
          }
        }
      }, 5000);
    }
  }
  
  // Update world
  update(delta) {
    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }
  
  // Handle window resize
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
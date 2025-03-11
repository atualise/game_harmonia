class UI {
  constructor(game) {
    this.game = game;
    
    // Elementos da UI
    this.interactionPrompt = document.getElementById('interaction-prompt');
    this.chatContainer = document.getElementById('chat-container');
    this.chatMessages = document.getElementById('chat-messages');
    this.chatInput = document.getElementById('chat-input');
    
    // Estado da UI
    this.currentInteraction = null;
    
    // Adicionar estilos de notificação
    this.addNotificationStyles();
    
    // Verificar se estamos em um dispositivo móvel
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Adicionar botão para mostrar/esconder chat em dispositivos móveis
    if (this.isMobile) {
      this.addChatToggleButton();
    }
  }
  
  // Coletar dados do formulário de perfil
  collectProfileData() {
    const form = document.getElementById('profile-form');
    
    // Obter valores de espiritualidade
    const spiritualOptions = form.querySelectorAll('input[name="spiritual"]');
    let spiritual = null;
    spiritualOptions.forEach(opt => {
      if (opt.checked) {
        spiritual = opt.value;
      }
    });
    
    // Obter valor político
    const political = form.querySelector('input[name="political"]').value;
    
    // Obter valores de personalidade
    const personalityOptions = form.querySelectorAll('input[name="personality"]:checked');
    const personality = Array.from(personalityOptions).map(opt => opt.value);
    
    // Obter nome
    const name = form.querySelector('input[name="name"]').value;
    
    return {
      spiritual,
      political,
      personality,
      name
    };
  }
  
  // Mostrar o prompt de interação com um jogador
  showInteractionPrompt(playerId) {
    this.currentInteraction = playerId;
    this.interactionPrompt.classList.remove('hidden');
  }
  
  // Esconder o prompt de interação
  hideInteractionPrompt() {
    this.interactionPrompt.classList.add('hidden');
    this.currentInteraction = null;
  }
  
  // Mostrar chat
  showChat() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.classList.remove('hidden');
    this.chatInput.focus();
    
    // Indicação visual no botão de toggle (se estiver em mobile)
    if (this.isMobile) {
      const toggleButton = document.getElementById('chat-toggle-btn');
      if (toggleButton) {
        toggleButton.style.backgroundColor = 'rgba(46, 204, 113, 0.8)';
      }
    }
  }
  
  // Esconder chat
  hideChat() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.classList.add('hidden');
    
    // Indicação visual no botão de toggle (se estiver em mobile)
    if (this.isMobile) {
      const toggleButton = document.getElementById('chat-toggle-btn');
      if (toggleButton) {
        toggleButton.style.backgroundColor = 'rgba(52, 152, 219, 0.7)';
      }
    }
  }
  
  // Adicionar mensagem ao chat
  addChatMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');
    
    const senderElement = document.createElement('span');
    senderElement.classList.add('chat-sender');
    senderElement.textContent = sender + ': ';
    
    const textElement = document.createElement('span');
    textElement.classList.add('chat-text');
    textElement.textContent = message;
    
    messageElement.appendChild(senderElement);
    messageElement.appendChild(textElement);
    
    this.chatMessages.appendChild(messageElement);
    
    // Scroll para a última mensagem
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
  
  // Mostrar notificação
  showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    notification.textContent = message;
    
    // Adicionar ao DOM
    document.body.appendChild(notification);
    
    // Remover após alguns segundos
    setTimeout(() => {
      notification.classList.add('notification-hide');
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 3000);
  }
  
  // Mostrar/esconder carregamento
  showLoading() {
    // Implementar um spinner de carregamento aqui
  }
  
  hideLoading() {
    // Remover spinner de carregamento
  }
  
  // Adicionar estilos de notificação dinamicamente
  addNotificationStyles() {
    // Criar elemento de estilo
    const style = document.createElement('style');
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        transform: translateX(0);
        transition: transform 0.5s ease-in-out;
      }
      
      .notification-info {
        background-color: #3498db;
      }
      
      .notification-success {
        background-color: #2ecc71;
      }
      
      .notification-warning {
        background-color: #f39c12;
      }
      
      .notification-error {
        background-color: #e74c3c;
      }
      
      .notification-hide {
        transform: translateX(120%);
      }
      
      .chat-message {
        margin-bottom: 8px;
      }
      
      .chat-sender {
        font-weight: bold;
      }
      
      .chat-text {
        word-break: break-word;
      }
    `;
    
    // Adicionar ao head
    document.head.appendChild(style);
  }
  
  // Adicionar botão para mostrar/esconder chat em dispositivos móveis
  addChatToggleButton() {
    // Criar botão de toggle para o chat
    const toggleButton = document.createElement('button');
    toggleButton.id = 'chat-toggle-btn';
    toggleButton.innerHTML = '💬';
    toggleButton.className = 'mobile-chat-toggle';
    
    // Adicionar evento de clique para mostrar/esconder chat
    toggleButton.addEventListener('click', () => {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer.classList.contains('hidden')) {
        this.showChat();
      } else {
        this.hideChat();
      }
    });
    
    // Adicionar ao corpo do documento
    document.body.appendChild(toggleButton);
    
    // Adicionar estilos CSS para o botão
    const style = document.createElement('style');
    style.textContent = `
      .mobile-chat-toggle {
        position: fixed;
        top: 20px;
        left: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: rgba(52, 152, 219, 0.7);
        color: white;
        font-size: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        z-index: 150;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
      }
      
      .mobile-chat-toggle:active {
        background-color: rgba(52, 152, 219, 0.9);
        transform: scale(0.95);
      }
      
      @media (max-width: 768px) {
        #chat-container.hidden {
          display: none !important;
        }
        
        #chat-container {
          transition: opacity 0.3s ease-in-out;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
}
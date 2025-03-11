# HARMONIA
## Mundo Virtual de Conexões

---

## CONCEITO PRINCIPAL

Um mundo virtual 3D em estilo voxel onde os jogadores exploram um ambiente compartilhado e encontram outros com visões de mundo semelhantes. Os avatares refletem visualmente suas identidades culturais, políticas e pessoais através de um sistema de representação visual sutil e não-estereotipado.

---

## INTRODUÇÃO DO JOGADOR

### Fase 1: Criação de Perfil
- O jogador responde a um questionário curto e não-invasivo sobre suas crenças, valores e identidade
- As respostas determinam características visuais iniciais do avatar:
  - Paleta de cores predominante
  - Acessórios e detalhes
  - Elementos de vestimenta e aparência
- O sistema não revela explicitamente quais elementos visuais correspondem a quais traços
- Enfoque na expressão autêntica sem reforçar estereótipos

### Fase 2: Tutorial
- O jogador aprende a se movimentar no espaço 3D (controles FPS)
- Introdução aos gestos sociais básicos:
  - Acenar
  - Cumprimentar
  - Observar
  - Desviar
- Explicação do sistema de "ressonância" - um efeito visual sutil que aparece quando jogadores compatíveis estão próximos

---

## O MUNDO DO JOGO

### Cenário Principal: Ágora Central
- Uma praça central com arquitetura neutra onde todos começam
- Iluminação dinâmica que muda suavemente ao longo do dia virtual
- Portais/caminhos para diferentes "distritos" temáticos
- Elementos interativos compartilhados (bancos, fontes, esculturas)

### Distritos Temáticos
- **Distrito da Arte**:
  - Galerias virtuais
  - Espaços para performances
  - Ateliês para criação colaborativa
- **Distrito da Filosofia**:
  - Anfiteatros para debates
  - Bibliotecas interativas
  - Jardins para caminhadas contemplativas
- **Distrito da Ciência**:
  - Laboratórios virtuais
  - Observatório astronômico
  - Espaços de experimentação
- **Jardins da Meditação**:
  - Ambientes naturais diversos
  - Espaços para conversas mais íntimas
  - Áreas de silêncio e reflexão

---

## MECÂNICAS DE INTERAÇÃO

### Encontros Casuais
- Ao cruzar com outros jogadores, um sutil efeito de partículas indica nível de compatibilidade
- Opções de interação:
  1. **"Observar"**: Modo contemplativo que destaca visualmente avatares mais compatíveis
  2. **"Cumprimentar"**: Inicia possibilidade de chat por texto ou áudio
  3. **"Desviar"**: Sinaliza desinteresse de forma educada, sem ser ofensivo

### Sistema de Amizades
- Após conversas positivas, jogadores podem adicionar outros como "conexões"
- Conexões frequentes formam "círculos sociais" que desbloqueiam áreas exclusivas do mapa
- Possibilidade de criar "encontros marcados" em locais específicos do mundo

### Comunicação
- Chat de texto com opção de tradução automática
- Mensagens de áudio curtas
- Emotes e gestos expressivos
- Sistema de "ideias compartilhadas" - conceitos que emergem de conversas frequentes

---

## PROGRESSÃO

### Descobertas Pessoais
- Quanto mais interações significativas, mais elementos customizáveis são desbloqueados
- Áreas "ocultas" do mapa que só são reveladas ao encontrar pessoas com perfis específicos
- "Insígnias de harmonia" concedidas por promover conexões positivas

### Eventos Temporários
- **"Assembleias"** semanais com temas específicos para discussão
- **"Festivais"** culturais que celebram diferentes tradições
- **"Expedições"** para explorar novos distritos temporários
- **"Simpósios"** focados em trocas de conhecimento

---

## IMPLEMENTAÇÃO TÉCNICA

### Avatar e Visualização
- Modelos voxel simples usando Three.js com shaders customizados
- Sistema de partículas para efeitos de "ressonância"
- Iluminação dinâmica para criar ambientes imersivos
- Otimização para dispositivos móveis e desktop

### Sistema de Compatibilidade
- Algoritmo baseado em distância euclidiana entre os vetores de características dos perfis
- Ponderação dinâmica que evolui com base nas interações do jogador
- Sistema não-binário que reconhece múltiplas dimensões de compatibilidade

### Interações em Tempo Real
- Socket.IO para transmissão em tempo real de gestos e comunicações
- Rooms dinâmicas para otimizar a comunicação por proximidade
- Sistema de cache para reduzir latência em mensagens frequentes

### Otimização de Performance
- Spatial hash grid para mostrar apenas jogadores próximos
- Level of Detail (LOD) para reduzir complexidade de objetos distantes
- Carregamento progressivo de texturas e modelos
- Compressão de dados para comunicação eficiente

---

## VALORES E PRINCÍPIOS

- Promover conexões autênticas sem reforçar polarizações
- Celebrar diversidade sem recorrer a estereótipos simplificados
- Criar um espaço seguro para expressão e descoberta
- Incentivar curiosidade genuína sobre diferentes perspectivas
- Valorizar a qualidade das interações sobre a quantidade

---

*© 2025 - Todos os direitos reservados*

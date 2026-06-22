import type { TranslationDict } from './locale';

const ptBr: TranslationDict = {
  app: {
    title: 'Stance Up',
    eyebrow: 'Coach de postura Muay Thai',
    lede: 'Use sua câmera localmente para verificar os fundamentos da postura e receber dicas claras para seu próximo treino.',
    startButton: 'Iniciar Configuração da Câmera',
    privacyNote: 'Os quadros da câmera são processados localmente no seu navegador. Nenhum vídeo é enviado ou armazenado.',
    endSession: 'Encerrar Sessão',
    collectData: 'Coletar Dados de Golpes',
  },

  setup: {
    heading: 'Configuração da Câmera',
    description: 'Posicione a câmera para capturar seu corpo inteiro no quadro. O processamento é local — nenhum vídeo sai do seu dispositivo.',
    fullBody: 'Corpo inteiro visível',
    handsVisible: 'Mãos visíveis',
    feetVisible: 'Pés visíveis',
    goodLighting: 'Boa iluminação',
    stableCamera: 'Câmera estável',
    stance: 'Postura:',
    orthodox: 'Orthodoxa (esquerda à frente)',
    southpaw: 'Southpaw (direita à frente)',
    autoDetect: 'Detecção automática',
    startingCamera: 'Iniciando câmera…',
    startCamera: 'Iniciar Câmera',
  },

  camera: {
    selectCamera: 'Selecionar câmera',
    stopCamera: 'Parar Câmera',
    failedToStart: 'Falha ao iniciar a câmera',
    errors: {
      permissionDenied: 'Permissão de câmera negada. Permita o acesso à câmera nas configurações do seu navegador.',
      noCamera: 'Nenhuma câmera encontrada. Conecte um dispositivo de câmera.',
      inUse: 'A câmera já está em uso por outro aplicativo.',
      constraints: 'A câmera não atende aos requisitos necessários.',
    },
  },

  scorePanel: {
    stanceAnalysis: 'Análise de postura',
    scoreLabel: '/100',
    confidence: 'Confiança:',
    focusOn: 'Foco em:',
    unknown: '?',
    good: '✓',
    warn: '⚠',
    bad: '✗',
  },

  sessionSummary: {
    heading: 'Resumo da Sessão',
    noData: 'Nenhum dado coletado ainda.',
    close: 'Fechar',
    sessionComplete: 'Sessão Concluída',
    averageScore: 'Pontuação Média',
    avgConfidence: 'Confiança Média',
    duration: 'Duração',
    frames: 'Quadros',
    best: 'Melhor:',
    needsWork: 'Precisa Melhorar:',
    topFocusAreas: 'Principais Áreas de Foco',
    times: 'x',
    done: 'Concluído',
    privacyNote: 'Os dados da sessão são armazenados apenas localmente. Nenhum vídeo ou dado de pose sai do seu dispositivo.',
  },

  metrics: {
    unknownCorrection: 'Mova-se para que ambos os pés fiquem visíveis antes de avaliar este detalhe da postura.',

    baseWidth: {
      label: 'Largura da base',
      unknown: 'Visibilidade insuficiente dos pés ou ombros para avaliar a largura da base.',
      good: 'A largura da sua base está equilibrada para uma postura de Muay Thai.',
      bad: 'Seus pés parecem muito próximos lateralmente.',
      badCorrection: 'Aumente a base para que seus pés não fiquem alinhados e você se sinta mais difícil de empurrar lateralmente.',
      warn: 'Seus pés parecem muito afastados lateralmente.',
      warnCorrection: 'Aproxime um pouco os pés para poder se mover rapidamente sem se sentir preso.',
    },

    stanceLength: {
      label: 'Comprimento da postura',
      unknown: 'Visibilidade insuficiente dos pés ou tronco para avaliar o comprimento da postura.',
      good: 'O comprimento frontal da sua postura parece móvel.',
      bad: 'Sua postura parece muito quadrada frontalmente.',
      badCorrection: 'Recue ligeiramente o pé de trás para não ficar quadrado e poder se mover a partir de uma posição de luta.',
      warn: 'Sua postura parece muito longa frontalmente.',
      warnCorrection: 'Encurte a postura para poder fazer check, teep e passos sem arrastar a perna de trás.',
    },

    kneeSoftness: {
      label: 'Flexão dos joelhos',
      unknown: 'Visibilidade insuficiente do quadril, joelho ou tornozelo para avaliar a flexão dos joelhos.',
      good: 'Seus joelhos parecem levemente flexionados e prontos para se mover.',
      bad: 'Seus joelhos parecem muito esticados para uma postura atlética.',
      badCorrection: 'Flexione os joelhos. Pense em um bounce atlético, não em ficar ereto.',
      warn: 'Sua postura parece mais profunda que o necessário para a movimentação no Muay Thai.',
      warnCorrection: 'Levante um pouco. A postura do Muay Thai deve ser móvel, não um agachamento.',
    },

    guardPosition: {
      label: 'Posição da guarda',
      unknown: 'Visibilidade insuficiente das mãos, cabeça ou ombros para avaliar a posição da guarda.',
      good: 'Suas mãos estão altas o suficiente para proteger a cabeça.',
      badBoth: 'Ambas as mãos estão caindo abaixo da sua linha defensiva.',
      badOne: 'Uma mão está caindo abaixo da sua linha defensiva.',
      badCorrection: 'Mantenha a guarda ativa com as mãos perto da bochecha e da linha do queixo após cada movimento.',
    },

    headPosture: {
      label: 'Postura da cabeça',
      unknown: 'Visibilidade insuficiente da cabeça ou ombros para avaliar a postura da cabeça.',
      good: 'Sua cabeça parece bem posicionada sobre a postura.',
      warn: 'Sua cabeça parece se desviar da linha central da sua postura.',
      warnCorrection: 'Alinhe sua cabeça sobre a postura e mantenha o queixo ligeiramente abaixado em vez de esticar.',
    },

    weightBalance: {
      label: 'Equilíbrio do peso',
      unknown: 'Visibilidade insuficiente do quadril ou tornozelo para avaliar o equilíbrio do peso.',
      good: 'Seu peso parece equilibrado sobre a postura.',
      warn: 'Seu quadril está se deslocando significativamente sobre uma perna.',
      warnCorrection: 'Centralize seu peso sobre a postura para que ambas as pernas possam se mover livremente para checks, teeps e passos.',
    },

    shoulderHipAlignment: {
      label: 'Alinhamento ombro-quadril',
      unknown: 'Visibilidade insuficiente dos ombros ou quadril para avaliar o ângulo da postura.',
      good: 'O ângulo do seu ombro e quadril parece adequado para a postura de Muay Thai.',
      warnSideways: 'Sua postura parece muito lateral.',
      warnSidewaysCorrection: 'Abra-se o suficiente para fazer checks e golpes do lado de trás sem ficar excessivamente de lado.',
      warnSquare: 'Sua postura parece muito quadrada.',
      warnSquareCorrection: 'Angule ligeiramente a postura para que seu lado de trás fique protegido enquanto mantém-se pronto para fazer checks.',
    },
  },

  stability: {
    noData: 'Sem dados',
    needMoreFrames: 'Precisa de mais quadros',
    stable: 'Estável',
    someDrift: 'Algum desvio detectado',
    unstable: 'Instável',
    label: 'Estabilidade:',
  },

  strikes: {
    jab: 'Jab',
    cross: 'Cruzado',
    hook: 'Gancho',
    uppercut: 'Upper',
    roundhouse: 'Roundhouse',
    teep: 'Teep',
    knee: 'Joelhada',
    check: 'Defesa',
  },

  recorder: {
    heading: 'Coleta de Dados de Golpes',
    record: 'Gravar',
    waiting: 'Preparando…',
    go: 'JÁ!',
    recording: 'Gravando…',
    allDone: 'Todos os golpes coletados! Exporte os dados para treinamento.',
    export: 'Exportar JSON',
  },

  voice: {
    mute: 'Silenciar',
    unmute: 'Ativar som',
  },

  feedback: {
    good0: 'Sua postura parece sólida — continue mantendo esses fundamentos.',
    good1: 'Fundamentos de postura fortes. Mantenha-se consistente com esta estrutura.',
    good2: 'Base excelente. Sua postura de Muay Thai está bem estruturada.',
    warn0: 'Sua postura tem espaço para melhoria. Foco nas dicas abaixo.',
    warn1: 'Base decente, mas alguns ajustes vão refinar sua postura.',
    warn2: 'Você está quase lá — ajuste esses detalhes para uma postura mais firme.',
    bad0: 'Sua postura precisa de trabalho. Comece com as principais dicas abaixo.',
    bad1: 'Problemas significativos de postura detectados. Priorize as correções indicadas.',
    bad2: 'Reajuste sua postura e foque primeiro nos fundamentos.',
    scoreSuffix: 'Pontuação geral:',
  },
};

export default ptBr;

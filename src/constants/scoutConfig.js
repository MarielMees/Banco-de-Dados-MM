export const SCOUT_CONFIG = {
  header: {
    title: "Banco de Dados - MM",
    subtitle: "Mariel Mees - scout",
    lastSync: "AUTO-SALVO",
    totalAthletes: 487,
    monitoredDate: "Sexta-feira, 11 de Setembro de 2026",
  },
  menuSections: [
    {
      id: "inicio",
      label: "INÍCIO",
      items: [
        { id: "visao-geral", label: "Visão Geral", active: true }
      ]
    },
    {
      id: "posicoes",
      label: "POSIÇÕES",
      items: [
        { id: "goleiro", label: "Goleiro", count: 29, alertCount: 12, icon: "Shield" },
        { id: "zagueiro", label: "Zag. Destro", count: 56, alertCount: 17, icon: "ShieldAlert" },
        { id: "zag-canhoto", label: "Zag. Canhoto", count: 17, alertCount: 3, icon: "ShieldHalf" },
        { id: "lat-direito", label: "Lat. Direito", count: 64, alertCount: 16, icon: "ArrowRightCircle" },
        { id: "lat-esquerdo", label: "Lat. Esquerdo", count: 42, alertCount: 15, icon: "ArrowLeftCircle" },
        { id: "medio", label: "Médio", count: 112, alertCount: 20, icon: "Compass" },
        { id: "meia-ofensivo", label: "Meia Ofensivo", count: 26, alertCount: 6, icon: "Sparkles" },
        { id: "extremo", label: "Extremo", count: 56, alertCount: 13, icon: "Zap" },
        { id: "centroavante", label: "Centroavante", count: 45, alertCount: 8, icon: "Target" }
      ]
    },
    {
      id: "acompanhamento",
      label: "ACOMPANHAMENTO",
      items: [
        { id: "radar-sub23", label: "Radar Sub-23", count: 45, alertCount: 6, icon: "Telescope" },
        { id: "monitoramento", label: "Monitoramento", count: 2, alertCount: 0, icon: "Search" },
        { id: "hot-list", label: "Hot List", count: 8, alertCount: 0, icon: "Flame" },
        { id: "copa-sp", label: "Copa SP", count: 0, alertCount: 0, icon: "GraduationCap" }
      ]
    },
    {
      id: "gestao",
      label: "GESTÃO E ANÁLISES",
      items: [
        { id: "time-sombra", label: "Time Sombra", count: 8, alertCount: 0, icon: "Layers" },
        { id: "selecao-campeonato", label: "Seleção do Campeonato", count: 0, alertCount: 0, icon: "Trophy" },
        { id: "treinadores", label: "Treinadores", count: 2, alertCount: 0, icon: "UserCheck" },
        { id: "relatorios-jogo", label: "Relatórios de Jogo", count: 2, alertCount: 0, icon: "FileText" },
        { id: "agenda-jogos", label: "Agenda de Jogos", count: 0, alertCount: 0, icon: "Calendar" }
      ]
    }
  ],
  contractAlerts: {
    expiringTitle: "VENCENDO",
    expiringSubtitle: "≤ 180 dias",
    count: 137,
    filterLabel: "≤ 180 dias"
  },
  positionCards: [
    { id: "goleiro", label: "Goleiro", count: 29, alertCount: 12, icon: "Shield", activeBarColor: "bg-purple-500" },
    { id: "zagueiro", label: "Zag. Destro", count: 56, alertCount: 17, icon: "ShieldAlert", activeBarColor: "bg-blue-500" },
    { id: "zag-canhoto", label: "Zag. Canhoto", count: 17, alertCount: 3, icon: "ShieldHalf", activeBarColor: "bg-cyan-500" },
    { id: "lat-direito", label: "Lat. Direito", count: 64, alertCount: 16, icon: "ArrowRightCircle", activeBarColor: "bg-blue-600" },
    { id: "lat-esquerdo", label: "Lat. Esquerdo", count: 42, alertCount: 15, icon: "ArrowLeftCircle", activeBarColor: "bg-sky-500" },
    { id: "medio", label: "Médio", count: 112, alertCount: 20, icon: "Compass", activeBarColor: "bg-teal-500" },
    { id: "meia-ofensivo", label: "Meia Ofensivo", count: 26, alertCount: 6, icon: "Sparkles", activeBarColor: "bg-pink-500" },
    { id: "extremo", label: "Extremo", count: 56, alertCount: 13, icon: "Zap", activeBarColor: "bg-amber-500" },
    { id: "centroavante", label: "Centroavante", count: 45, alertCount: 8, icon: "Target", activeBarColor: "bg-indigo-500" },
    { id: "radar-sub23", label: "Radar Sub-23", count: 45, alertCount: 6, icon: "Telescope", activeBarColor: "bg-purple-600" },
    { id: "monitoramento", label: "Monitoramento", count: 2, alertCount: 0, icon: "Search", activeBarColor: "bg-emerald-500" },
    { id: "hot-list", label: "Hot List", count: 8, alertCount: 0, icon: "Flame", activeBarColor: "bg-rose-500" },
    { id: "time-sombra", label: "Time Sombra", count: 8, alertCount: 0, icon: "Layers", activeBarColor: "bg-cyan-600" },
    { id: "selecao-campeonato", label: "Seleção do Campeonato", count: 0, alertCount: 0, icon: "Trophy", activeBarColor: "bg-amber-500" },
    { id: "treinadores", label: "Treinadores", count: 3, alertCount: 0, icon: "UserCheck", activeBarColor: "bg-violet-600" },
    { id: "relatorios-jogo", label: "Relatórios de Jogo", count: 2, alertCount: 0, icon: "FileText", activeBarColor: "bg-emerald-600" },
    { id: "agenda-jogos", label: "Agenda de Jogos", count: 0, alertCount: 0, icon: "Calendar", activeBarColor: "bg-emerald-600" }
  ],
  levelDistribution: [
    { level: "A+", count: 18, colorClass: "bg-emerald-500", labelColor: "text-emerald-400", badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
    { level: "A", count: 110, colorClass: "bg-emerald-500", labelColor: "text-emerald-400", badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
    { level: "B+", count: 118, colorClass: "bg-sky-500", labelColor: "text-sky-400", badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/40" },
    { level: "B", count: 124, colorClass: "bg-blue-600", labelColor: "text-blue-400", badgeBg: "bg-blue-600/20 text-blue-300 border-blue-500/40" },
    { level: "C+", count: 32, colorClass: "bg-amber-600", labelColor: "text-amber-400", badgeBg: "bg-amber-600/20 text-amber-300 border-amber-600/40" },
    { level: "C", count: 56, colorClass: "bg-amber-500", labelColor: "text-amber-400", badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
    { level: "D", count: 19, colorClass: "bg-slate-400", labelColor: "text-slate-300", badgeBg: "bg-slate-600/30 text-slate-300 border-slate-500/40" }
  ],
  quickShortcuts: [
    { id: "hot-list", label: "Ver Hot List", icon: "Flame", variant: "danger" },
    { id: "monitoramento", label: "Ver Monitoramento", icon: "Search", variant: "primary" },
    { id: "vencendo", label: "Ver Contratos Vencendo", icon: "AlertTriangle", variant: "warning" }
  ]
};

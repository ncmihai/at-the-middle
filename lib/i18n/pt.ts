// Português — a mesma estrutura de chaves que en.ts (fonte da verdade). As páginas
// legais (privacy/terms) não estão traduzidas neste idioma; usam o inglês.
import type { LangMessages } from "./en";

export const pt: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "Encontrem-se a meio caminho",
    heroSubtitle:
      "Um só destino, cada um voa da sua cidade e todos chegam com menos de um dia de diferença uns dos outros — dentro do vosso orçamento.",
    heroPoints: [
      "2–8 viajantes, cada um da sua cidade",
      "Datas de viagem flexíveis — ou escolham um mês inteiro",
      "Ordenados pela diferença de chegada, depois pelo preço",
    ],
  },
  form: {
    title: "Planeiem a viagem",
    originsLabel: "De onde voa cada um?",
    originsHint: "2–8 aeroportos de origem, um por viajante",
    originPlaceholder: "Pesquisar cidade ou aeroporto…",
    originSelectedPlaceholder: "Escolha um aeroporto",
    addOrigin: "Adicionar viajante",
    removeOrigin: "Remover",
    maxOriginsReached: "Máximo de 8 viajantes",
    minOriginsHint: "Pelo menos 2 viajantes",
    locationButton: "Usar a minha localização",
    locationLocating: "A detetar a sua localização…",
    locationFailed: "Não foi possível detetar a sua localização — escolha o aeroporto manualmente",
    locationNoEmptyRow: "Todas as vagas de viajantes já estão preenchidas",
    autocomplete: {
      searching: "A procurar aeroportos…",
      minChars: "Escreva pelo menos 2 caracteres…",
      empty: "Nenhum aeroporto encontrado.",
    },
    datesLabel: "Datas da viagem",
    datesPlaceholder: "Selecione partida e regresso",
    datesHint: "Partida → regresso — o número de noites é calculado automaticamente",
    flexLabel: "Flexibilidade na partida",
    flexDays: (days: number) =>
      days === 0 ? "±0 dias (data exata)" : `±${days} dia${days === 1 ? "" : "s"}`,
    monthMode: "Mês inteiro",
    monthLabel: "Mês",
    monthHint: "Analisamos o mês inteiro e escolhemos automaticamente o período de 14 dias mais barato",
    nightsLabel: "Noites",
    nightsHint: "1–30",
    nightsLabelMonth: "Noites (à sua escolha)",
    nightsAutoHint: "Calculado automaticamente a partir das datas da viagem",
    monthSampling: (month: string) => `a escolher os 14 dias mais baratos de ${month}…`,
    fewerNights: "Menos noites",
    moreNights: "Mais noites",
    budgetLabel: "Orçamento por pessoa",
    budgetHint: (cur: string) => `Cobre o voo de ida + volta, em ${cur}`,
    maxFlightLabel: "Tempo máximo de voo (opcional)",
    maxFlightAny: "Qualquer duração",
    maxFlightHours: (h: number) => `Até ${h} h`,
    submit: "Encontrar destinos a meio caminho",
    submitting: "A iniciar a pesquisa…",
    errors: {
      originsRequired: "Escolha pelo menos 2 aeroportos de origem",
      originsUnique: "Cada viajante precisa de um aeroporto de origem diferente",
      datesRequired: "Selecione as datas de partida e de regresso",
      nightsRequired: "Escolha quantas noites (1–30)",
      budgetRequired: (min: string, max: string) =>
        `O orçamento deve estar entre ${min} e ${max} por pessoa`,
      validationFailed: "Verifique o formulário — alguns campos são inválidos",
      rateLimited: (retryAfterSeconds?: number) =>
        `Demasiadas pesquisas — aguarde${retryAfterSeconds ? ` ${retryAfterSeconds} s` : " um momento"} e tente novamente`,
      generic: "Algo correu mal. Tente novamente.",
      network: "Não foi possível contactar o servidor. Verifique a sua ligação e tente novamente.",
    },
  },
  waiting: {
    title: "A procurar o vosso meio…",
    subtitle:
      "Estamos a analisar voos de todos os aeroportos de origem para destinos candidatos. Normalmente demora menos de um minuto.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `Passo ${done} de ${total}` : "A aquecer…",
    partialTitle: "Encontrados até agora",
    cancel: "Cancelar pesquisa",
    cancelling: "A cancelar…",
    cancelDialogTitle: "Cancelar esta pesquisa?",
    cancelDialogBody:
      "A pesquisa vai parar, mas os destinos já encontrados continuam visíveis abaixo.",
    cancelDialogConfirm: "Sim, cancelar",
    cancelDialogDismiss: "Continuar a pesquisar",
  },
  history: {
    title: "Pesquisas recentes",
    clear: "Limpar",
    chipAria: (label: string) => `Abrir pesquisa: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    title: "Os vossos destinos a meio caminho",
    subtitle: "Ordenados pela proximidade das chegadas de todos, depois pelo preço total.",
    empty: "Ainda nenhum destino correspondeu ao seu orçamento e ao limite de diferença de chegada.",
    gapBadge: (text: string) => `Todos chegam com ${text} de diferença`,
    gapRelaxed: (hours: number) =>
      `Sem correspondências dentro do limite padrão de 24 h — a diferença de chegada foi alargada para ${hours} h`,
    outbound: (date: string) => `Ida · ${date}`,
    returnLeg: (date: string) => `Volta · ${date}`,
    perPersonTotal: "por pessoa",
    groupTotal: "Total do grupo",
    bookOutbound: "Reservar ida",
    bookReturn: "Reservar volta",
    stay: (city: string) => `Ficar em ${city}`,
    stayNote: "Link de afiliação",
    extras: {
      title: "Extras",
      transfer: "Transfer do aeroporto",
      car: "Aluguer de carro",
      esim: "eSIM",
      activities: "Atividades",
    },
    priceNote: "Os preços são do momento da pesquisa — o site de reserva mostra o preço em tempo real.",
    share: "Copiar link de partilha",
    copied: "Link de partilha copiado!",
    copyFailed: "Não foi possível copiar — selecione o URL manualmente",
    shareCard: "Transferir cartão de partilha",
    shareCardDownloaded: "Cartão de partilha transferido — verifique as suas transferências!",
    shareCardFailed: "Não foi possível criar o cartão de partilha — tente novamente",
    invite: "Copiar convite",
    inviteCopied: "Convite copiado — cole-o no chat do seu grupo!",
    inviteTemplate: ({ city, country, dep, ret, gap, url }) =>
      `Vamos encontrar-nos em ${city} (${country}), ${dep} → ${ret}! Encontrámos voos que fazem todos aterrar com ${gap} de diferença: ${url}`,
    cancelledBanner: "Pesquisa cancelada — a mostrar os destinos encontrados até agora.",
    failedTitle: "A pesquisa falhou",
    failedRetry: "Inicie uma nova pesquisa a partir da página inicial",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} noite${n === 1 ? "" : "s"}`,
    usageLimited: "Limite mensal de pesquisas atingido — a mostrar apenas resultados em cache.",
    map: {
      title: "Mapa",
      origins: "Aeroportos de origem",
      destinations: "Destinos",
      airports: "Todos os aeroportos candidatos",
      tooltip: {
        gap: (text: string) => `chegadas com ${text} de diferença`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "Total do grupo",
        perPerson: "por pessoa",
      },
    },
    toolbar: {
      sortLabel: "Ordenar por",
      sortGap: "Chegadas mais próximas",
      sortPrice: "Preço mais baixo",
      sortDestination: "Destino A–Z",
      gapLabel: "Diferença máx. de chegada",
      gapAny: "Qualquer",
      gapHours: (h: number) => `≤ ${h} h`,
      priceLabel: "Preço máx. / pessoa",
      priceAny: "Qualquer",
      showing: (shown: number, total: number) => `${shown} de ${total} mostrados`,
    },
    timeline: {
      title: "Dispersão das chegadas",
      arriveWithin: (text: string) => `chegam com ${text} de diferença`,
    },
    relax: {
      title: "Ainda sem correspondências",
      body: "Alargue a pesquisa e volte a executá-la — as pesquisas repetidas reutilizam os preços de voos em cache.",
      gap30: "Alargar a diferença para 30 h",
      budget50: (amount: string) => `+${amount} no orçamento`,
      days3: "+3 dias de janela",
      running: "A iniciar uma nova pesquisa…",
    },
  },
  weather: {
    title: (city: string) => `Meteorologia em ${city} — próximos 7 dias`,
    rain: (pct: number) => `chuva ${pct}%`,
    source: "Previsão: Open-Meteo (CC BY 4.0)",
    labels: {
      clear: "Céu limpo",
      partlyCloudy: "Parcialmente nublado",
      cloudy: "Nublado",
      fog: "Nevoeiro",
      rain: "Chuva",
      snow: "Neve",
      showers: "Aguaceiros",
      thunderstorm: "Trovoada",
    },
  },
  hero: {
    title: (city: string, country: string) => `O melhor meio para vocês: ${city}, ${country}`,
    gap: (text: string) => `todos chegam com ${text} de diferença`,
    from: (price: string) => `desde ${price} / pessoa`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "Ver esta opção",
  },
  surprise: {
    button: "Surpreende-me",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — a ${gap} de diferença, ${total}`,
  },
  popular: {
    title: "Destinos a meio caminho populares",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "Ainda não há destinos populares",
  },
  ads: {
    label: "Patrocinado",
  },
  share: {
    pageTitle: "pesquisa midspot",
    loading: "A carregar a pesquisa…",
    notFoundTitle: "Este link de pesquisa não está disponível",
    notFoundBody:
      "Pode ter expirado (as pesquisas são mantidas por 7 dias) ou o link está errado.",
    backHome: "Voltar ao midspot",
    errorPrefix: "Erro na pesquisa: ",
  },
  notFound: {
    title: "Página não encontrada",
    body: "A página que procura não existe ou foi movida.",
    backHome: "Voltar ao midspot",
  },
  common: {
    loading: "A carregar…",
  },
  consent: {
    title: "Cookies",
    body: "Usamos cookies essenciais para memorizar o seu idioma e a sua escolha aqui. Os cookies de publicidade (EthicalAds / CarbonAds) só são carregados se escolher “Aceitar tudo”.",
    acceptAll: "Aceitar tudo",
    essentialOnly: "Apenas essenciais",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    meta: {
      indexTitle: "Destinos",
      indexDescription:
        "Percorra as cidades europeias que o midspot pode pesquisar como meio para o seu grupo — ordenadas pela frequência com que os viajantes as escolhem.",
      cityTitle: (city: string) => `Encontro em ${city}`,
      cityDescription: (city: string, country: string) =>
        `Encontro em ${city}, ${country} — veja por que funciona como meio para amigos e família que voam de cidades diferentes, e depois encontre o seu próprio meio.`,
    },
    index: {
      eyebrow: "Destinos",
      title: "Onde deve encontrar-se o seu grupo?",
      subtitle:
        "Cada cidade abaixo é um destino que o midspot pode pesquisar como possível meio para 2–8 viajantes que voam de diferentes aeroportos de origem. Escolha uma para ver por que funciona — ou volte atrás e deixe a pesquisa encontrar o seu meio.",
      searchPlaceholder: "Pesquisar cidade, país ou código de aeroporto…",
      empty: "Nenhum destino corresponde à sua pesquisa.",
      showing: (shown: number, total: number) => `A mostrar ${shown} de ${total} destinos`,
      airports: (codes: string) => `Aeroportos: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "Ainda não escolhido como meio"
          : count === 1
            ? "Escolhido uma vez como meio"
            : `Escolhido ${count}× como meio`,
    },
    city: {
      back: "Todos os destinos",
      pitch: (city: string) => `Encontro em ${city} — o meio que funciona para todos.`,
      pitchBody: (city: string, country: string) =>
        `${city} (${country}) é um dos destinos que o midspot pesquisa quando um grupo de amigos ou família quer encontrar-se. Todos voam do seu próprio aeroporto de origem; ordenamos os destinos pela proximidade das chegadas de todos e depois pelo preço — dentro do seu orçamento.`,
      airportsLabel: "Aeroportos servidos",
      statsLabel: "Vezes escolhido como meio (últimos 90 dias)",
      statsEmpty: "Ainda sem pesquisas — sejam o primeiro grupo a encontrar-se aqui.",
      howTitle: "Como funciona",
      howSteps: [
        {
          title: "Adicione o aeroporto de origem de cada um",
          body: "2–8 viajantes, cada um da sua cidade — procuramos preços reais de voos a partir de todos.",
        },
        {
          title: "Defina datas, noites e orçamento",
          body: "Datas flexíveis ou um mês inteiro; um orçamento por pessoa que cobre ida + volta.",
        },
        {
          title: "Nós ordenamos os meios",
          body: "Os destinos são ordenados pela diferença de chegada (todos aterram com menos de 24 h de diferença entre si) e depois pelo preço total.",
        },
      ],
      faqTitle: "Perguntas frequentes",
      // “{city}” é substituído pela cidade da página no momento da apresentação
      faqs: [
        {
          q: "Porque é que {city} é um bom meio?",
          a: "{city} é alcançável com voos curtos e frequentes de toda a Europa, por isso os viajantes de cidades diferentes costumam chegar com apenas horas de diferença entre si — a um preço total baixo. Faça uma pesquisa e o midspot compara-o com todas as outras opções.",
        },
        {
          q: "Faço a reserva dos voos através do midspot?",
          a: "Não. O midspot encontra e ordena o meio; a reserva é feita no site do parceiro (ex. Kiwi.com) através de um link de afiliação, ao mesmo preço para si.",
        },
        {
          q: "Os preços são reais?",
          a: "Os preços vêm de dados de voos em tempo real no momento da pesquisa e podem mudar — o site de reserva mostra sempre o preço final.",
        },
      ],
      cta: "Encontre o seu meio",
    },
  },
  blog: {
    meta: {
      title: "Blog",
      description:
        "Histórias e notas da equipa do midspot — como encontramos o meio para grupos de viajantes que voam de cidades diferentes.",
    },
    title: "Histórias do meio",
    subtitle:
      "Notas sobre encontros a meio caminho: como funciona a pesquisa, onde os grupos realmente se encontraram e o que aprendemos com os dados reais de voos.",
    latest: "Últimas histórias",
    empty: "Ainda não há publicações — volte em breve.",
    readingTime: (minutes: number) => `${minutes} min de leitura`,
    published: (date: string) => `Publicado em ${date}`,
    back: "Todas as publicações",
    prev: "Publicação mais recente",
    next: "Publicação mais antiga",
    share: "Copiar link",
    copied: "Link copiado!",
    copyFailed: "Não foi possível copiar — selecione o URL manualmente",
    rss: "Feed RSS",
  },
  stats: {
    title: "Estatísticas do site",
    subtitle: "A análise de dados própria do midspot, com preservação da privacidade — apenas agregados, nunca IPs.",
    secretLabel: "Chave de estatísticas",
    secretPlaceholder: "Cole a chave de estatísticas",
    unlock: "Carregar estatísticas",
    loading: "A carregar…",
    unauthorized:
      "Chave errada ou em falta (401). A chave nunca é incluída nesta página — peça-a ao responsável do site.",
    error: "Não foi possível carregar as estatísticas.",
    retry: "Tentar novamente",
    totals: { searches: "Pesquisas", results: "Resultados", pageviews: "Visualizações" },
    searchesChart: "Pesquisas por dia — últimos 30 dias",
    pageviewsChart: "Visualizações por dia — últimos 30 dias",
    popularRoutes: "Pares de origens populares — últimos 30 dias",
    providerUsage: "Utilização de fornecedores — mês atual",
    table: {
      day: "Dia",
      count: "Contagem",
      total: "Total",
      route: "Rota",
      searches: "Pesquisas",
      provider: "Fornecedor",
      calls: "Chamadas",
      cap: "Limite mensal",
      pctUsed: "% do limite",
    },
    noData: "Ainda não há dados.",
    cloudflareNote:
      "O painel da Cloudflare também mostra o tráfego na edge (todos os pedidos que chegam à CDN, incluindo bots e recursos em cache) — esta página mostra apenas o que o próprio midspot serve e guarda na sua base de dados.",
  },
  footer: {
    destinations: "Destinos",
    blog: "Blog",
    privacy: "Privacidade",
    terms: "Termos",
    cookieSettings: "Definições de cookies",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Idioma",
  },
  currency: {
    label: "Moeda",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 EUR = ${rate} ${cur} · taxa do BCE de ${date}`,
  },
  theme: {
    label: "Tema",
    light: "Claro",
    dark: "Escuro",
    system: "Sistema",
  },
};

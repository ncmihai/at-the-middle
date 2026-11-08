// Español — mismas claves que en.ts. Las páginas legales (privacy/terms) quedan
// en inglés (reserva) hasta que se traduzcan.
import type { LangMessages } from "./en";

export const es: LangMessages = {
  brand: {
    name: "midspot",
    heroTitle: "Encuentraos en el medio",
    heroSubtitle:
      "Un solo destino, cada uno vuela desde su ciudad y todos llegan con menos de un día de diferencia — dentro de vuestro presupuesto.",
    heroPoints: [
      "2–8 viajeros, cada uno desde su ciudad",
      "Fechas de viaje flexibles — o elige un mes entero",
      "Ordenados por diferencia de llegada, luego por precio",
    ],
  },
  form: {
    title: "Planifica el viaje",
    originsLabel: "¿Desde dónde vuela cada uno?",
    originsHint: "2–8 aeropuertos de origen, un viajero cada uno",
    originPlaceholder: "Busca ciudad o aeropuerto…",
    originSelectedPlaceholder: "Elige un aeropuerto",
    addOrigin: "Añadir viajero",
    removeOrigin: "Quitar",
    maxOriginsReached: "Máximo 8 viajeros",
    minOriginsHint: "Mínimo 2 viajeros",
    locationButton: "Usar mi ubicación",
    locationLocating: "Detectando ubicación…",
    locationFailed: "No pudimos detectar tu ubicación: elige el aeropuerto manualmente",
    locationNoEmptyRow: "Todas las plazas de viajeros están ocupadas",
    autocomplete: {
      searching: "Buscando aeropuertos…",
      minChars: "Escribe al menos 2 caracteres…",
      empty: "No se encontraron aeropuertos.",
    },
    datesLabel: "Fechas del viaje",
    datesPlaceholder: "Elige la salida y la vuelta",
    datesHint: "Salida → vuelta — las noches se calculan automáticamente",
    flexLabel: "Flexibilidad de salida",
    flexDays: (days: number) =>
      days === 0 ? "±0 días (fecha exacta)" : `±${days} día${days === 1 ? "" : "s"}`,
    monthMode: "Solo mes",
    monthLabel: "Mes",
    monthHint: "Escaneamos todo el mes y elegimos automáticamente los 14 días más baratos",
    nightsLabel: "Noches",
    nightsHint: "1–30",
    nightsLabelMonth: "Noches (a tu elección)",
    nightsAutoHint: "Se calculan automáticamente a partir de las fechas del viaje",
    monthSampling: (month: string) => `eligiendo los 14 días más baratos de ${month}…`,
    fewerNights: "Menos noches",
    moreNights: "Más noches",
    budgetLabel: "Presupuesto por persona",
    budgetHint: (cur: string) => `Cubre ida + vuelta, en ${cur}`,
    maxFlightLabel: "Tiempo máx. de vuelo (opcional)",
    maxFlightAny: "Cualquier duración",
    maxFlightHours: (h: number) => `Hasta ${h} h`,
    submit: "Buscar sitios en el medio",
    submitting: "Iniciando búsqueda…",
    errors: {
      originsRequired: "Elige al menos 2 aeropuertos de origen",
      originsUnique: "Cada viajero necesita un aeropuerto de origen distinto",
      datesRequired: "Selecciona la salida y la vuelta",
      nightsRequired: "Elige cuántas noches (1–30)",
      budgetRequired: (min: string, max: string) =>
        `El presupuesto debe estar entre ${min} y ${max} por persona`,
      validationFailed: "Revisa el formulario: algunos campos no son válidos",
      rateLimited: (retryAfterSeconds?: number) =>
        `Demasiadas búsquedas: espera${retryAfterSeconds ? ` ${retryAfterSeconds} s` : " un poco"} e inténtalo de nuevo`,
      generic: "Algo ha fallado. Inténtalo de nuevo.",
      network: "No se pudo contactar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
    },
  },
  waiting: {
    title: "Buscando vuestro medio…",
    subtitle:
      "Analizamos vuelos desde cada aeropuerto de origen hacia destinos candidatos. Suele tardar menos de un minuto.",
    currentStep: (step: string) => step,
    progress: (done: number, total: number) =>
      total > 0 ? `Paso ${done} de ${total}` : "Preparando…",
    partialTitle: "Encontrado hasta ahora",
    cancel: "Cancelar búsqueda",
    cancelling: "Cancelando…",
    cancelDialogTitle: "¿Cancelar esta búsqueda?",
    cancelDialogBody:
      "La búsqueda se detendrá, pero los destinos ya encontrados seguirán visibles abajo.",
    cancelDialogConfirm: "Sí, cancelar",
    cancelDialogDismiss: "Seguir buscando",
  },
  history: {
    title: "Búsquedas recientes",
    clear: "Borrar",
    chipAria: (label: string) => `Abrir búsqueda: ${label}`,
  },
  results: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    title: "Vuestros sitios en el medio",
    subtitle: "Ordenados por lo cerca que llegan todos, luego por precio total.",
    empty: "Ningún destino encaja todavía con el presupuesto y el límite de diferencia de llegada.",
    gapBadge: (text: string) => `Todos llegan con menos de ${text} de diferencia`,
    gapRelaxed: (hours: number) =>
      `Sin resultados dentro del límite estándar de 24 h: la diferencia de llegada se amplió a ${hours} h`,
    outbound: (date: string) => `Ida · ${date}`,
    returnLeg: (date: string) => `Vuelta · ${date}`,
    perPersonTotal: "por persona",
    groupTotal: "Total del grupo",
    bookOutbound: "Reservar ida",
    bookReturn: "Reservar vuelta",
    stay: (city: string) => `Alojamiento en ${city}`,
    stayNote: "Enlace de afiliado",
    // ADDITIVE (Faza 7): etiquetas de los botones de afiliados «extra» por resultado
    extras: {
      title: "Extras",
      transfer: "Traslado al aeropuerto",
      car: "Alquiler de coches",
      esim: "eSIM",
      activities: "Actividades",
    },
    priceNote:
      "Los precios son del momento de la búsqueda: el sitio de reserva muestra el precio en vivo.",
    share: "Copiar enlace para compartir",
    copied: "¡Enlace copiado!",
    copyFailed: "No se pudo copiar: selecciona la URL manualmente",
    shareCard: "Descargar tarjeta para compartir",
    shareCardDownloaded: "¡Tarjeta descargada! Revísala en tus descargas.",
    shareCardFailed: "No se pudo crear la tarjeta para compartir — inténtalo de nuevo",
    invite: "Copiar invitación",
    inviteCopied: "¡Invitación copiada! Pégala en el chat del grupo.",
    inviteTemplate: ({ city, country, dep, ret, gap, url }) =>
      `¡Nos vemos en ${city} (${country}), ${dep} → ${ret}! Hemos encontrado vuelos que nos hacen aterrizar con ${gap} de diferencia: ${url}`,
    cancelledBanner: "Búsqueda cancelada: se muestran los destinos encontrados hasta ahora.",
    failedTitle: "La búsqueda ha fallado",
    failedRetry: "Inicia una nueva búsqueda desde la página principal",
    rank: (n: number) => `#${n}`,
    nights: (n: number) => `${n} noche${n === 1 ? "" : "s"}`,
    usageLimited: "Límite mensual de búsquedas alcanzado — solo resultados en caché.",
    map: {
      title: "Mapa",
      origins: "Aeropuertos de origen",
      destinations: "Destinos",
      airports: "Todos los aeropuertos candidatos",
      tooltip: {
        gap: (text: string) => `llegadas dentro de ${text}`,
        dates: (dep: string, ret: string) => `${dep} → ${ret}`,
        total: "Total del grupo",
        perPerson: "por persona",
      },
    },
    toolbar: {
      sortLabel: "Ordenar por",
      sortGap: "Llegadas más juntas",
      sortPrice: "Precio total más bajo",
      sortDestination: "Destino A–Z",
      gapLabel: "Diferencia máx. de llegada",
      gapAny: "Cualquiera",
      gapHours: (h: number) => `≤ ${h} h`,
      priceLabel: "Precio máx. / persona",
      priceAny: "Cualquiera",
      showing: (shown: number, total: number) => `${shown} de ${total} mostrados`,
    },
    timeline: {
      title: "Dispersión de llegadas",
      arriveWithin: (text: string) => `llegan con menos de ${text} de diferencia`,
    },
    relax: {
      title: "Aún sin coincidencias",
      body: "Amplía la búsqueda y vuelve a ejecutarla — las búsquedas repetidas reutilizan los precios en caché.",
      gap30: "Relajar diferencia a 30 h",
      budget50: (amount: string) => `+${amount} de presupuesto`,
      days3: "+3 días de ventana",
      running: "Iniciando nueva búsqueda…",
    },
  },
  // ADDITIVE (Faza 8B): tiempo en el destino (open-meteo) — franja en la tarjeta + widget en /destinations
  weather: {
    title: (city: string) => `Tiempo en ${city} — próximos 7 días`,
    rain: (pct: number) => `lluvia ${pct} %`,
    source: "Previsión: Open-Meteo (CC BY 4.0)",
    labels: {
      clear: "Despejado",
      partlyCloudy: "Parcialmente nublado",
      cloudy: "Nublado",
      fog: "Niebla",
      rain: "Lluvia",
      snow: "Nieve",
      showers: "Chubascos",
      thunderstorm: "Tormenta",
    },
  },
  hero: {
    title: (city: string, country: string) => `El mejor punto medio para vosotros: ${city}, ${country}`,
    gap: (text: string) => `todos llegan con menos de ${text} de diferencia`,
    from: (price: string) => `desde ${price} / persona`,
    dates: (dep: string, ret: string) => `${dep} → ${ret}`,
    cta: "Ver esta opción",
  },
  surprise: {
    button: "Sorpréndeme",
    toast: (city: string, gap: string, total: string) => `🎲 ${city} — ${gap} de diferencia, ${total}`,
  },
  popular: {
    title: "Puntos medios populares",
    chip: (city: string, count: number) => `${city} ×${count}`,
    empty: "Aún no hay destinos populares",
  },
  ads: {
    label: "Patrocinado",
  },
  share: {
    pageTitle: "búsqueda midspot",
    loading: "Cargando búsqueda…",
    notFoundTitle: "Este enlace de búsqueda no está disponible",
    notFoundBody: "Puede haber expirado (las búsquedas se guardan 7 días) o ser incorrecto.",
    backHome: "Volver a midspot",
    errorPrefix: "Error de búsqueda: ",
  },
  notFound: {
    title: "Página no encontrada",
    body: "La página que buscas no existe o se ha movido.",
    backHome: "Volver a midspot",
  },
  common: {
    loading: "Cargando…",
  },
  consent: {
    title: "Cookies",
    body: "Usamos cookies esenciales para el idioma y tu elección aquí. Las cookies de publicidad (EthicalAds / CarbonAds) solo se cargan si eliges «Aceptar todas».",
    acceptAll: "Aceptar todas",
    essentialOnly: "Solo esenciales",
  },
  destinations: {
    photoCredit: (credit: string, license: string) =>
      `Foto: ${credit} · ${license} (Wikimedia Commons)`,
    meta: {
      indexTitle: "Destinos",
      indexDescription:
        "Explora las ciudades europeas que midspot puede buscar como punto medio para tu grupo — ordenadas según las veces que los viajeros las han elegido.",
      cityTitle: (city: string) => `Quedemos en ${city}`,
      cityDescription: (city: string, country: string) =>
        `Quedemos en ${city}, ${country}: descubre por qué funciona como punto medio para amigos y familia que vuelan desde ciudades diferentes, y encuentra vuestro propio punto medio.`,
    },
    index: {
      eyebrow: "Destinos",
      title: "¿Dónde debería reunirse tu grupo?",
      subtitle:
        "Cada ciudad de abajo es un destino que midspot puede buscar como posible punto medio para 2–8 viajeros que salen de aeropuertos distintos. Elige una para ver por qué funciona — o vuelve atrás y deja que la búsqueda encuentre vuestro punto medio.",
      searchPlaceholder: "Buscar ciudad, país o código de aeropuerto…",
      empty: "Ningún destino coincide con tu búsqueda.",
      showing: (shown: number, total: number) => `Mostrando ${shown} de ${total} destinos`,
      airports: (codes: string) => `Aeropuertos: ${codes}`,
      chosen: (count: number) =>
        count === 0
          ? "Aún no elegido como punto medio"
          : count === 1
            ? "Elegido 1× como punto medio"
            : `Elegido ${count}× como punto medio`,
    },
    city: {
      back: "Todos los destinos",
      pitch: (city: string) => `Quedemos en ${city} — el punto medio que funciona para todos.`,
      pitchBody: (city: string, country: string) =>
        `${city} (${country}) es uno de los destinos que midspot busca cuando un grupo de amigos o familia quiere reunirse. Cada uno vuela desde su propio aeropuerto; ordenamos los destinos por lo cerca que llegan todos y luego por precio — dentro de vuestro presupuesto.`,
      airportsLabel: "Aeropuertos servidos",
      statsLabel: "Veces elegido como punto medio (últimos 90 días)",
      statsEmpty: "Aún no hay búsquedas: sed el primer grupo en reunirse aquí.",
      howTitle: "Cómo funciona",
      howSteps: [
        {
          title: "Añade el aeropuerto de cada uno",
          body: "2–8 viajeros, cada uno desde su ciudad: buscamos precios reales de vuelos desde todos.",
        },
        {
          title: "Fechas, noches y presupuesto",
          body: "Fechas flexibles o un mes entero; un presupuesto por persona que cubre ida + vuelta.",
        },
        {
          title: "Clasificamos los puntos medios",
          body: "Destinos ordenados por diferencia de llegada (todos aterrizan con menos de 24 h de diferencia) y luego por precio total.",
        },
      ],
      faqTitle: "Preguntas frecuentes",
      // "{city}" se sustituye por la ciudad de la página al renderizar
      faqs: [
        {
          q: "¿Por qué {city} es un buen punto medio?",
          a: "{city} es accesible con vuelos cortos y frecuentes desde toda Europa, así que los viajeros de distintas ciudades llegan a menudo con horas de diferencia — y a menudo a buen precio. Lanza una búsqueda y midspot la comparará con todas las demás opciones.",
        },
        {
          q: "¿Reservo los vuelos en midspot?",
          a: "No. midspot encuentra y ordena el punto medio; la reserva se hace en el sitio del socio (p. ej. Kiwi.com) mediante un enlace de afiliado, al mismo precio para ti.",
        },
        {
          q: "¿Los precios son reales?",
          a: "Los precios vienen de datos de vuelos en vivo en el momento de la búsqueda y pueden cambiar: el sitio de reserva siempre muestra el precio final.",
        },
      ],
      cta: "Encuentra vuestro punto medio",
    },
  },
  blog: {
    meta: {
      title: "Blog",
      description:
        "Historias y notas del equipo de midspot — cómo encontramos el punto medio para grupos que viajan desde ciudades diferentes.",
    },
    title: "Historias desde el medio",
    subtitle:
      "Notas sobre quedar en medio: cómo funciona la búsqueda, dónde se encontraron de verdad los grupos y qué aprendemos de los datos de vuelos en tiempo real.",
    latest: "Últimos artículos",
    empty: "Aún no hay artículos — vuelve pronto.",
    readingTime: (minutes: number) => `${minutes} min de lectura`,
    published: (date: string) => `Publicado el ${date}`,
    back: "Todos los artículos",
    prev: "Artículo más reciente",
    next: "Artículo más antiguo",
    share: "Copiar enlace",
    copied: "¡Enlace copiado!",
    copyFailed: "No se pudo copiar — selecciona la dirección manualmente",
    rss: "Feed RSS",
  },
  stats: {
    title: "Estadísticas del sitio",
    subtitle: "Analítica propia de midspot, respetuosa con la privacidad — solo agregados, nunca IPs.",
    secretLabel: "Clave de estadísticas",
    secretPlaceholder: "Pega la clave de estadísticas",
    unlock: "Cargar estadísticas",
    loading: "Cargando…",
    unauthorized:
      "Clave incorrecta o ausente (401). La clave nunca se incluye en esta página — pídela al propietario del sitio.",
    error: "No se pudieron cargar las estadísticas.",
    retry: "Reintentar",
    totals: { searches: "Búsquedas", results: "Resultados", pageviews: "Visitas" },
    searchesChart: "Búsquedas por día — últimos 30 días",
    pageviewsChart: "Visitas por día — últimos 30 días",
    popularRoutes: "Pares de orígenes populares — últimos 30 días",
    providerUsage: "Uso de proveedores — mes en curso",
    table: {
      day: "Día",
      count: "Cantidad",
      total: "Total",
      route: "Ruta",
      searches: "Búsquedas",
      provider: "Proveedor",
      calls: "Llamadas",
      cap: "Límite mensual",
      pctUsed: "% del límite",
    },
    noData: "Aún no hay datos.",
    cloudflareNote:
      "El panel de Cloudflare también muestra el tráfico edge (todas las solicitudes que llegan al CDN, incluidos bots y recursos en caché) — esta página solo muestra lo que midspot sirve y guarda en su propia base de datos.",
  },
  footer: {
    destinations: "Destinos",
    blog: "Blog",
    privacy: "Privacidad",
    terms: "Términos",
    cookieSettings: "Configuración de cookies",
    copyright: (year: number) => `© ${year} midspot`,
  },
  lang: {
    label: "Idioma",
  },
  currency: {
    label: "Moneda",
    rateLine: ({ rate, cur, date }: { rate: string; cur: string; date: string }) =>
      `1 EUR = ${rate} ${cur} · tipo del BCE del ${date}`,
  },
};

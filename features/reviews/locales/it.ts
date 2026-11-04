export const reviewsIT = {
  exportWorkspaceDescription:
    "Scegli confronto, date e luoghi, poi configura i fogli Excel da scaricare. I grafici restano modificabili. Il sentiment verrà aggiunto in seguito.",
  exportEmpty:
    "Salva un confronto e raccogli le recensioni per configurare un’esportazione.",
  exportComparison: "Confronto",
  exportScope: "Date e dataset",
  exportProperties: "Luoghi inclusi",
  exportSelectAll: "Seleziona tutti i luoghi",
  exportContent: "Fogli Excel",
  exportContentHint:
    "I sette fogli originali sono selezionati inizialmente. Con date personalizzate o gli ultimi dodici mesi, i fogli del periodo mostrano l’intervallo scelto al posto dello storico trimestrale.",
  exportPeriodRating: "Voto medio del periodo selezionato",
  exportPeriodSatisfaction: "Soddisfazione del periodo selezionato",
  exportEmptyGroup:
    "Nessun luogo di questo gruppo è stato selezionato. Il foglio non contiene dati.",
  exportHistory: "Anni precedenti da includere",
  exportHistoryHint:
    "Da 0 a 20 anni. Zero mantiene solo le righe degli ultimi dodici mesi e del periodo selezionato.",
  exportCharts: "Includi grafici Excel modificabili",
  exportSummary: "Riepilogo download",
  exportReset: "Ripristina configurazione",
  exportNewDataset: "Crea una copia congelata delle recensioni raccolte",
  exportFrozenHint:
    "Utilizza revisioni, nomi dei luoghi, ruoli e copertura congelati nel dataset. Scegli nuovamente i luoghi quando cambi dataset.",
  exportChecking: "Verifica dataset e copertura delle date…",
  exportCoverageHint:
    "Scegli almeno un luogo con copertura completa per le date selezionate. Raccogli le date mancanti dalla dashboard del confronto.",
  exportInvalidSelection:
    "Controlla date e anni, e scegli almeno un luogo e un foglio validi.",
  exportDownloadStarted:
    "Il download è stato avviato. Il dataset salvato è selezionato per la prossima esportazione; la configurazione è mantenuta.",
  exportExcel: "Esporta Excel",
  excelNewDataset:
    "Crea una copia congelata delle recensioni raccolte. Richiede la copertura delle date salvate del confronto per tutti i luoghi. Il download include solo i luoghi che selezioni qui.",
  excelDownload: "Scarica Excel (.xlsx)",
  excelGenerating: "Preparazione Excel…",
  excelError:
    "Impossibile generare Excel. Riprova; i dati salvati rimangono invariati.",
  excelCoverageError:
    "Le date da esportare o quelle salvate del confronto non sono interamente coperte. Sincronizza le date mancanti oppure scegli un dataset già salvato, poi riprova.",
  excelVersionError:
    "La configurazione del confronto è cambiata. Ricarica la pagina prima di esportare.",
  excelNotFound: "Questo confronto non è più disponibile. Torna ai confronti.",
  excelDataset: "Dataset salvato",
  excelSource:
    "Le metriche descrivono le recensioni Google raccolte, non tutte quelle mai pubblicate. La completezza della fonte non è garantita. Le date usano UTC.",
  excelDates: "Date (UTC)",
  excelMissing:
    "Le celle vuote e gli spazi nei grafici indicano dati non disponibili. Un periodo verificato senza recensioni ha conteggio zero e nessun voto o indice di soddisfazione.",
  excelPartialHistory:
    "Alcuni periodi storici non hanno copertura completa per tutti i luoghi. I relativi valori sono omessi; il report storico è parziale.",
  excelSatisfactionMethod:
    "Soddisfazione = recensioni con 4–5 stelle / tutte le recensioni con voto. La tabella seguente indica la numerosità delle recensioni con voto per ciascun periodo.",
  excelSamples: "Numerosità delle recensioni con voto per periodo e luogo",
  indicators: "Indicatori delle recensioni",
  ratingChange: "Variazione del voto",
  lowRatingShare: "Quota con 1–2 stelle",
  volumeChange: "Variazione del volume",
  competitorGap: "Divario di voto con il concorrente",
  sharedReviewerGap: "Divario di voto tra recensori comuni",
  gapDirection: "Voto del luogo principale − voto del concorrente (punti).",
  indicatorsHint:
    "Indicatori del periodo selezionato. Le variazioni sono rispetto al {start} – {end} (UTC). I divari usano {primary} come luogo principale.",
  indicatorsMethod:
    "Variazioni e divari di voto sono in punti; la quota con 1–2 stelle usa le recensioni con voto. Le variazioni richiedono copertura completa di entrambi i periodi. La crescita del volume non è disponibile se il conteggio precedente è zero. I divari sono mostrati solo per i concorrenti; quelli tra recensori comuni usano le stesse persone identificate. Copertura o voti mancanti sono indicati come non disponibili.",

  trendRollingLabel: "Ultimi 12 mesi",
  trendProperties: "Proprietà e concorrenti",
  trendQuarterly: "Confronto trimestrale",
  trendAnchors: "Anchor",
  trendVolume: "Volume recensioni",
  trendQuarterRating: "Valutazione media del trimestre",
  trendQuarterSatisfaction: "Soddisfazione del trimestre",
  trendAnchorRating: "Valutazione media degli anchor",
  trendAnchorSatisfaction: "Soddisfazione degli anchor",
  trendCountUnit: "Recensioni raccolte · Google",
  trendRatingUnit: "Valutazione media · scala barre 0–5 · Google",
  trendSatisfactionUnit: "Quota recensioni con voto 4–5 · Google",
  trendPeriod: "Periodo: {title}",
  trendHistory: "Tabella completa · storico",
  trendHistoryHint:
    "Sono disponibili solo periodi storici interamente coperti. I dati mancanti sono indicati con —. Usa Sincronizza dati per raccogliere le date mancanti per tutti i luoghi.",
  trendSelectQuarter:
    "Seleziona un trimestre nei filtri data per confrontare lo stesso trimestre negli anni.",
  syncData: "Sincronizza dati",
  syncing: "Sincronizzazione…",
  syncTooltip:
    "Raccoglie le recensioni mancanti per tutti i luoghi di questo confronto. Scegli le date prima di iniziare.",
  syncHelp: "Informazioni sulla sincronizzazione",
  syncHistoryHint:
    "I grafici storici richiedono la copertura completa: interi anni solari, il trimestre completo o gli ultimi 12 mesi completi. La copertura già completata viene riutilizzata. Oggi e le date future restano incompleti.",
  syncAllPlaces:
    "Sono inclusi tutti i {count} luoghi del confronto, indipendentemente dal gruppo visualizzato.",
  syncInvalidDates:
    "Inserisci date valide con la data iniziale precedente o uguale a quella finale.",
  syncStart: "Raccogli recensioni mancanti",
  syncCovered: "Date già coperte",
  syncFrozen:
    "Questo dataset salvato è immutabile. Torna ai dati aggiornati per raccogliere le recensioni mancanti.",
  syncReturnLive: "Torna ai dati aggiornati",

  close: "Chiudi",
  coverageCheck: "Verifica date",
  dataNotes: "Informazioni sui dati",
  evidence: "Ultime recensioni · fino a 20",

  reviewsRatingTrend: "Recensioni e voto medio per mese",
  reviewCountAxis: "Recensioni salvate (scala a sinistra)",
  ratingAxis: "Voto medio (scala a destra, 1–5)",
  noReviewTrend: "Nessuna recensione salvata nel periodo.",
  ratingDistribution: "Distribuzione dei voti",
  starCount: "{count, plural, one {# stella} other {# stelle}}",
  noRatedReviews: "Nessuna recensione con voto nel periodo selezionato.",
  withText: "Recensioni con commento",
  withoutText: "Recensioni senza commento",
  historicalSnapshotNotice:
    "Stai visualizzando i dati salvati con la configurazione v{snapshotVersion}. La configurazione attuale è v{currentVersion}: proprietà e ruoli di questi dati corrispondono alla versione precedente.",
  mapsTotal: "Totale Google Maps",
  mapsChecked: "Verificato il {date}",
  mapsUnavailable: "Totale non ancora rilevato",
  scopedReviews: "Recensioni salvate",
  partialPropertyMetrics:
    "Sono mostrate le recensioni salvate nel periodo selezionato. La copertura delle date è incompleta: conteggi e voti possono cambiare raccogliendo altre recensioni.",
  countScopeHint:
    "Basato sulle recensioni salvate. La copertura verificata delle date è indicata separatamente.",
  scopeTitle: "Perché il conteggio è diverso da Google Maps",
  scopeExplanation:
    "Google Maps conta tutte le recensioni. Qui voti e conteggi usano solo quelle raccolte nelle date salvate e nel periodo selezionato.",
  savedCoverage: "Date delle recensioni salvate",
  ratingTrend: "Valutazione media mensile",
  noRatingTrend: "Nessuna valutazione datata in questo periodo.",
  noProperties: "Nessuna proprietà in questo gruppo.",
  notCollected: "Recensioni non ancora raccolte",
  noThumbnail: "Foto della proprietà non disponibile",
  ratingBasis: "Su {count} recensioni con voto",
  outOfFive: "su 5",
  prepareSnapshot: "Salva dati per il report",
  preparingSnapshot: "Salvataggio dei dati per il report…",
  reuseHint:
    "Tutte le recensioni già raccolte vengono riutilizzate. Per raccogliere le date selezionate mancanti, scegli “Riprova le date mancanti” oppure raccogli le recensioni da I miei luoghi.",
  propertiesNotCollected:
    "Le date selezionate non sono interamente coperte per tutti i luoghi. Attendi la raccolta o riprova le date mancanti.",
  manageProperties: "Vai ai miei luoghi",
  noAnalysisData: "Le recensioni non sono pronte per il confronto",
  collect: "Raccogli recensioni",
  refresh: "Aggiorna recensioni",
  limit: "Numero massimo di recensioni da raccogliere",
  collectHint:
    "Raccoglie dalla data iniziale selezionata, partendo dalle recensioni più recenti. Il fornitore può esaminare anche recensioni successive; il limite può lasciare incompleto lo storico.",
  startingCollection: "Avvio raccolta…",
  collectionError:
    "Non è stato possibile avviare la raccolta. Riprova. Se il problema continua, contatta chi gestisce il tuo spazio.",
  apifyMissing:
    "La raccolta non è disponibile. Contatta chi gestisce il tuo spazio e riprova più tardi.",
  workerMissing:
    "La raccolta non è disponibile. Contatta chi gestisce il tuo spazio e riprova più tardi.",
  stalled:
    "La raccolta è in pausa. Contatta chi gestisce il tuo spazio per riprenderla. Le recensioni salvate sono al sicuro.",
  loadError:
    "Impossibile caricare i dati raccolti. Riprova senza avviare una nuova raccolta.",
  retry: "Riprova",
  collection: "Raccolta",
  version: "Versione configurazione",
  queued: "In coda",
  starting: "Avvio servizio",
  running: "Raccolta in corso",
  importing: "Importazione recensioni",
  completed: "Elaborazione terminata",
  partial: "Parziale",
  failed: "Non riuscita",
  noData: "Raccogli le recensioni per confrontare dati reali",
  noDataHint:
    "Apri “Raccogli recensioni” per iniziare. Puoi lasciare la pagina durante la raccolta.",
  coverage:
    "Le metriche descrivono le recensioni Google raccolte, non tutte quelle mai pubblicate. La completezza della fonte non è garantita. ID mancanti e record esclusi sono indicati sotto. Le date usano UTC.",
  cap: "Limite recensioni raggiunto: lo storico potrebbe essere incompleto.",
  diagnostics: "Dettagli della raccolta",
  returned: "Restituite",
  accepted: "Osservazioni accettate",
  skipped: "Record esclusi",
  duplicates: "ID già osservati",
  missingIds: "ID recensione mancanti",
  missingReviewers: "ID autore mancanti",
  observedRange: "Date di pubblicazione osservate",
  error: "Errore",
  providerErrors: {
    APIFY_USAGE_LIMIT_EXCEEDED:
      "È stato raggiunto il limite mensile di utilizzo del servizio di raccolta. Contatta chi gestisce il tuo spazio per risolvere il limite, poi riprova la raccolta.",
    APIFY_ACCESS_DENIED:
      "Il servizio di raccolta ha negato l’accesso. Contatta chi gestisce il tuo spazio per verificare credenziali e permessi del servizio, poi riprova la raccolta.",
  },
  providerVersion: "Build servizio",
  collectionPeriod: "Periodo di raccolta (UTC)",
  lastCollected: "Ultima raccolta",
  collected: "Recensioni salvate il",
  history: "Recensioni salvate in precedenza",
  latest: "Recensioni raccolte aggiornate",
  reviews: "Recensioni raccolte",
  rated: "Recensioni con voto",
  rating: "Voto medio",
  satisfied: "Quota voti 4–5",
  text: "Recensioni con testo",
  property: "Luogo",
  unavailable: "Non disponibile",
  selected: "Periodo selezionato",
  propertyTrendsTitle: "Andamento delle recensioni",
  propertyTrendsHint:
    "Segui nel tempo recensioni e valutazioni, poi confronta periodi completi.",
  propertyMonthlyDetails: "Esplora i dati mensili",
  propertyQuarterHint:
    "Lo stesso trimestre negli anni · Recensioni Google · Un trattino indica una copertura mancante.",
  propertyHistoryHint:
    "Anni solari completi · Recensioni Google · Un trattino indica una copertura mancante.",
  propertyPeriodChanges: "Variazioni nel periodo selezionato",
  propertyPreviousPeriod:
    "Variazioni rispetto a {range} (UTC). La quota di voti da 1–2 stelle si riferisce al periodo selezionato.",
  propertyChangesMethod:
    "La variazione del voto è espressa in punti; quella del volume in percentuale. Entrambi i periodi richiedono copertura completa; la crescita del volume richiede un conteggio precedente maggiore di zero. La quota di voti bassi usa le recensioni con voto e richiede copertura completa del periodo selezionato.",
  monthly: "Andamento mensile",
  annual: "Storico anni solari completi",
  quarters: "Stesso trimestre per anno",
  rolling: "Ultimi 12 mesi completi",
  bucket: "Periodo",
  noWindowData:
    "Nessun risultato in questo periodo oppure copertura incompleta. I periodi storici richiedono copertura per tutti i luoghi inclusi.",
  outOfRange: "Queste date non sono interamente coperte dai dati salvati.",
  changedConfig:
    "Questo snapshot appartiene a una versione diversa della configurazione. Una nuova raccolta usa la configurazione salvata attuale.",
  shared: "Autori condivisi nel periodo selezionato",
  primaryShare: "Quota ID principale",
  competitorShare: "Quota ID concorrente",
  primaryRating: "Voto sottogruppo principale",
  competitorRating: "Voto sottogruppo concorrente",
  identities: "Autori identificati (principale / concorrente)",
  identityCoverage: "Recensioni con ID autore",
  sharedComparisonHint:
    "Autori che hanno recensito anche {primary}, in base alle recensioni Google nelle date selezionate.",
  sharedEvidenceOpen: "Leggi le recensioni di {count} autori condivisi",
  sharedEvidenceNote:
    "Ultima recensione di ogni autore per ciascun luogo nelle date selezionate, ordinate per pubblicazione più recente. Gli autori sono identificati tramite ID Google; i nomi non vengono raccolti. La differenza di voto è principale meno concorrente. Le date sono in UTC; l’intervallo tra pubblicazioni non indica una visita o uno spostamento.",
  sharedReviewerId: "Autore · {id}",
  sharedReviewDays:
    "{count, plural, =0 {Pubblicate lo stesso giorno} one {# giorno tra le recensioni} other {# giorni tra le recensioni}}",
  sharedEvidenceGap: "Differenza di voto: {gap}",
  reviewLanguage: "Lingua: {language}",
  sharedEvidenceNoText: "Testo della recensione non disponibile",
  sharedEvidenceLoading: "Caricamento delle recensioni condivise…",
  sharedEvidenceError: "Impossibile caricare le recensioni condivise. Riprova.",
  sharedEvidenceRetry: "Riprova",
  sharedEvidenceEmpty:
    "Nessun autore condiviso per questo luogo nelle date selezionate.",
  sharedEvidencePage: "Autori {start}–{end} di {total}",
  sharedEvidencePagination: "Pagine degli autori condivisi",
  sharedEvidencePrevious: "Autori precedenti",
  sharedEvidenceNext: "Autori successivi",
  sharedCount: "Autori condivisi",
  sharedDirection: "Quota degli autori identificati per luogo",
  sharedRatings: "Voti degli autori condivisi",
  sharedFraction: "{shared} su {total} autori identificati",
  sharedRatingFor: "Voto degli autori condivisi · {property}",
  sharedMethod: "Copertura identità e note di calcolo",
  sharedNoMatches:
    "Nessun confronto tra autori per questo ruolo. Scegli un altro ruolo per confrontare i luoghi.",
  sharedNote:
    "Solo identità della stessa fonte; gli ID mancanti sono esclusi. I sottogruppi usano l’ultima recensione valida di ogni autore per proprietà. La sovrapposizione non dimostra visite o quota di mercato.",
  ratingOnly: "Recensione con solo voto",
  source: "Apri recensione originale",
  refreshNote:
    "L’aggiornamento salva una nuova copia delle recensioni. Le copie precedenti restano disponibili.",
  workerActive: "La raccolta continua in background anche se lasci la pagina.",
  snapshotDates: "Copertura richiesta",
  propertyCount: "Proprietà salvate",
  group: "Gruppo",
  allGroups: "Tutti i gruppi",
  coverageTitle: "Copertura delle date delle recensioni",
  coverageReady: "Date selezionate coperte",
  coveredDates: "Raccolte senza lacune note",
  missingDates: "Date mancanti o non verificate",
  requestedDates: "Date di raccolta richieste",
  providerScope:
    "Il fornitore cerca dal {start}, dalle recensioni più recenti; può raccogliere di nuovo recensioni successive.",
  manualCoverageHint:
    "Le recensioni salvate vengono riutilizzate. Aggiornale con una raccolta manuale. Oggi e le date future sono incompleti.",
  frozenCoverageHint:
    "Questo insieme salvato usa recensioni e copertura congelate. La visualizzazione non avvia raccolte.",
  comparisonBlocked:
    "Mancano alcune date selezionate. Le metriche richiedono una copertura completa.",
  futureCoverage:
    "Oggi o le date future non sono ancora interamente disponibili",
  placeRemoved: "Il luogo non è più salvato",
  openPlace: "Apri luogo",
  retryMissing: "Riprova le date mancanti",
  freezeIncomplete:
    "Il periodo salvato per il report non è interamente coperto. Modifica le date del report o raccogli prima le recensioni mancanti.",
  providerThrough: "Giorni UTC completi esaminati fino al {end}.",
} as const;

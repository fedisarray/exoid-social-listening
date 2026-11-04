export const reportsIT = {
  keyLearnings: "Evidenze principali",
  actions: "AZIONI",
  contents: "Indice",
  sources: "Fonti e metodologia",
  unavailable:
    "Dati non disponibili per questa selezione o periodo. Completa la copertura prima di interpretare il grafico.",
  embeddedData:
    "Valori esatti e campioni: clic destro sul grafico → Modifica dati",
  sharedDirection: "Direzione della quota",
  primaryShare: "Quota dei recensori del luogo principale",
  competitorShare: "Quota dei recensori del concorrente",
  primaryReviewers: "Recensori del luogo principale",
  competitorReviewers: "Recensori del concorrente",
  editableCharts: "Grafici modificabili",

  sharedVisitorsTitle: "Visitatori condivisi",
  sharedVisitorsSubtitle: "% DI VISITATORI CONDIVISI NEGLI ULTIMI 12 MESI",
  sharedVisitorsMethod:
    "Per visitatori si intendono recensori Google unici identificabili, non visite fisiche misurate. Quota del luogo principale = recensori condivisi / recensori del luogo principale; quota del concorrente = recensori condivisi / recensori del concorrente, nello stesso periodo L12M. Indicare esplicitamente copertura o identità non disponibili.",

  cancelled: "Annullato",
  cancel: "Annulla report",
  cancelHint:
    "Interrompe l’elaborazione nell’app. La generazione remota e gli eventuali addebiti potrebbero continuare.",

  configure: "Configura PowerPoint",
  title: "Report PowerPoint",
  description:
    "Usa la selezione corrente di luoghi, fogli, date, anni storici e lingua. Ogni report conserva la propria configurazione.",
  generate: "Genera PowerPoint",
  regenerate: "Genera nuova versione",
  draft: "Bozza",
  draftHint: "Verifica dati e impaginazione prima di condividere.",
  history: "Report precedenti ({count})",
  download: "Scarica PowerPoint",
  resume: "Riprendi generazione",
  coverageHint:
    "Raccogli le recensioni mancanti per queste date prima di generare il report.",
  loadError: "Impossibile caricare i report. Riprova.",
  retry: "Riprova",
  version: "Configurazione v{version}",
  historyScope: "Date del report: {start} – {end}",
  queued: "In coda",
  starting: "Avvio del report",
  generating: "Creazione della presentazione",
  downloading: "Salvataggio del PowerPoint",
  completed: "Pronto da scaricare",
  failed: "Generazione non riuscita",
  stalled: "L’elaborazione si è fermata. Riprendi il lavoro salvato.",
  scopeChanged:
    "Questo report usa una configurazione precedente o date diverse.",
  language: "Lingua",
  selected: "Periodo selezionato",
  reviewVolume: "Numero di recensioni",
  averageRating: "Voto medio",
  satisfaction: "Quota di voti a 4–5 stelle",
  sharedReviewers: "Recensori condivisi",
  methodology:
    "I dati descrivono le recensioni Google raccolte, non tutte quelle mai pubblicate. Le date usano UTC. I valori mancanti indicano dati non disponibili, mai zero. La soddisfazione è il numero di recensioni con 4–5 stelle diviso per tutte le recensioni con voto, in percentuale. Il voto medio usa solo recensioni con voto.",
  noFindings:
    "Non sono incluse conclusioni revisionate. Non generare punti di forza, debolezze, raccomandazioni, citazioni o affermazioni non supportate.",
  historyNotice:
    "I periodi storici senza copertura completa non sono disponibili. Distingui sempre ultimi dodici mesi, anni solari e periodo selezionato.",
  errors: {
    INVALID_SELECTION:
      "Scegli almeno un luogo e un foglio e un numero valido di anni storici.",
    REPORTING_NOT_CONFIGURED:
      "La generazione PowerPoint deve essere configurata. Contatta un amministratore.",
    WORKER_NOT_CONFIGURED:
      "L’elaborazione dei report deve essere configurata. Contatta un amministratore.",
    WORKER_UNAVAILABLE:
      "Impossibile avviare l’elaborazione. Riprendi il lavoro salvato.",
    TEMPLATE_NOT_CONFIGURED:
      "La tua organizzazione deve configurare un modello per i report. Contatta un amministratore.",
    TEMPLATE_INVALID:
      "Il modello dell’organizzazione non è disponibile. Chiedi a un amministratore di verificarlo.",
    ANALYSIS_NOT_FOUND: "Il confronto non è disponibile. Torna ai confronti.",
    SNAPSHOT_NOT_FOUND:
      "Il dataset salvato non è disponibile. Ricarica e scegli un altro dataset.",
    CONFIGURATION_CHANGED:
      "Il confronto è cambiato. Ricarica prima di generare il report.",
    COVERAGE_INCOMPLETE:
      "Mancano recensioni per alcune date. Raccogli i dati mancanti e riprova.",
    INVALID_PERIOD: "Scegli un periodo valido che termini prima di oggi.",
    ACCESS_DENIED:
      "Impossibile accedere al servizio di report. Chiedi a un amministratore di verificare la configurazione.",
    USAGE_LIMIT:
      "È stato raggiunto il limite di utilizzo del servizio di report. Contatta un amministratore.",
    RATE_LIMITED: "Il servizio di report è occupato. Riprova tra poco.",
    START_UNCERTAIN:
      "Non è stato possibile confermare la richiesta di generazione. Chiedi a un amministratore di verificarla prima di riprovare, per evitare un doppio addebito.",
    GENERATION_FAILED:
      "Impossibile generare la presentazione. Prova a creare una nuova versione.",
    GENERATION_TIMED_OUT:
      "La generazione ha superato il tempo previsto. Contatta un amministratore prima di riprovare.",
    EXPORT_FAILED:
      "La presentazione è stata creata, ma l’esportazione PowerPoint non è riuscita. Contatta un amministratore.",
    DOWNLOAD_FAILED:
      "Impossibile salvare il file PowerPoint. Contatta un amministratore.",
    INVALID_POWERPOINT:
      "Il servizio ha restituito un file PowerPoint non valido. Contatta un amministratore.",
    PROCESSING_FAILED:
      "Impossibile elaborare il report. Contatta un amministratore.",
  },
};

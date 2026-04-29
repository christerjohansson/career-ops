# Modus: pipeline — URL-Inbox (Second Brain)

Verarbeitet URLs von Stellenanzeigen, die in `data/pipeline.md` gesammelt wurden. Der Kandidat wirft URLs ins Inbox, wann immer er eine entdeckt, und führt später `/career pipeline` aus, um sie alle in einem Rutsch zu verarbeiten.

## Workflow

1. **Lesen** von `data/pipeline.md` → alle Items mit `- [ ]` im Abschnitt "Pendientes" / "Pending" / "Offen" finden
2. **Für jede offene URL**:
   a. **Stellenanzeige extrahieren** mit Playwright (`browser_navigate` + `browser_snapshot`) → WebFetch → WebSearch
   b. Wenn die URL nicht erreichbar ist → als `- [!]` mit Notiz markieren und weitermachen
   c. **JD speichern/normalisieren**: Den extrahierten Inhalt in den Ordner `jds/` speichern (z.B. `jds/firma-rolle.md`). Wenn es sich bereits um ein `local:`-Präfix handelt, einfach überprüfen, ob die Datei existiert.
   d. **Von "Offen" nach "Verarbeitet" verschieben**: `- [x] local:jds/dateiname.md | Firma | Rolle`
3. **Bei mehreren offenen URLs** Agenten parallel starten (Agent-Tool mit `run_in_background`), um Tempo zu machen.
4. **Am Ende** eine Zusammenfassungstabelle ausgeben:

```
| Firma | Rolle | Lokale Datei | Status |
```

## Format von pipeline.md

```markdown
## Offen
- [ ] https://jobs.example.com/posting/123
- [ ] https://boards.greenhouse.io/company/jobs/456 | Company GmbH | Senior PM
- [!] https://private.url/job — Fehler: Login erforderlich

## Verarbeitet
- [x] local:jds/acme-gmbh-ai-pm.md | Acme GmbH | AI PM
- [x] local:jds/bigco-sa.md | BigCo | SA
```

> Hinweis: Die Sektion-Überschriften können auf EN ("Pending"/"Processed"), ES ("Pendientes"/"Procesadas") oder DE ("Offen"/"Verarbeitet") sein. Beim Lesen flexibel sein, beim Schreiben dem Stil der bestehenden Datei treu bleiben.

## Intelligente Erkennung der Stellenanzeige aus der URL

1. **Playwright (bevorzugt):** `browser_navigate` + `browser_snapshot`. Funktioniert mit allen SPAs.
2. **WebFetch (Fallback):** Für statische Seiten oder wenn Playwright nicht verfügbar ist.
3. **WebSearch (letzter Ausweg):** In sekundären Portalen suchen, die die Stellenanzeige indexieren.

**Sonderfälle:**
- **LinkedIn**: Kann Login erfordern → mit `[!]` markieren und den Kandidaten bitten, den Text einzufügen
- **PDF**: Wenn die URL auf ein PDF zeigt, direkt mit dem Read-Tool lesen
- **`local:`-Präfix**: Lokale Datei lesen. Beispiel: `local:jds/linkedin-pm-ai.md` → `jds/linkedin-pm-ai.md` lesen
- **StepStone / XING / kununu**: Häufig deutscher Markt, oft Cookie-Banner. Playwright kann in Snapshot scrollen, um den Anzeigentext zu erfassen
- **Bundesagentur für Arbeit (arbeitsagentur.de)**: Strukturierte Stellenanzeigen, gut maschinenlesbar. WebFetch reicht meist



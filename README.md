# watering-timer-card
Zeitschaltuhr-Funktion und Widget für Home Asisstant Dashboard zur Steuerung und Kontrolle eines Gartenbewässerungssystem mit mehreren Ventilen über KNX. Die eigentliche Ansteuerung erfolgt im Hintergrund über Automationen und entsprechende KNX-Entities. Zusätzlich wird der Wasserverbrauch pro Ventil über die Integration mit einer Enthärtungsanlage von Grünbeck (softliQ.D) gelesen und gespeichert. Die Skripte und diese Beschreibung hier wurden zusammen mit Google Gemini entwickelt. 

Timer function and widget for Home Assistant dashboard for controlling a garden home irrigation system via KNX. Also including reading and storing of individual water usage via integration with Grünbeck system. This was developed together with Google Gemini.

## 🌟 Features

* **Ansprechende Dashboard-Karte:** Schneller Überblick über Restlaufzeiten, Wochentage, Startzeiten und Verbräuche.
* **Saubere Package-Struktur:** Alle Helfer (*input_number*, *input_datetime*, *input_text*, *timer*) und Automationen pro Bewässerungskreis kompakt in einer einzigen YAML-Datei.
* **Latenz-Toleranz für Wasserzähler:** Automatische Verzögerung nach Abschaltung, damit zeitversetzte Cloud-Updates (z. B. von Grünbeck-Anlagen) den korrekten Verbrauch erfassen.
* **Flexible Ventilsteuerung:** Unterstützt Hauptventile/Netzteile sowie Kreise mit Einzel- oder Doppel-Schaltern (z. B. KNX oder Smarte Steckdosen).

---

## 📦 1. Installation der Custom Card (`watering-timer-card.js`)

1. Lade die Datei `watering-timer-card.js` in deinen Home Assistant Ordner `www/` hoch (z. B. `/config/www/watering-timer-card.js`).
2. Gehe in Home Assistant auf **Einstellungen -> Dashboards -> drei Punkte oben rechts -> Ressourcen**.
3. Füge eine neue Ressource hinzu:
   * **URL:** `/local/watering-timer-card.js`
   * **Ressourcentyp:** `JavaScript-Modul`

*(Oder füge das Repository als Benutzerdefiniertes Repository in HACS unter Frontend hinzu).*

---

## ⚙️ 2. Einrichten des Backend-Packages (`packages/bewaesserung.yaml`)

### Schritt 2.1: Packages in `configuration.yaml` aktivieren
Füge folgendes in deine `configuration.yaml` ein, falls noch nicht vorhanden:

```yaml
homeassistant:
  packages: !include_dir_named packages
```
Erstelle anschließend den Ordner packages/ im Hauptverzeichnis deines Home Assistant.

### Schritt 2.2: bewaesserung.yaml anlegen
Erstelle im Ordner packages/ die Datei `bewaesserung.yaml`. Füge dort für jeden deiner Bewässerungskreise die Helfer und Automationen ein.
Die Muster-Vorlage für einen Bewässerungskreis findest du hier unter den Dateien. 

Wichtig: Der Switch in der Automation unter Punkt #5 muss zur entsprechenden Entität aus der KNX-Integration passen (oder auch eine andere Art von Schalter, wenn es kein KNX bei dir ist).

---

## 🎨 3. Dashboard-Karte einbinden

Füge deinem Dashboard eine neue Manuelle Karte hinzu und nutze folgenden YAML-Code:

```yaml
type: custom:watering-timer-card
title: Beispiel Kreis
time_helper: input_datetime.beispiel_kreis_zeit
duration_helper: input_number.beispiel_kreis_dauer
days_helper: input_text.beispiel_kreis_w
valve_switch: switch.DEIN_VENTIL_SCHALTER
last_run_helper: input_datetime.beispiel_kreis_last_run
timer_helper: timer.beispiel_kreis_restlaufzeit
last_water_helper: input_number.beispiel_kreis_verbrauch
```
---

## 🔄 4. YAMLs neu laden

Nach dem Einfügen in die bewaesserung.yaml musst du Home Assistant nicht komplett neu starten:
Gehe zu Entwicklerwerkzeuge -> YAML.
Klicke auf "Alle YAML-Konfigurationen neu laden".

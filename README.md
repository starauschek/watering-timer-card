# watering-timer-card
Zeitschaltuhr-Funktion und Widget für Home Asisstant Dashboard zur Steuerung und Kontrolle eines Gartenbewässerungssystem mit mehreren Ventilen über KNX. Die eigentliche Ansteuerung erfolgt im Hintergrund über Automationen und entsprechende KNX-Entities. Zusätzlich wird der Wasserverbrauch pro Ventil über die Integration mit einer Enthärtungsanlage von Grünbeck (softliQ.D) gelesen und gespeichert. Die Skripte und diese Beschreibung hier wurden zusammen mit Google Gemini entwickelt. 

Timer function and widget for Home Assistant dashboard for controlling a garden home irrigation system via KNX. Also including reading and storing of individual water usage via integration with Grünbeck system. This was developed together with Google Gemini.

<img width="1830" height="1141" alt="image" src="https://github.com/user-attachments/assets/20ce44f3-1943-4995-9ec1-ae38e33d28ed" />

## 🌟 Features

* **Sleek Dashboard Card:** Quick overview of remaining runtimes, selected weekdays, start times, and water consumption.
* **Clean Package Structure:** All helpers (`input_number`, `input_datetime`, `input_text`, `timer`) and automations per irrigation zone are neatly grouped into a single YAML file.
* **Latency Tolerance for Water Meters:** Features an automatic delay post-shutoff to allow delayed cloud updates (e.g., from Grünbeck systems) to capture accurate water usage.
* **Flexible Valve Control:** Supports main power supplies/transformers as well as single- or dual-switch irrigation zones (e.g., KNX relays or smart plugs).

---

## 📦 1. Custom Card Installation (`watering-timer-card.js`)

1. Upload the `watering-timer-card.js` file to your Home Assistant `www/` directory (e.g., `/config/www/watering-timer-card.js`).
2. In Home Assistant, navigate to **Settings -> Dashboards -> Three Dots (top right) -> Resources**.
3. Add a new resource:
   * **URL:** `/local/watering-timer-card.js`
   * **Resource Type:** `JavaScript Module`

*(Alternatively, add this repository as a Custom Repository in HACS under Frontend).*

---

## ⚙️ 2. Setting Up the Backend Package (`packages/bewaesserung.yaml`)

### Step 2.1: Enable Packages in `configuration.yaml`
Add the following lines to your `configuration.yaml` if you haven't already:

```yaml
homeassistant:
  packages: !include_dir_named packages
```
Next, create a folder named packages/ in your Home Assistant root directory.

### Step 2.2: Create bewaesserung.yaml
Create the file bewaesserung.yaml inside the packages/ directory. Add the helpers and automations for each of your irrigation zones here. You will find the template for an irrigation zone among the files in this repository.

Note: The switch in the automation under step #5 must match the corresponding entity from your KNX integration (or any other type of switch entity if you are not using KNX).

---

## 🎨 3. Dashboard Card Configuration

Add a new Manual Card to your Home Assistant dashboard and paste the following YAML:

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

## 🔄 4. Reloading YAML Configuration

After editing `bewaesserung.yaml`, you do not need to restart Home Assistant completely:

Go to Developer Tools -> YAML.

Click on "All YAML Configuration".

---

THAT'S IT! I hope it works for you and if not just contact me. 

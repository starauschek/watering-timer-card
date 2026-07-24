// /homeassistant/www/watering-timer-card.js
import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class WateringTimerCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
      _timeRemaining: { type: String } // Interner State für das Live-Herunterzählen
    };
  }

  constructor() {
    super();
    this._timeRemaining = "";
    this._interval = null;
  }

  // Wird aufgerufen, wenn die Karte aus dem DOM entfernt wird (z. B. Tab geschlossen)
  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopInterval();
  }

  static get styles() {
    return css`
      ha-card {
        padding: 16px;
        background: var(--ha-card-background, var(--card-background-color, white));
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, none);
        position: relative;
        overflow: hidden;
      }
      .title {
        font-size: 1.2em;
        font-weight: 500;
        margin-bottom: 10px;
        text-align: center;
        color: var(--primary-text-color);
      }
      .clock-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 15px 0;
        gap: 10px;
      }
      .side-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 0.85em;
        color: var(--secondary-text-color);
        min-width: 0;
      }
      .side-info-label {
        font-weight: 500;
        font-size: 0.8em;
        text-transform: uppercase;
        margin-bottom: 4px;
        color: var(--primary-color);
      }
      .side-info-value {
        font-weight: bold;
        color: var(--primary-text-color);
        word-break: break-word;
      }
      .radial-picker {
        width: 140px;
        height: 140px;
        border-radius: 50%;
        border: 4px solid var(--primary-color);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
        background: rgba(var(--rgb-primary-color), 0.03);
        transition: all 0.5s ease;
        cursor: pointer;
        flex-shrink: 0;
      }
      .radial-picker.active {
        border-color: #2196F3;
        background: rgba(33, 150, 243, 0.15);
        box-shadow: 0 0 15px rgba(33, 150, 243, 0.4);
        animation: pulse 2s infinite alternate;
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.03); }
      }
      .time-display {
        font-size: 1.6em;
        font-weight: bold;
        color: var(--primary-text-color);
        z-index: 2;
      }
      .picker-label {
        font-size: 0.75em;
        color: var(--secondary-text-color);
        margin-top: 4px;
        z-index: 2;
      }
      .status-badge {
        background: #2196F3;
        color: white;
        padding: 1px 6px;
        border-radius: 10px;
        font-size: 0.7em;
        font-weight: bold;
        margin-top: 4px;
        z-index: 2;
        animation: blink 1.5s infinite;
      }
      @keyframes blink {
        0% { opacity: 0.6; }
        50% { opacity: 1; }
        100% { opacity: 0.6; }
      }
      .slider-container {
        margin: 15px 0;
      }
      .slider-header {
        display: flex;
        justify-content: space-between;
        color: var(--secondary-text-color);
        font-size: 0.9em;
        margin-bottom: 5px;
      }
      input[type="range"] {
        width: 100%;
        accent-color: var(--primary-color);
      }
      .days-container {
        display: flex;
        justify-content: space-between;
        margin-top: 15px;
      }
      .day-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      .day-btn.active {
        background: var(--primary-color);
        color: var(--text-primary-color, white);
        border-color: var(--primary-color);
      }
    `;
  }

  // Hilfsfunktion zum Starten des Sekunden-Tickers
  _startInterval(timerEntity) {
    if (this._interval) return;

    this._updateCountdown(timerEntity);
    this._interval = setInterval(() => {
      this._updateCountdown(timerEntity);
    }, 1000);
  }

  _stopInterval() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  // Berechnet live die verbleibende Zeit basierend auf den Home Assistant Attributen
  _updateCountdown(timerEntity) {
    if (!timerEntity || timerEntity.state !== 'active') {
      this._timeRemaining = "";
      this._stopInterval();
      return;
    }

    const duration = timerEntity.attributes.duration; // HH:MM:SS
    const finishetAt = new Date(timerEntity.attributes.finishes_at);
    const now = new Date();

    const diffMs = finishetAt - now;
    if (diffMs <= 0) {
      this._timeRemaining = "00:00";
      this._stopInterval();
      return;
    }

    const diffSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;

    // Formatiert zu MM:SS (z.B. 14:05)
    this._timeRemaining = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} min`;
  }

  render() {
    const timeEntity = this.hass.states[this.config.time_helper];
    const durationEntity = this.hass.states[this.config.duration_helper];
    const daysEntity = this.hass.states[this.config.days_helper];
    const switchEntity = this.hass.states[this.config.valve_switch];
    const lastRunEntity = this.hass.states[this.config.last_run_helper];
    const lastWaterEntity = this.config.last_water_helper ? this.hass.states[this.config.last_water_helper] : null;
    const timerEntity = this.config.timer_helper ? this.hass.states[this.config.timer_helper] : null;

    if (!timeEntity || !durationEntity || !daysEntity || !switchEntity) {
      return html`<ha-alert alert-type="error">Wichtige Entitäten fehlen! Bitte Konfiguration prüfen.</ha-alert>`;
    }

    const currentTime = timeEntity.state;
    const currentDuration = durationEntity.state;
    const activeDays = daysEntity.state ? daysEntity.state.split(',') : [];
    const isRunning = switchEntity.state === 'on';

    // Steuerung des Tickers basierend auf Timer-Status
    if (isRunning && timerEntity && timerEntity.state === 'active') {
      this._startInterval(timerEntity);
    } else {
      this._stopInterval();
    }

    // Letzten Lauf formatieren (Links)
    let lastRunDate = "-";
    let lastRunTime = "";
    if (lastRunEntity && lastRunEntity.state && lastRunEntity.state !== 'unknown' && lastRunEntity.state !== 'unavailable') {
      try {
        const dateObj = new Date(lastRunEntity.state);
        lastRunDate = dateObj.toLocaleString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
        lastRunTime = dateObj.toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit' }) + " Uhr";
      } catch (e) {
        lastRunDate = lastRunEntity.state;
      }
    }

    // Letzten Verbrauch formatieren (Rechts)
    let lastWaterText = "-";
    if (lastWaterEntity && lastWaterEntity.state && lastWaterEntity.state !== 'unknown' && lastWaterEntity.state !== 'unavailable') {
      lastWaterText = `${parseFloat(lastWaterEntity.state).toFixed(0)} Liter`;
    }

    const daysOfWeek = [
      { key: 'Mo', label: 'M' },
      { key: 'Di', label: 'D' },
      { key: 'Mi', label: 'M' },
      { key: 'Do', label: 'D' },
      { key: 'Fr', label: 'F' },
      { key: 'Sa', label: 'S' },
      { key: 'So', label: 'S' }
    ];

    return html`
      <ha-card>
        <div class="title">${this.config.title || 'Bewässerungs-Timer'}</div>
        
        <div class="clock-container">
          
          <div class="side-info">
            <div class="side-info-label">Zuletzt</div>
            <div class="side-info-value">${lastRunDate}</div>
            <div style="font-size: 0.9em;">${lastRunTime}</div>
          </div>
          
          <div class="radial-picker ${isRunning ? 'active' : ''}" @click="${this._editTime}">
            <div class="time-display">
              ${isRunning && this._timeRemaining ? this._timeRemaining : currentTime.substring(0, 5)}
            </div>
            <div class="picker-label">${isRunning ? 'Aktiv' : 'Startzeit 🕒'}</div>
            ${isRunning ? html`<div class="status-badge">ON</div>` : ''}
          </div>
          
          <div class="side-info">
            <div class="side-info-label">Menge</div>
            <div class="side-info-value">${lastWaterText}</div>
          </div>
          
        </div>

        <div class="slider-container">
          <div class="slider-header">
            <span>Dauer</span>
            <span><strong>${currentDuration} Min.</strong></span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="60" 
            .value="${currentDuration}" 
            @input="${this._setDuration}"
            ?disabled="${isRunning}"
          />
        </div>

        <div class="days-container">
          ${daysOfWeek.map(day => html`
            <button 
              class="day-btn ${activeDays.includes(day.key) ? 'active' : ''}" 
              @click="${() => this._toggleDay(day.key, activeDays)}"
              ?disabled="${isRunning}"
            >
              ${day.label}
            </button>
          `)}
        </div>
      </ha-card>
    `;
  }

  _editTime() {
    if (this.hass.states[this.config.valve_switch].state === 'on') return;
    const event = new Event('hass-more-info', { bubbles: true, composed: true });
    event.detail = { entityId: this.config.time_helper };
    this.dispatchEvent(event);
  }

  _setDuration(e) {
    const value = e.target.value;
    this.hass.callService('input_number', 'set_value', {
      entity_id: this.config.duration_helper,
      value: value
    });
  }

  _toggleDay(day, activeDays) {
    let newDays = [...activeDays];
    if (newDays.includes(day)) {
      newDays = newDays.filter(d => d !== day);
    } else {
      newDays.push(day);
    }
    
    const order = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    newDays.sort((a, b) => order.indexOf(a) - order.indexOf(b));

    this.hass.callService('input_text', 'set_value', {
      entity_id: this.config.days_helper,
      value: newDays.join(',')
    });
  }

  setConfig(config) {
    if (!config.time_helper || !config.duration_helper || !config.days_helper || !config.valve_switch) {
      throw new Error("Bitte definiere mind. 'time_helper', 'duration_helper', 'days_helper' und 'valve_switch'!");
    }
    this.config = config;
  }

  getCardSize() {
    return 4;
  }
}

customElements.define("watering-timer-card", WateringTimerCard);

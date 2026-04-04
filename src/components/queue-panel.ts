import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { ResolvedConfig } from "../types";
import { callEsphomeService } from "../utils/entity-helpers";
import { cardStyles } from "../styles";

@customElement("irrigation-queue-panel")
export class IrrigationQueuePanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public resolved!: ResolvedConfig;
  @property() public devicePrefix?: string;

  @state() private _selectedValveIndex = 0;

  static styles = cardStyles;

  protected render() {
    if (!this.devicePrefix || this.resolved.valves.length === 0) return nothing;

    return html`
      <div class="queue-panel">
        <div class="section-title">Queue</div>
        <div class="queue-controls">
          <select
            @change=${(e: Event) => {
              this._selectedValveIndex = (e.target as HTMLSelectElement).selectedIndex;
            }}
          >
            ${this.resolved.valves.map(
              (v, i) => html`<option value=${i}>${v.name}</option>`,
            )}
          </select>
          <ha-icon-button @click=${this._queueValve} title="Add to queue">
            <ha-icon icon="mdi:playlist-plus"></ha-icon>
          </ha-icon-button>
          <ha-icon-button @click=${this._clearQueue} title="Clear queue">
            <ha-icon icon="mdi:playlist-remove"></ha-icon>
          </ha-icon-button>
          <ha-icon-button @click=${this._startFromQueue} title="Start from queue">
            <ha-icon icon="mdi:playlist-play"></ha-icon>
          </ha-icon-button>
        </div>
      </div>
    `;
  }

  private _queueValve(): void {
    if (!this.devicePrefix) return;
    callEsphomeService(this.hass, this.devicePrefix, "queue_valve", {
      valve: this._selectedValveIndex,
    });
  }

  private _clearQueue(): void {
    if (!this.devicePrefix) return;
    callEsphomeService(
      this.hass,
      this.devicePrefix,
      "clear_queued_valves",
    );
  }

  private _startFromQueue(): void {
    if (!this.devicePrefix) return;
    callEsphomeService(
      this.hass,
      this.devicePrefix,
      "start_from_queue",
    );
  }
}

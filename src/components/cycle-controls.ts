import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { ResolvedConfig } from "../types";
import {
  callSwitchService,
  callEsphomeService,
  entityState,
} from "../utils/entity-helpers";
import { cardStyles } from "../styles";

@customElement("irrigation-cycle-controls")
export class IrrigationCycleControls extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public resolved!: ResolvedConfig;
  @property() public devicePrefix?: string;

  static styles = cardStyles;

  protected render() {
    const mainState = this.resolved.main_switch
      ? entityState(this.hass, this.resolved.main_switch)
      : "off";
    const isRunning = mainState === "on";

    return html`
      <div class="controls">
        ${!isRunning
          ? html`
              <ha-icon-button
                @click=${this._startCycle}
                title="Start full cycle"
              >
                <ha-icon icon="mdi:play"></ha-icon>
              </ha-icon-button>
            `
          : html`
              <ha-icon-button
                @click=${this._pause}
                title="Pause"
              >
                <ha-icon icon="mdi:pause"></ha-icon>
              </ha-icon-button>
              <ha-icon-button
                @click=${this._stop}
                title="Stop"
              >
                <ha-icon icon="mdi:stop"></ha-icon>
              </ha-icon-button>
            `}
        <ha-icon-button
          @click=${this._previousValve}
          title="Previous valve"
          .disabled=${!isRunning}
        >
          <ha-icon icon="mdi:skip-previous"></ha-icon>
        </ha-icon-button>
        <ha-icon-button
          @click=${this._nextValve}
          title="Next valve"
          .disabled=${!isRunning}
        >
          <ha-icon icon="mdi:skip-next"></ha-icon>
        </ha-icon-button>
      </div>
    `;
  }

  private _startCycle(): void {
    if (this.resolved.main_switch) {
      callSwitchService(this.hass, this.resolved.main_switch, true);
    } else if (this.devicePrefix) {
      callEsphomeService(this.hass, this.devicePrefix, "start_full_cycle");
    }
  }

  private _stop(): void {
    if (this.resolved.main_switch) {
      callSwitchService(this.hass, this.resolved.main_switch, false);
    } else if (this.devicePrefix) {
      callEsphomeService(this.hass, this.devicePrefix, "shutdown");
    }
  }

  private _pause(): void {
    if (this.devicePrefix) {
      callEsphomeService(this.hass, this.devicePrefix, "pause");
    }
  }

  private _previousValve(): void {
    if (this.devicePrefix) {
      callEsphomeService(this.hass, this.devicePrefix, "previous_valve");
    }
  }

  private _nextValve(): void {
    if (this.devicePrefix) {
      callEsphomeService(this.hass, this.devicePrefix, "next_valve");
    }
  }
}

import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { ResolvedConfig } from "../types";
import {
  callSwitchService,
  callButtonPress,
  getControllerStatus,
} from "../utils/entity-helpers";
import { localize } from "../localize";
import { logRender } from "../utils/logger";
import { cardStyles } from "../styles";

@customElement("irrigation-cycle-controls")
export class IrrigationCycleControls extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public resolved!: ResolvedConfig;

  static styles = cardStyles;

  protected render() {
    if (!this.resolved.main_switch) return nothing;

    const status = getControllerStatus(this.hass, this.resolved);
    const isRunning = status === "running";
    const isPaused = status === "paused";

    logRender("cycle-controls", `status=${status}`, {
      main_switch: this.resolved.main_switch,
      pause_button: this.resolved.pause_button,
    });

    return html`
      <div class="controls">
        ${!isRunning && !isPaused
          ? html`
              <ha-icon-button
                @click=${this._startCycle}
                title=${localize(this.hass, "controls.start")}
              >
                <ha-icon icon="mdi:play"></ha-icon>
              </ha-icon-button>
            `
          : nothing}
        ${isRunning && this.resolved.pause_button
          ? html`
              <ha-icon-button
                @click=${this._pause}
                title=${localize(this.hass, "controls.pause")}
              >
                <ha-icon icon="mdi:pause"></ha-icon>
              </ha-icon-button>
            `
          : nothing}
        ${isPaused
          ? html`
              <ha-icon-button
                @click=${this._resume}
                title=${localize(this.hass, "controls.resume")}
              >
                <ha-icon icon="mdi:play-pause"></ha-icon>
              </ha-icon-button>
            `
          : nothing}
        ${isRunning || isPaused
          ? html`
              <ha-icon-button
                @click=${this._stop}
                title=${localize(this.hass, "controls.stop")}
              >
                <ha-icon icon="mdi:stop"></ha-icon>
              </ha-icon-button>
            `
          : nothing}
      </div>
    `;
  }

  private _startCycle(): void {
    if (this.resolved.main_switch) {
      callSwitchService(this.hass, this.resolved.main_switch, true);
    }
  }

  private _stop(): void {
    if (this.resolved.main_switch) {
      callSwitchService(this.hass, this.resolved.main_switch, false);
    }
  }

  private _pause(): void {
    if (this.resolved.pause_button) {
      callButtonPress(this.hass, this.resolved.pause_button);
    }
  }

  private _resume(): void {
    if (this.resolved.main_switch) {
      callSwitchService(this.hass, this.resolved.main_switch, true);
    }
  }
}

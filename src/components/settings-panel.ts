import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { ResolvedConfig } from "../types";
import {
  entityState,
  entityNumericValue,
  entityAttributes,
  callSwitchService,
  callNumberService,
} from "../utils/entity-helpers";
import { cardStyles } from "../styles";

@customElement("irrigation-settings-panel")
export class IrrigationSettingsPanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public resolved!: ResolvedConfig;

  static styles = cardStyles;

  protected render() {
    const hasSliders = this.resolved.multiplier || this.resolved.repeat;
    const hasToggles =
      this.resolved.auto_advance_switch ||
      this.resolved.reverse_switch ||
      this.resolved.standby_switch ||
      this.resolved.queue_enable_switch;

    if (!hasSliders && !hasToggles) return nothing;

    return html`
      <div class="settings-panel">
        <div class="section-title">Settings</div>
        ${this._renderSlider("Multiplier", this.resolved.multiplier)}
        ${this._renderSlider("Repeat", this.resolved.repeat)}
        <div class="toggles">
          ${this._renderToggle("Auto-advance", this.resolved.auto_advance_switch)}
          ${this._renderToggle("Reverse", this.resolved.reverse_switch)}
          ${this._renderToggle("Standby", this.resolved.standby_switch)}
          ${this._renderToggle("Queue", this.resolved.queue_enable_switch)}
        </div>
      </div>
    `;
  }

  private _renderSlider(label: string, entityId?: string) {
    if (!entityId) return nothing;
    const value = entityNumericValue(this.hass, entityId);
    const attrs = entityAttributes(this.hass, entityId);
    const min = (attrs.min as number) ?? 0;
    const max = (attrs.max as number) ?? 10;
    const step = (attrs.step as number) ?? 0.1;

    return html`
      <div class="setting-row">
        <span class="setting-label">${label}</span>
        <div style="display:flex;align-items:center;gap:8px;flex:1;margin-left:16px;">
          <ha-slider
            .min=${min}
            .max=${max}
            .step=${step}
            .value=${value ?? min}
            pin
            @change=${(e: Event) =>
              this._onSliderChange(entityId, e)}
            style="flex:1"
          ></ha-slider>
          <span class="setting-value">${value ?? "?"}</span>
        </div>
      </div>
    `;
  }

  private _renderToggle(label: string, entityId?: string) {
    if (!entityId) return nothing;
    const isOn = entityState(this.hass, entityId) === "on";

    return html`
      <div class="toggle-item">
        <ha-switch
          .checked=${isOn}
          @change=${() => callSwitchService(this.hass, entityId, !isOn)}
        ></ha-switch>
        <span>${label}</span>
      </div>
    `;
  }

  private _onSliderChange(entityId: string, e: Event): void {
    const target = e.target as HTMLInputElement;
    const value = parseFloat(target.value);
    if (!isNaN(value)) {
      callNumberService(this.hass, entityId, value);
    }
  }
}

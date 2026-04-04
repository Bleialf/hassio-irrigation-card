import { LitElement, html, nothing, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { ResolvedValve } from "../types";
import {
  entityState,
  entityNumericValue,
  entityAttributes,
  callSwitchService,
  callNumberService,
} from "../utils/entity-helpers";
import { localize } from "../localize";
import { cardStyles } from "../styles";

@customElement("irrigation-valve-row")
export class IrrigationValveRow extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public valve!: ResolvedValve;
  @property({ type: Boolean }) public compact = false;

  static styles = cardStyles;

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.has("valve") || changedProps.has("compact")) return true;
    if (changedProps.has("hass")) {
      const oldHass = changedProps.get("hass") as HomeAssistant | undefined;
      if (!oldHass) return true;
      const entities = [
        this.valve.valve_switch,
        this.valve.enable_switch,
        this.valve.run_duration,
      ].filter(Boolean) as string[];
      return entities.some(
        (id) => oldHass.states[id] !== this.hass.states[id],
      );
    }
    return false;
  }

  protected render() {
    const isOn = entityState(this.hass, this.valve.valve_switch) === "on";
    const isEnabled = this.valve.enable_switch
      ? entityState(this.hass, this.valve.enable_switch) !== "off"
      : true;
    const duration = entityNumericValue(this.hass, this.valve.run_duration);
    const attrs = entityAttributes(this.hass, this.valve.run_duration);

    return html`
      <div class="valve-row">
        <ha-icon
          class="valve-icon ${isOn ? "active" : ""}"
          .icon=${this.valve.icon}
        ></ha-icon>
        <div class="valve-info">
          <div class="valve-name">${this.valve.name}</div>
          ${isOn
            ? html`<div class="valve-status">
                ${localize(this.hass, "valve.running")}
              </div>`
            : nothing}
          ${isOn
            ? html`<div class="progress-bar">
                <div class="fill" style="width: 50%"></div>
              </div>`
            : nothing}
        </div>
        ${this.valve.run_duration && !this.compact
          ? html`
              <div class="valve-duration">
                <span>
                  ${duration ?? "?"}
                  ${localize(this.hass, "valve.min")}
                </span>
                <ha-icon-button
                  .path=${"M19,13H5V11H19V13Z"}
                  @click=${() => this._adjustDuration(-1, duration, attrs)}
                ></ha-icon-button>
                <ha-icon-button
                  .path=${"M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"}
                  @click=${() => this._adjustDuration(1, duration, attrs)}
                ></ha-icon-button>
              </div>
            `
          : nothing}
        ${this.valve.enable_switch
          ? html`
              <ha-switch
                .checked=${isEnabled}
                @change=${this._toggleEnable}
                title=${localize(this.hass, "valve.include_in_cycle")}
              ></ha-switch>
            `
          : nothing}
        <ha-switch
          .checked=${isOn}
          @change=${this._toggleValve}
        ></ha-switch>
      </div>
    `;
  }

  private _toggleValve(): void {
    const isOn = entityState(this.hass, this.valve.valve_switch) === "on";
    callSwitchService(this.hass, this.valve.valve_switch, !isOn);
  }

  private _toggleEnable(): void {
    if (!this.valve.enable_switch) return;
    const isEnabled =
      entityState(this.hass, this.valve.enable_switch) !== "off";
    callSwitchService(this.hass, this.valve.enable_switch, !isEnabled);
  }

  private _adjustDuration(
    delta: number,
    current: number | undefined,
    attrs: Record<string, unknown>,
  ): void {
    if (!this.valve.run_duration || current === undefined) return;
    const min = (attrs.min as number) ?? 0;
    const max = (attrs.max as number) ?? 60;
    const step = (attrs.step as number) ?? 1;
    const newVal = Math.min(max, Math.max(min, current + delta * step));
    callNumberService(this.hass, this.valve.run_duration, newVal);
  }
}

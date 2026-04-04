import { LitElement, html, css, nothing, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  HomeAssistant,
  fireEvent,
  LovelaceCardEditor,
} from "custom-card-helpers";
import { IrrigationCardConfig, ValveConfig } from "./types";
import { EDITOR_TAG } from "./const";
import { localize } from "./localize";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Force HA to load entity-picker and other internal components.
const loadHaComponents = async () => {
  if (customElements.get("ha-entity-picker")) return;
  const helpers = await (window as any).loadCardHelpers?.();
  if (!helpers) return;
  const entitiesCard = await helpers.createCardElement({
    type: "entities",
    entities: [],
  });
  if (entitiesCard) {
    await entitiesCard.constructor?.getConfigElement?.();
  }
};
loadHaComponents();
/* eslint-enable @typescript-eslint/no-explicit-any */

interface HassDevice {
  id: string;
  name?: string;
  name_by_user?: string;
  manufacturer?: string;
  model?: string;
}

@customElement(EDITOR_TAG)
export class IrrigationCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: IrrigationCardConfig;

  static styles = css`
    .form-group {
      padding: 8px 0;
    }
    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 4px;
      color: var(--primary-text-color);
    }
    .valve-item {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 8px;
      margin: 4px 0;
    }
    .valve-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    ha-textfield,
    ha-entity-picker {
      display: block;
      width: 100%;
    }
    .device-select {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color, var(--primary-background-color));
      color: var(--primary-text-color);
      font-size: 1em;
      cursor: pointer;
    }
    .switch-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 0;
    }
    .hint {
      font-size: 0.85em;
      color: var(--secondary-text-color);
      padding: 4px 0;
    }
  `;

  public setConfig(config: IrrigationCardConfig): void {
    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return changedProps.has("_config") || changedProps.has("hass");
  }

  private _getDevices(): HassDevice[] {
    const devices = (this.hass as unknown as { devices?: Record<string, HassDevice> })
      .devices;
    if (!devices) return [];
    return Object.values(devices).sort((a, b) =>
      (a.name_by_user || a.name || "").localeCompare(
        b.name_by_user || b.name || "",
      ),
    );
  }

  private _getSelectedDeviceName(): string {
    if (!this._config.device_id) return "";
    const devices = (this.hass as unknown as { devices?: Record<string, HassDevice> })
      .devices;
    if (!devices) return this._config.device_id;
    const device = devices[this._config.device_id];
    if (!device) return this._config.device_id;
    return device.name_by_user || device.name || this._config.device_id;
  }

  protected render() {
    if (!this.hass || !this._config) return nothing;

    const devices = this._getDevices();

    const t = (key: string) => localize(this.hass, key);

    return html`
      <div class="form-group">
        <ha-textfield
          label=${t("editor.title")}
          .value=${this._config.title || ""}
          @input=${(e: InputEvent) =>
            this._updateConfig("title", (e.target as HTMLInputElement).value)}
        ></ha-textfield>
      </div>

      <div class="form-group">
        <label>${t("editor.device_label")}</label>
        <select
          class="device-select"
          @change=${(e: Event) => {
            const value = (e.target as HTMLSelectElement).value;
            this._updateConfig("device_id", value || undefined);
          }}
        >
          <option value="" ?selected=${!this._config.device_id}>
            ${t("editor.device_placeholder")}
          </option>
          ${devices.map(
            (device) => html`
              <option
                value=${device.id}
                ?selected=${device.id === this._config.device_id}
              >
                ${device.name_by_user || device.name || device.id}
                ${device.manufacturer ? ` (${device.manufacturer})` : ""}
              </option>
            `,
          )}
        </select>
        ${this._config.device_id
          ? html`<div class="hint">
              ${t("editor.device_selected")} ${this._getSelectedDeviceName()}
            </div>`
          : html`<div class="hint">${t("editor.device_hint")}</div>`}
      </div>

      <div class="form-group">
        <label>${t("editor.controller_entities")}</label>
        ${this._renderEntityPicker(t("editor.main_switch"), "main_switch", "switch")}
        ${this._renderEntityPicker(t("editor.auto_advance"), "auto_advance_switch", "switch")}
        ${this._renderEntityPicker(t("editor.reverse"), "reverse_switch", "switch")}
        ${this._renderEntityPicker(t("editor.pause_button"), "pause_button", "button")}
        ${this._renderEntityPicker(t("editor.standby"), "standby_switch", "switch")}
        ${this._renderEntityPicker(t("editor.queue_enable"), "queue_enable_switch", "switch")}
        ${this._renderEntityPicker(t("editor.multiplier"), "multiplier", "number")}
        ${this._renderEntityPicker(t("editor.repeat"), "repeat", "number")}
      </div>

      <div class="form-group">
        <label>${t("editor.status_sensors")}</label>
        ${this._renderEntityPicker(t("editor.status"), "status_sensor", "sensor")}
        ${this._renderEntityPicker(t("editor.progress"), "progress_sensor", "sensor")}
        ${this._renderEntityPicker(t("editor.time_remaining"), "time_remaining_sensor", "sensor")}
      </div>

      <div class="form-group">
        <label>${t("editor.display_options")}</label>
        ${this._renderSwitch(t("editor.show_controls"), "show_controls")}
        ${this._renderSwitch(t("editor.show_settings"), "show_settings")}
        ${this._renderSwitch(t("editor.compact_mode"), "compact")}
      </div>

      <div class="form-group">
        <label>${t("editor.valves")}</label>
        ${(this._config.valves || []).map(
          (valve, index) => html`
            <div class="valve-item">
              <div class="valve-header">
                <span>${t("editor.valve_n")} ${index + 1}</span>
                <ha-icon-button @click=${() => this._removeValve(index)}>
                  <ha-icon icon="mdi:delete"></ha-icon>
                </ha-icon-button>
              </div>
              <ha-textfield
                label=${t("editor.valve_name")}
                .value=${valve.name || ""}
                @input=${(e: InputEvent) =>
                  this._updateValve(
                    index,
                    "name",
                    (e.target as HTMLInputElement).value,
                  )}
              ></ha-textfield>
              <ha-entity-picker
                label=${t("editor.valve_switch")}
                .hass=${this.hass}
                .value=${valve.valve_switch || ""}
                .includeDomains=${["switch"]}
                @value-changed=${(e: CustomEvent) =>
                  this._updateValve(index, "valve_switch", e.detail.value)}
              ></ha-entity-picker>
              <ha-entity-picker
                label=${t("editor.enable_switch")}
                .hass=${this.hass}
                .value=${valve.enable_switch || ""}
                .includeDomains=${["switch"]}
                @value-changed=${(e: CustomEvent) =>
                  this._updateValve(index, "enable_switch", e.detail.value)}
              ></ha-entity-picker>
              <ha-entity-picker
                label=${t("editor.run_duration")}
                .hass=${this.hass}
                .value=${valve.run_duration || ""}
                .includeDomains=${["number"]}
                @value-changed=${(e: CustomEvent) =>
                  this._updateValve(index, "run_duration", e.detail.value)}
              ></ha-entity-picker>
            </div>
          `,
        )}
        <mwc-button @click=${this._addValve}>${t("editor.add_valve")}</mwc-button>
      </div>
    `;
  }

  private _renderEntityPicker(
    label: string,
    configKey: string,
    domain: string,
  ) {
    return html`
      <ha-entity-picker
        label=${label}
        .hass=${this.hass}
        .value=${(this._config as Record<string, unknown>)[configKey] || ""}
        .includeDomains=${[domain]}
        allow-custom-entity
        @value-changed=${(e: CustomEvent) =>
          this._updateConfig(configKey, e.detail.value)}
      ></ha-entity-picker>
    `;
  }

  private _renderSwitch(label: string, configKey: string) {
    const value =
      (this._config as Record<string, unknown>)[configKey] !== false;
    return html`
      <div class="switch-row">
        <span>${label}</span>
        <ha-switch
          .checked=${value}
          @change=${(e: Event) =>
            this._updateConfig(
              configKey,
              (e.target as HTMLInputElement).checked,
            )}
        ></ha-switch>
      </div>
    `;
  }

  private _updateConfig(key: string, value: unknown): void {
    if (!this._config) return;
    const newConfig = { ...this._config, [key]: value };
    this._config = newConfig;
    fireEvent(this, "config-changed", { config: newConfig });
  }

  private _updateValve(
    index: number,
    key: keyof ValveConfig,
    value: string,
  ): void {
    const valves = [...(this._config.valves || [])];
    valves[index] = { ...valves[index], [key]: value };
    this._updateConfig("valves", valves);
  }

  private _addValve(): void {
    const valves = [...(this._config.valves || []), { valve_switch: "" }];
    this._updateConfig("valves", valves);
  }

  private _removeValve(index: number): void {
    const valves = [...(this._config.valves || [])];
    valves.splice(index, 1);
    this._updateConfig("valves", valves);
  }
}

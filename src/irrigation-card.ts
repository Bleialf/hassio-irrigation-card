import { LitElement, html, nothing, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCard } from "custom-card-helpers";
import { IrrigationCardConfig, ResolvedConfig } from "./types";
import { CARD_TAG, CARD_NAME, CARD_DESCRIPTION, EDITOR_TAG } from "./const";
import { discoverEntities, getControllerStatus } from "./utils/entity-helpers";
import { cardStyles } from "./styles";

import "./components/valve-row";
import "./components/cycle-controls";
import "./components/settings-panel";
import "./components/queue-panel";

@customElement(CARD_TAG)
export class IrrigationCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: IrrigationCardConfig;
  @state() private _resolved!: ResolvedConfig;

  static styles = cardStyles;

  public static async getConfigElement() {
    await import("./editor");
    return document.createElement(EDITOR_TAG);
  }

  public static getStubConfig(hass: HomeAssistant) {
    // Try to find a sprinkler device prefix
    const switches = Object.keys(hass.states).filter(
      (id) => id.startsWith("switch.") && id.endsWith("_main"),
    );
    const prefix = switches.length > 0
      ? switches[0].replace("switch.", "").replace("_main", "")
      : "";
    return {
      type: `custom:${CARD_TAG}`,
      device_prefix: prefix,
      title: "Irrigation",
    };
  }

  public setConfig(config: IrrigationCardConfig): void {
    if (!config.device_prefix && !config.valves?.length) {
      throw new Error("Please specify device_prefix or valves");
    }
    this._config = config;
  }

  public getCardSize(): number {
    if (!this._resolved) return 3;
    return 2 + this._resolved.valves.length;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.has("_config")) return true;
    if (changedProps.has("hass")) {
      const oldHass = changedProps.get("hass") as HomeAssistant | undefined;
      if (!oldHass) return true;
      // Re-resolve and check relevant entities
      const newResolved = discoverEntities(this.hass, this._config);
      const relevantEntities = this._getRelevantEntities(newResolved);
      const changed = relevantEntities.some(
        (id) => oldHass.states[id] !== this.hass.states[id],
      );
      if (changed) {
        this._resolved = newResolved;
      }
      return changed;
    }
    return false;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (changedProps.has("_config") || !this._resolved) {
      this._resolved = discoverEntities(this.hass, this._config);
    }
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    if (!this._resolved) return nothing;

    const status = getControllerStatus(this.hass, this._resolved);
    const showControls = this._config.show_controls !== false;
    const showSettings = this._config.show_settings !== false;
    const showQueue = this._config.show_queue !== false;

    if (this._resolved.valves.length === 0) {
      return html`
        <ha-card>
          <div class="not-configured">
            No valves found. Check device_prefix or configure valves manually.
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card>
        ${this._config.title
          ? html`
              <div class="card-header">
                <span class="title">${this._config.title}</span>
                <span class="status-badge ${status}">${status}</span>
              </div>
            `
          : nothing}
        ${showControls
          ? html`
              <irrigation-cycle-controls
                .hass=${this.hass}
                .resolved=${this._resolved}
                .devicePrefix=${this._config.device_prefix}
              ></irrigation-cycle-controls>
            `
          : nothing}
        <div class="valves">
          ${this._resolved.valves.map(
            (valve) => html`
              <irrigation-valve-row
                .hass=${this.hass}
                .valve=${valve}
                .compact=${this._config.compact || false}
              ></irrigation-valve-row>
            `,
          )}
        </div>
        ${showSettings
          ? html`
              <irrigation-settings-panel
                .hass=${this.hass}
                .resolved=${this._resolved}
              ></irrigation-settings-panel>
            `
          : nothing}
        ${showQueue
          ? html`
              <irrigation-queue-panel
                .hass=${this.hass}
                .resolved=${this._resolved}
                .devicePrefix=${this._config.device_prefix}
              ></irrigation-queue-panel>
            `
          : nothing}
      </ha-card>
    `;
  }

  private _getRelevantEntities(resolved: ResolvedConfig): string[] {
    const entities: string[] = [];
    if (resolved.main_switch) entities.push(resolved.main_switch);
    if (resolved.auto_advance_switch)
      entities.push(resolved.auto_advance_switch);
    if (resolved.reverse_switch) entities.push(resolved.reverse_switch);
    if (resolved.queue_enable_switch)
      entities.push(resolved.queue_enable_switch);
    if (resolved.standby_switch) entities.push(resolved.standby_switch);
    if (resolved.multiplier) entities.push(resolved.multiplier);
    if (resolved.repeat) entities.push(resolved.repeat);
    for (const v of resolved.valves) {
      entities.push(v.valve_switch);
      if (v.enable_switch) entities.push(v.enable_switch);
      if (v.run_duration) entities.push(v.run_duration);
    }
    return entities;
  }
}

// Register for card picker
(window as unknown as Record<string, unknown[]>).customCards =
  (window as unknown as Record<string, unknown[]>).customCards || [];
(window as unknown as Record<string, unknown[]>).customCards.push({
  type: CARD_TAG,
  name: CARD_NAME,
  description: CARD_DESCRIPTION,
  preview: true,
});

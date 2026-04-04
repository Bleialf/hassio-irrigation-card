import { HomeAssistant } from "custom-card-helpers";
import {
  CONTROLLER_SUFFIXES,
  NUMBER_SUFFIXES,
  VALVE_EXCLUDE_SUFFIXES,
  DEFAULT_VALVE_ICON,
} from "../const";
import { IrrigationCardConfig, ResolvedConfig, ResolvedValve } from "../types";

export function discoverEntities(
  hass: HomeAssistant,
  config: IrrigationCardConfig,
): ResolvedConfig {
  const prefix = config.device_prefix;
  const allEntityIds = Object.keys(hass.states);
  const resolved: ResolvedConfig = { valves: [] };

  // Controller switches
  for (const [key, suffix] of Object.entries(CONTROLLER_SUFFIXES)) {
    const explicit = config[key as keyof IrrigationCardConfig] as
      | string
      | undefined;
    if (explicit) {
      (resolved as unknown as Record<string, unknown>)[key] = explicit;
    } else if (prefix) {
      const entityId = `switch.${prefix}${suffix}`;
      if (allEntityIds.includes(entityId)) {
        (resolved as unknown as Record<string, unknown>)[key] = entityId;
      }
    }
  }

  // Number entities (multiplier, repeat)
  for (const [key, suffix] of Object.entries(NUMBER_SUFFIXES)) {
    const explicit = config[key as keyof IrrigationCardConfig] as
      | string
      | undefined;
    if (explicit) {
      (resolved as unknown as Record<string, unknown>)[key] = explicit;
    } else if (prefix) {
      const entityId = `number.${prefix}${suffix}`;
      if (allEntityIds.includes(entityId)) {
        (resolved as unknown as Record<string, unknown>)[key] = entityId;
      }
    }
  }

  // Valves
  if (config.valves && config.valves.length > 0) {
    resolved.valves = config.valves.map((v) => ({
      name:
        v.name || friendlyName(hass, v.valve_switch) || v.valve_switch,
      valve_switch: v.valve_switch,
      enable_switch: v.enable_switch,
      run_duration: v.run_duration,
      icon: v.icon || DEFAULT_VALVE_ICON,
    }));
  } else if (prefix) {
    resolved.valves = discoverValves(hass, prefix, allEntityIds);
  }

  return resolved;
}

function discoverValves(
  hass: HomeAssistant,
  prefix: string,
  allEntityIds: string[],
): ResolvedValve[] {
  const switchPrefix = `switch.${prefix}_`;
  const valveSwitches = allEntityIds.filter((id) => {
    if (!id.startsWith(switchPrefix)) return false;
    const suffix = id.slice(switchPrefix.length - 1); // includes the _
    return !VALVE_EXCLUDE_SUFFIXES.some((excl) => suffix === excl || suffix.endsWith(excl));
  });

  return valveSwitches.map((valveSwitch) => {
    const valveName = valveSwitch.slice(switchPrefix.length);
    const enableSwitch = `switch.${prefix}_${valveName}_enable`;
    const runDuration = `number.${prefix}_${valveName}_run_duration`;

    return {
      name: friendlyName(hass, valveSwitch) || valveName.replace(/_/g, " "),
      valve_switch: valveSwitch,
      enable_switch: allEntityIds.includes(enableSwitch)
        ? enableSwitch
        : undefined,
      run_duration: allEntityIds.includes(runDuration)
        ? runDuration
        : undefined,
      icon: DEFAULT_VALVE_ICON,
    };
  });
}

export function friendlyName(
  hass: HomeAssistant,
  entityId: string,
): string | undefined {
  const state = hass.states[entityId];
  return state?.attributes?.friendly_name;
}

export function entityState(
  hass: HomeAssistant,
  entityId: string | undefined,
): string | undefined {
  if (!entityId) return undefined;
  return hass.states[entityId]?.state;
}

export function entityNumericValue(
  hass: HomeAssistant,
  entityId: string | undefined,
): number | undefined {
  const state = entityState(hass, entityId);
  if (state === undefined || state === "unavailable" || state === "unknown")
    return undefined;
  const val = parseFloat(state);
  return isNaN(val) ? undefined : val;
}

export function entityAttributes(
  hass: HomeAssistant,
  entityId: string | undefined,
): Record<string, unknown> {
  if (!entityId) return {};
  return (hass.states[entityId]?.attributes as Record<string, unknown>) || {};
}

export function callSwitchService(
  hass: HomeAssistant,
  entityId: string,
  turnOn: boolean,
): void {
  hass.callService("switch", turnOn ? "turn_on" : "turn_off", {
    entity_id: entityId,
  });
}

export function callNumberService(
  hass: HomeAssistant,
  entityId: string,
  value: number,
): void {
  hass.callService("number", "set_value", {
    entity_id: entityId,
    value,
  });
}

export function callEsphomeService(
  hass: HomeAssistant,
  prefix: string,
  action: string,
  data?: Record<string, unknown>,
): void {
  hass.callService("esphome", `${prefix}_${action}`, data || {});
}

export function getControllerStatus(
  hass: HomeAssistant,
  resolved: ResolvedConfig,
): "idle" | "running" | "paused" | "standby" {
  if (
    resolved.standby_switch &&
    entityState(hass, resolved.standby_switch) === "on"
  ) {
    return "standby";
  }

  if (
    resolved.main_switch &&
    entityState(hass, resolved.main_switch) === "on"
  ) {
    // Check if any valve is actually running
    const anyActive = resolved.valves.some(
      (v) => entityState(hass, v.valve_switch) === "on",
    );
    // If main is on but no valve running, it might be paused
    // ESPHome doesn't expose a "paused" state directly through entities
    // so we treat main=on as running
    return anyActive ? "running" : "running";
  }

  return "idle";
}

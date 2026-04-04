export const CARD_TAG = "irrigation-card";
export const EDITOR_TAG = "irrigation-card-editor";
export const CARD_NAME = "Irrigation Card";
export const CARD_DESCRIPTION = "Control ESPHome sprinkler systems";
export const CARD_VERSION = "1.0.0";

export const DEFAULT_VALVE_ICON = "mdi:sprinkler-variant";

export const CONTROLLER_SUFFIXES: Record<string, string> = {
  main_switch: "_main",
  auto_advance_switch: "_auto_advance",
  reverse_switch: "_reverse",
  queue_enable_switch: "_queue_enable",
  standby_switch: "_standby",
};

export const NUMBER_SUFFIXES: Record<string, string> = {
  multiplier: "_multiplier",
  repeat: "_repeat",
};

export const VALVE_EXCLUDE_SUFFIXES = [
  "_main",
  "_auto_advance",
  "_reverse",
  "_queue_enable",
  "_standby",
  "_enable",
];

import { HomeAssistant } from "custom-card-helpers";

const translations: Record<string, Record<string, string>> = {
  en: {
    // Card
    "card.name": "Irrigation Card",
    "card.description": "Control ESPHome sprinkler systems",
    "card.not_configured":
      "No sprinkler entities found. Select a device or configure entities manually.",
    "card.error_no_config":
      "Please specify device_id, valves, or main_switch",

    // Cycle controls
    "controls.start": "Start cycle",
    "controls.pause": "Pause",
    "controls.resume": "Resume",
    "controls.stop": "Stop",

    // Valve row
    "valve.running": "Running",
    "valve.min": "min",
    "valve.include_in_cycle": "Include in cycle",

    // Settings panel
    "settings.title": "Settings",
    "settings.multiplier": "Multiplier",
    "settings.repeat": "Repeat",
    "settings.auto_advance": "Auto-advance",
    "settings.reverse": "Reverse",
    "settings.standby": "Standby",
    "settings.queue": "Queue",

    // Editor
    "editor.title": "Title",
    "editor.device_label": "ESPHome Sprinkler Device",
    "editor.device_placeholder": "-- Select device --",
    "editor.device_selected": "Selected:",
    "editor.device_hint":
      "Select your ESPHome sprinkler device. Entities will be auto-discovered.",
    "editor.controller_entities": "Controller Entities (auto-discovered from device)",
    "editor.main_switch": "Main switch (start/stop)",
    "editor.auto_advance": "Auto-advance",
    "editor.reverse": "Reverse",
    "editor.pause_button": "Pause button",
    "editor.standby": "Standby",
    "editor.queue_enable": "Queue enable",
    "editor.multiplier": "Multiplier",
    "editor.repeat": "Repeat",
    "editor.status_sensors": "Status Sensors (auto-discovered from device)",
    "editor.status": "Status",
    "editor.progress": "Progress %",
    "editor.time_remaining": "Time remaining",
    "editor.display_options": "Display Options",
    "editor.show_controls": "Show controls",
    "editor.show_settings": "Show settings",
    "editor.compact_mode": "Compact mode",
    "editor.valves": "Valves (auto-discovered from device)",
    "editor.valve_n": "Valve",
    "editor.valve_name": "Name",
    "editor.valve_switch": "Valve switch",
    "editor.enable_switch": "Enable switch",
    "editor.run_duration": "Run duration",
    "editor.add_valve": "Add Valve",
  },
  cs: {
    // Card
    "card.name": "Karta zavlažování",
    "card.description": "Ovládání zavlažovacího systému ESPHome",
    "card.not_configured":
      "Nebyly nalezeny žádné entity. Vyberte zařízení nebo nakonfigurujte entity ručně.",
    "card.error_no_config":
      "Zadejte device_id, valves nebo main_switch",

    // Cycle controls
    "controls.start": "Spustit cyklus",
    "controls.pause": "Pozastavit",
    "controls.resume": "Pokračovat",
    "controls.stop": "Zastavit",

    // Valve row
    "valve.running": "Běží",
    "valve.min": "min",
    "valve.include_in_cycle": "Zahrnout do cyklu",

    // Settings panel
    "settings.title": "Nastavení",
    "settings.multiplier": "Násobitel",
    "settings.repeat": "Opakování",
    "settings.auto_advance": "Automatický posun",
    "settings.reverse": "Zpětný chod",
    "settings.standby": "Pohotovost",
    "settings.queue": "Fronta",

    // Editor
    "editor.title": "Název",
    "editor.device_label": "ESPHome zavlažovací zařízení",
    "editor.device_placeholder": "-- Vyberte zařízení --",
    "editor.device_selected": "Vybráno:",
    "editor.device_hint":
      "Vyberte zavlažovací zařízení ESPHome. Entity budou nalezeny automaticky.",
    "editor.controller_entities": "Entity řadiče (automaticky z vybraného zařízení)",
    "editor.main_switch": "Hlavní přepínač (start/stop)",
    "editor.auto_advance": "Automatický posun",
    "editor.reverse": "Zpětný chod",
    "editor.pause_button": "Tlačítko pauzy",
    "editor.standby": "Pohotovost",
    "editor.queue_enable": "Povolit frontu",
    "editor.multiplier": "Násobitel",
    "editor.repeat": "Opakování",
    "editor.status_sensors": "Stavové senzory (automaticky z vybraného zařízení)",
    "editor.status": "Stav",
    "editor.progress": "Průběh %",
    "editor.time_remaining": "Zbývající čas",
    "editor.display_options": "Možnosti zobrazení",
    "editor.show_controls": "Zobrazit ovládání",
    "editor.show_settings": "Zobrazit nastavení",
    "editor.compact_mode": "Kompaktní režim",
    "editor.valves": "Ventily (automaticky z vybraného zařízení)",
    "editor.valve_n": "Ventil",
    "editor.valve_name": "Název",
    "editor.valve_switch": "Přepínač ventilu",
    "editor.enable_switch": "Přepínač povolení",
    "editor.run_duration": "Doba běhu",
    "editor.add_valve": "Přidat ventil",
  },
};

function getLanguage(hass?: HomeAssistant): string {
  const lang = hass?.language || navigator.language?.split("-")[0] || "en";
  return lang in translations ? lang : "en";
}

export function localize(
  hass: HomeAssistant | undefined,
  key: string,
): string {
  const lang = getLanguage(hass);
  return translations[lang]?.[key] || translations["en"]?.[key] || key;
}

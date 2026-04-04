# Irrigation Card

Home Assistant Lovelace card for controlling [ESPHome Sprinkler](https://esphome.io/components/sprinkler/) systems.

## Features

- Auto-discovery of sprinkler entities from ESPHome device prefix
- Per-valve control: on/off toggle, enable/disable for cycle, run duration adjustment
- Cycle controls: start, stop, pause, resume, next/previous valve
- Settings: multiplier, repeat, auto-advance, reverse, standby, queue enable
- Queue management: add valves to queue, clear, start from queue
- Visual config editor for Lovelace UI
- Responsive design using HA Material Design components

## Installation

### HACS (Recommended)

1. Add this repository to HACS as a custom repository
2. Install "Irrigation Card"
3. Refresh your browser

### Manual

1. Download `irrigation-card.js` from the [latest release](../../releases/latest)
2. Copy to `config/www/irrigation-card.js`
3. Add resource in HA: Settings > Dashboards > Resources > Add `/local/irrigation-card.js` (JavaScript Module)

## Configuration

### Minimal (auto-discovery)

```yaml
type: custom:irrigation-card
device_prefix: garden
title: Garden Irrigation
```

The `device_prefix` must match your ESPHome node name. The card auto-discovers all controller switches, number entities, and valves.

### Full manual configuration

```yaml
type: custom:irrigation-card
title: Garden Irrigation
device_prefix: garden

# Override auto-discovered controller entities
main_switch: switch.garden_main
auto_advance_switch: switch.garden_auto_advance
reverse_switch: switch.garden_reverse
queue_enable_switch: switch.garden_queue_enable
standby_switch: switch.garden_standby
multiplier: number.garden_multiplier
repeat: number.garden_repeat

# Manual valve definitions
valves:
  - name: Front Lawn
    valve_switch: switch.garden_front_lawn
    enable_switch: switch.garden_front_lawn_enable
    run_duration: number.garden_front_lawn_run_duration
    icon: mdi:sprinkler-variant
  - name: Back Garden
    valve_switch: switch.garden_back_garden
    enable_switch: switch.garden_back_garden_enable
    run_duration: number.garden_back_garden_run_duration

# Display options (all default to true except compact)
show_controls: true
show_settings: true
show_queue: true
compact: false
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `device_prefix` | string | required* | ESPHome node name for auto-discovery |
| `title` | string | none | Card title |
| `valves` | list | auto | Manual valve definitions |
| `show_controls` | boolean | true | Show cycle control buttons |
| `show_settings` | boolean | true | Show multiplier/repeat/toggles |
| `show_queue` | boolean | true | Show queue panel |
| `compact` | boolean | false | Hide duration controls |

*Either `device_prefix` or `valves` must be provided.

## Development

```bash
npm install
npm start       # watch mode + dev server on port 5000
npm run build   # production build
```

For development, add `http://<your-ip>:5000/irrigation-card.js` as a resource in HA (type: JavaScript Module).

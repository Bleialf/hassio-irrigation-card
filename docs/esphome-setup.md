# ESPHome Sprinkler Setup Guide

This guide shows how to set up an ESPHome sprinkler controller that works with the Irrigation Card.

## Overview

The ESPHome [Sprinkler component](https://esphome.io/components/sprinkler/) provides a full irrigation controller with:
- Multiple valve zones with individual run durations
- Auto-advance through zones in a cycle
- Pause/resume support
- Enable/disable individual zones from the cycle
- Reverse cycle order
- Status, progress, and time remaining sensors

## Hardware

This example uses an **ESP8266** (ESP-01 1M) board with a 5-channel relay module. Adapt GPIO pins to your hardware.

| Relay | GPIO | Zone |
|-------|------|------|
| IN1 | GPIO16 | Sprinklers - zone 1 |
| IN2 | GPIO5 | Sprinklers - zone 2 |
| IN3 | GPIO4 | Sprinklers - zone 3 |
| IN4 | GPIO0 | Sprinklers - zone 4 |
| IN5 | GPIO14 | Dripline |
| Pump | GPIO2 | Pump relay |

> **Note:** All relay pins use `inverted: true` for active-low relay modules.

## ESPHome Configuration

### Substitutions

Customize zone names and the unit identifier at the top of the config. The `unit_id` allows running multiple controllers (A, B, C, ...).

```yaml
substitutions:
  unit_id: B
  devicename_unit_id: b
  zone_1_name: Sprinklers - zone 1
  zone_2_name: Sprinklers - zone 2
  zone_3_name: Sprinklers - zone 3
  zone_4_name: Sprinklers - zone 4
  zone_5_name: Dripline
  software_version: 2022 10 18  v11
  sensor_update_frequency: 120s
  zone_1_valve_id: valve_0
  zone_2_valve_id: valve_1
  zone_3_valve_id: valve_2
  zone_4_valve_id: valve_3
  zone_5_valve_id: valve_4
  esphome_name: irrigation-ctrl-unit-$devicename_unit_id
  esphome_comment: Five Valve Irrigation Control - $unit_id
  esphome_project_name: kratochj.Four Valve Irrigation Control - $unit_id
  esphome_project_version: $software_version
  devicename: irrigation_valve_controller_unit_$devicename_unit_id
  upper_devicename: Five Valve Irrigation Ctrl - $unit_id
  uom: Min
```

### Board, WiFi and Base Config

```yaml
esp8266:
  board: esp01_1m

esphome:
  name: $esphome_name
  comment: $esphome_comment
  project:
    name: $esphome_project_name
    version: $esphome_project_version
  on_boot:
    priority: -100
    then:
      - text_sensor.template.publish:
          id: valve_status_$devicename_unit_id
          state: "Idle"
      # Multiplier 60 converts seconds to minutes for run duration
      - sprinkler.set_multiplier:
          id: $devicename
          multiplier: 60

# WiFi connection, replace these with values for your WiFi.
wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

# Enable logging
logger:

# Enable over-the-air updates.
ota:
  password: !secret ota_password

# Enable Web server.
web_server:
  port: 80

time:
  - platform: homeassistant
    id: homeassistant_time
```

### Sprinkler Controller

This is the core component. It creates the main switch, auto-advance, reverse, and per-valve switches.

```yaml
sprinkler:
  - id: $devicename
    main_switch:
      name: "Start/Stop/Resume ($unit_id)"
      id: main_switch
    auto_advance_switch: "Auto Advance ($unit_id)"
    reverse_switch: "Reverse ($unit_id)"
    valve_open_delay: 1s
    valves:
      - valve_switch: $zone_1_name
        enable_switch: Enable $zone_1_name
        pump_switch_id: ${devicename}_pump
        run_duration: 5s
        valve_switch_id: ${devicename}_1
      - valve_switch: $zone_2_name
        enable_switch: Enable $zone_2_name
        pump_switch_id: ${devicename}_pump
        run_duration: 5s
        valve_switch_id: ${devicename}_2
      - valve_switch: $zone_3_name
        enable_switch: Enable $zone_3_name
        pump_switch_id: ${devicename}_pump
        run_duration: 5s
        valve_switch_id: ${devicename}_3
      - valve_switch: $zone_4_name
        enable_switch: Enable $zone_4_name
        pump_switch_id: ${devicename}_pump
        run_duration: 5s
        valve_switch_id: ${devicename}_4
      - valve_switch: $zone_5_name
        enable_switch: Enable $zone_5_name
        pump_switch_id: ${devicename}_pump
        run_duration: 8s
        valve_switch_id: ${devicename}_5
```

### Run Duration Number Entities

Each zone gets a number entity (1–60 min) for setting run duration from HA.

```yaml
number:
  - platform: template
    id: $zone_1_valve_id
    name: $zone_1_name
    min_value: 1
    max_value: 60
    step: 1
    unit_of_measurement: $uom
    icon: "mdi:timer-outline"
    mode: box
    lambda: "return id($devicename).valve_run_duration(0);"
    set_action:
      - sprinkler.set_valve_run_duration:
          id: $devicename
          valve_number: 0
          run_duration: !lambda 'return x;'
```

Repeat for each zone, incrementing `valve_number` (0, 1, 2, 3, 4).

### Status Sensors

These template sensors expose controller state to HA — the Irrigation Card uses them for status display, progress bar, and time remaining.

```yaml
text_sensor:
  # Time Remaining
  - platform: template
    id: time_remaining_$devicename_unit_id
    name: "Time Remaining ($unit_id)"
    update_interval: $sensor_update_frequency
    icon: "mdi:timer-sand"
    lambda: |-
      int seconds = round(id($devicename).time_remaining_active_valve().value_or(0));
      int days = seconds / (24 * 3600);
      seconds = seconds % (24 * 3600);
      int hours = seconds / 3600;
      seconds = seconds % 3600;
      int minutes = seconds / 60;
      seconds = seconds % 60;
        return {
          ((days ? String(days) + "d " : "") +
          (hours ? String(hours) + "h " : "") +
          (minutes ? String(minutes) + "m " : "") +
          (String(seconds) + "s")
          ).c_str()};

  # Progress Percent
  - platform: template
    id: progress_percent_$devicename_unit_id
    name: "Progress % ($unit_id)"
    update_interval: $sensor_update_frequency
    icon: "mdi:progress-clock"
    lambda: |-
      int progress_percent = round(((id($devicename).valve_run_duration_adjusted(id($devicename).active_valve().value_or(0)) - id($devicename).time_remaining_active_valve().value_or(0)) * 100 / id($devicename).valve_run_duration_adjusted(id($devicename).active_valve().value_or(0))));
      std::string progress_percent_as_string = std::to_string(progress_percent);
      return progress_percent_as_string;

  # Valve Status (updated by valve switches on_turn_on/off)
  - platform: template
    id: valve_status_$devicename_unit_id
    name: "Status ($unit_id)"
    update_interval: never
    icon: "mdi:information-variant"
```

### Pause Button

```yaml
button:
  - platform: template
    id: sprinkler_pause
    name: "Pause ($unit_id)"
    icon: "mdi:pause"
    on_press:
      then:
        - text_sensor.template.publish:
            id: valve_status_$devicename_unit_id
            state: "Paused"
        - sprinkler.pause: $devicename
```

### Valve Relay Switches

Each relay switch is `internal: true` (hidden from HA) and updates the status sensor on turn on/off.

```yaml
switch:
  - platform: gpio
    name: Relay Board Pin IN1
    restore_mode: RESTORE_DEFAULT_OFF
    internal: true
    id: ${devicename}_1
    on_turn_on:
      - text_sensor.template.publish:
          id: valve_status_$devicename_unit_id
          state: "$zone_1_name Active"
    on_turn_off:
      - text_sensor.template.publish:
          id: valve_status_$devicename_unit_id
          state: "Idle"
    pin:
      number: GPIO16
      inverted: true
```

Repeat for each relay/zone with the appropriate GPIO pin and zone name.

Don't forget the pump relay:

```yaml
  - platform: gpio
    restore_mode: RESTORE_DEFAULT_OFF
    internal: true
    id: ${devicename}_pump
    pin:
      number: GPIO2
      inverted: true
```

## Entities Created in Home Assistant

After flashing, the following entities appear in HA (assuming `unit_id: B`):

| Entity | Type | Purpose |
|--------|------|---------|
| `switch.start_stop_resume_b` | switch | Start/stop/resume cycle |
| `switch.auto_advance_b` | switch | Auto-advance through zones |
| `switch.reverse_b` | switch | Reverse cycle order |
| `button.pause_b` | button | Pause active cycle |
| `switch.irrigation_node_sprinklers_zone_1..4` | switch | Per-zone on/off |
| `switch.irrigation_node_dripline` | switch | Dripline on/off |
| `switch.enable_sprinklers_zone_1..4` | switch | Include zone in cycle |
| `switch.enable_dripline` | switch | Include dripline in cycle |
| `number.sprinklers_zone_1..4` | number | Zone run duration (1–60 min) |
| `number.dripline` | number | Dripline run duration (1–60 min) |
| `sensor.status_b` | sensor | Controller status (Idle/Running/Paused) |
| `sensor.progress_b` | sensor | Cycle progress (0–100%) |
| `sensor.time_remaining_b` | sensor | Time remaining on active valve |

## Irrigation Card Configuration

Once the ESPHome device is in HA, configure the Irrigation Card:

### Visual Editor

1. Add the Irrigation Card to your dashboard
2. Select your ESPHome device from the dropdown
3. All entities are auto-discovered — no manual configuration needed

### YAML (minimal)

```yaml
type: custom:irrigation-card
device_id: <your-device-id>
title: Irrigation
```

The `device_id` is automatically filled when using the visual editor.

## Multiple Controllers

To run multiple irrigation controllers, create separate ESPHome configs with different `unit_id` values (A, B, C, ...). Add a separate Irrigation Card for each device on your dashboard.

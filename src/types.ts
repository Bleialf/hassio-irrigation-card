import { LovelaceCardConfig } from "custom-card-helpers";

export interface ValveConfig {
  name?: string;
  valve_switch: string;
  enable_switch?: string;
  run_duration?: string;
  icon?: string;
}

export interface IrrigationCardConfig extends LovelaceCardConfig {
  type: string;
  device_id?: string;
  title?: string;

  main_switch?: string;
  auto_advance_switch?: string;
  reverse_switch?: string;
  pause_button?: string;
  queue_enable_switch?: string;
  standby_switch?: string;
  multiplier?: string;
  repeat?: string;

  status_sensor?: string;
  progress_sensor?: string;
  time_remaining_sensor?: string;

  valves?: ValveConfig[];

  show_controls?: boolean;
  show_settings?: boolean;
  show_queue?: boolean;
  compact?: boolean;
}

export interface ResolvedValve {
  name: string;
  valve_switch: string;
  enable_switch?: string;
  run_duration?: string;
  icon: string;
}

export interface ResolvedConfig {
  main_switch?: string;
  auto_advance_switch?: string;
  reverse_switch?: string;
  pause_button?: string;
  queue_enable_switch?: string;
  standby_switch?: string;
  multiplier?: string;
  repeat?: string;
  status_sensor?: string;
  progress_sensor?: string;
  time_remaining_sensor?: string;
  valves: ResolvedValve[];
}

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Home Assistant Lovelace custom card for controlling ESPHome Sprinkler systems via HACS. Built with LitElement (Lit 3) + TypeScript, bundled with Rollup 4.

Target: ESPHome sprinkler component (https://esphome.io/components/sprinkler/) which exposes switches (main, auto_advance, reverse, queue_enable, standby, per-valve on/off, per-valve enable), number entities (multiplier, repeat, per-valve run_duration), and ESPHome-domain services (pause, resume, next_valve, previous_valve, queue_valve, clear_queued_valves).

## Build Commands

```bash
npm install       # install dependencies
npm run build     # production build → dist/irrigation-card.js
npm start         # watch mode + dev server on port 5000
```

Output is a single ES module file `dist/irrigation-card.js` (inlined dynamic imports).

## Architecture

### Entry Point
- `src/irrigation-card.ts` — Main card class (`IrrigationCard`), registers `<irrigation-card>` custom element, orchestrates rendering, lazy-imports editor

### Components (each a standalone LitElement custom element)
- `src/components/valve-row.ts` — `<irrigation-valve-row>` — Single valve: toggle, enable, duration +/- buttons, progress bar
- `src/components/cycle-controls.ts` — `<irrigation-cycle-controls>` — Start/stop/pause/resume/next/prev buttons
- `src/components/settings-panel.ts` — `<irrigation-settings-panel>` — Multiplier/repeat sliders + auto-advance/reverse/standby/queue toggles
- `src/components/queue-panel.ts` — `<irrigation-queue-panel>` — Queue valve picker + add/clear/start buttons

### Editor
- `src/editor.ts` — `<irrigation-card-editor>` — Visual config editor with `ha-entity-picker` and `ha-textfield` (HA built-in components available at runtime, not npm)

### Core Logic
- `src/utils/entity-helpers.ts` — Entity auto-discovery from `device_prefix`, service call wrappers (`callSwitchService`, `callNumberService`, `callEsphomeService`), controller status detection
- `src/types.ts` — `IrrigationCardConfig`, `ValveConfig`, `ResolvedConfig`, `ResolvedValve`
- `src/const.ts` — Card tag names, controller/number/valve suffix patterns for auto-discovery
- `src/styles.ts` — Shared CSS using HA CSS custom properties for theme compatibility

### Key Patterns
- **Auto-discovery**: When `device_prefix` is set, `discoverEntities()` scans `hass.states` matching `switch.<prefix>_*` and `number.<prefix>_*`, categorizing by known suffixes. Remaining switches (excluding `_enable` suffix) become valves.
- **Entity control**: Switches via `hass.callService("switch", ...)`, numbers via `hass.callService("number", "set_value", ...)`. Operations without entity equivalents (pause, resume, next/prev, queue) use `hass.callService("esphome", "<prefix>_<action>", ...)`.
- **Selective re-rendering**: `shouldUpdate()` checks only relevant entity state changes to avoid unnecessary renders.
- **HA runtime components**: `ha-icon-button`, `ha-switch`, `ha-slider`, `ha-entity-picker`, `ha-icon` are available globally in HA — no npm import needed, but TypeScript needs casts.

## HACS / Release

- `hacs.json` points to `irrigation-card.js` as the release asset filename
- `.github/workflows/release.yml` builds and attaches `dist/irrigation-card.js` to GitHub releases
- HACS downloads the JS file from release assets

## TypeScript Notes

- `useDefineForClassFields: false` in tsconfig.json is required for Lit decorators (`@property`, `@state`, `@customElement`)
- `experimentalDecorators: true` enables Lit decorator syntax

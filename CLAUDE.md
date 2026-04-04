# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Home Assistant Lovelace custom card for controlling ESPHome Sprinkler systems via HACS. Built with LitElement (Lit 3) + TypeScript, bundled with Rollup 4.

Target: ESPHome sprinkler component (https://esphome.io/components/sprinkler/) which exposes switches (start/stop/resume, auto_advance, reverse, per-valve on/off, per-valve enable), number entities (per-valve run_duration, optionally multiplier/repeat), button entities (pause), and sensor entities (status, progress %, time remaining).

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
- `src/components/cycle-controls.ts` — `<irrigation-cycle-controls>` — Start/stop/pause/resume buttons
- `src/components/settings-panel.ts` — `<irrigation-settings-panel>` — Multiplier/repeat sliders + auto-advance/reverse/standby/queue toggles

### Editor
- `src/editor.ts` — `<irrigation-card-editor>` — Visual config editor with `ha-device-picker`, `ha-entity-picker` and `ha-textfield` (HA built-in components available at runtime, not npm)

### Core Logic
- `src/utils/entity-helpers.ts` — Device-based entity auto-discovery, service call wrappers (`callSwitchService`, `callButtonPress`, `callNumberService`), controller status detection
- `src/types.ts` — `IrrigationCardConfig`, `ValveConfig`, `ResolvedConfig`, `ResolvedValve`
- `src/const.ts` — Card tag names, default icons
- `src/styles.ts` — Shared CSS using HA CSS custom properties for theme compatibility

### Key Patterns
- **Device-based auto-discovery**: User selects a HA device (via `ha-device-picker`). `discoverEntities()` reads `hass.entities` to find all entities belonging to that `device_id`, then categorizes them by domain and friendly_name patterns (regex matching against names like "Start/Stop", "Auto Advance", "Reverse", "Pause", "Status", "Progress", "Enable", etc.). Valve switches are identified by exclusion — switches that aren't controller-level or enable switches. Each valve is matched to its enable switch and duration number by friendly_name similarity.
- **Entity control**: Switches via `hass.callService("switch", ...)`, numbers via `hass.callService("number", "set_value", ...)`, buttons (pause) via `hass.callService("button", "press", ...)`.
- **Status from sensor**: Controller status is read from `sensor.status_*` (exposes "Idle", "Running", "Paused" etc.) rather than inferred from switch state.
- **Selective re-rendering**: `shouldUpdate()` checks only relevant entity state changes to avoid unnecessary renders.
- **HA runtime components**: `ha-icon-button`, `ha-switch`, `ha-slider`, `ha-entity-picker`, `ha-device-picker`, `ha-icon` are available globally in HA — no npm import needed, but TypeScript needs casts.

## HACS / Release

- `hacs.json` points to `irrigation-card.js` as the release asset filename
- `.github/workflows/release.yml` builds and attaches `dist/irrigation-card.js` to GitHub releases
- `.github/workflows/build.yml` builds on push/PR and uploads artifact
- HACS downloads the JS file from release assets

## Git Workflow

- **Feature branches**: Always create a new branch for new work (`feature/short-description` or `fix/short-description`). Never commit directly to `main`.
- **Pull Requests**: After the user confirms the implementation is OK, create a PR to `main` with a description of what was done. Do not merge without user confirmation.
- **Semantic Versioning**: Use semver for releases — MAJOR.MINOR.PATCH:
  - PATCH: bug fixes, minor tweaks
  - MINOR: new features, backward-compatible changes
  - MAJOR: breaking changes
- Update version in both `package.json` and `src/const.ts` before creating a release.

## Commit Message Format

- No attribution to Claude in commit messages
- First line: imperative form, max 50 chars. Start with ticket ID from branch name (e.g. `COREO-123`, `MAFIN-234`) followed by short description
- Empty line after first line
- Detailed description as bullet points, 2-3 sentences max
- Focus on business logic changes, skip formal/mechanical changes if there are business logic ones
- Avoid overly verbose descriptions or unnecessary details

## TypeScript Notes

- `useDefineForClassFields: false` in tsconfig.json is required for Lit decorators (`@property`, `@state`, `@customElement`)
- `experimentalDecorators: true` enables Lit decorator syntax

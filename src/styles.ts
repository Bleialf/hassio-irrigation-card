import { css } from "lit";

export const cardStyles = css`
  :host {
    --irrigation-active-color: var(
      --state-switch-active-color,
      var(--primary-color)
    );
    --irrigation-idle-color: var(--disabled-text-color);
  }

  ha-card {
    padding: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
  }

  .card-header .title {
    font-size: 1.2em;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .status-badge {
    font-size: 0.85em;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 500;
  }

  .status-badge.idle {
    background: var(--disabled-color, #bdbdbd);
    color: white;
  }

  .status-badge.running {
    background: var(--irrigation-active-color);
    color: white;
  }

  .status-badge.paused {
    background: var(--warning-color, #ffa726);
    color: white;
  }

  .status-badge.standby {
    background: var(--error-color, #ef5350);
    color: white;
  }

  .controls {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px solid var(--divider-color);
  }

  .valves {
    padding: 8px 0;
  }

  .valve-row {
    display: flex;
    align-items: center;
    padding: 8px 0;
    gap: 8px;
  }

  .valve-row .valve-icon {
    color: var(--irrigation-idle-color);
    flex-shrink: 0;
  }

  .valve-row .valve-icon.active {
    color: var(--irrigation-active-color);
  }

  .valve-row .valve-info {
    flex: 1;
    min-width: 0;
  }

  .valve-row .valve-name {
    font-size: 0.95em;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .valve-row .valve-status {
    font-size: 0.8em;
    color: var(--secondary-text-color);
  }

  .valve-row .valve-duration {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85em;
    color: var(--secondary-text-color);
    flex-shrink: 0;
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background: var(--divider-color);
    border-radius: 2px;
    margin-top: 4px;
    overflow: hidden;
  }

  .progress-bar .fill {
    height: 100%;
    background: var(--irrigation-active-color);
    border-radius: 2px;
    transition: width 1s linear;
  }

  .settings-panel {
    padding: 12px 0;
    border-top: 1px solid var(--divider-color);
  }

  .settings-panel .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;
  }

  .settings-panel .setting-label {
    font-size: 0.9em;
    color: var(--primary-text-color);
  }

  .settings-panel .setting-value {
    font-size: 0.85em;
    color: var(--secondary-text-color);
    min-width: 40px;
    text-align: right;
  }

  .toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 8px 0;
  }

  .toggle-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9em;
    color: var(--primary-text-color);
  }

  .queue-panel {
    padding: 12px 0;
    border-top: 1px solid var(--divider-color);
  }

  .queue-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .queue-controls select {
    flex: 1;
    padding: 6px;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    background: var(--card-background-color, white);
    color: var(--primary-text-color);
    font-size: 0.9em;
  }

  .section-title {
    font-size: 0.9em;
    font-weight: 500;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 8px 0 4px;
  }

  .cycle-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid var(--divider-color);
  }

  .cycle-info .time-remaining {
    font-size: 0.9em;
    font-weight: 500;
    color: var(--primary-text-color);
    white-space: nowrap;
  }

  .not-configured {
    padding: 16px;
    text-align: center;
    color: var(--secondary-text-color);
  }
`;

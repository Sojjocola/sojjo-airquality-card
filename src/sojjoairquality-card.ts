/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types. https://github.com/custom-cards/custom-card-helpers

import type { SojjoAirQualityCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  SOJJOAIRQUALITY-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'sojjoairquality-card',
  name: 'Sojjo AirQuality Card',
  description: 'A template custom card for you to create something awesome',
});

// TODO Name your custom element
@customElement('sojjoairquality-card')
export class SojjoAirQualityCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./editor');
    return document.createElement('sojjoairquality-card-editor');
  }

  public static getStubConfig(): Record<string, unknown> {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  // https://lit.dev/docs/components/properties/
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: SojjoAirQualityCardConfig;

  // https://lit.dev/docs/components/properties/#accessors-custom
  public setConfig(config: SojjoAirQualityCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      ...config,
    };
  }

  // https://lit.dev/docs/components/lifecycle/#reactive-update-cycle-performing
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  // https://lit.dev/docs/components/rendering/
  protected render(): TemplateResult | void {
    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));
    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }

    const covValue = +(this.hass.states[`${this.config?.entity}`].state);

    return html`
      <ha-card
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
        tabindex="0"
        .label=${`SojjoAirQuality: ${this.config.entity || 'No Entity Defined'}`}
      >
      <div class="cov-container">
        <div class="cov-column">
          <div class="leaf-items">
            ${this.getCovLeafDisplay(covValue)}
          </div>
          <div class="cov-message">
            <span>${this.getCovLabel(covValue)}</span>
          </div>
        </div>
        <div class="cov-column">
          <div class="cov-display">
            <div class="cov-value">
              ${covValue}
              <span class="cov-unit">
                ppb
              </span>
            </div>
          </div>
        </div>
      </div>
    </ha-card>
    `;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
  }

  private _showWarning(warning: string): TemplateResult {
    return html` <hui-warning>${warning}</hui-warning> `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html` ${errorCard} `;
  }

  // https://lit.dev/docs/components/styles/
  static get styles(): CSSResultGroup {
    return css`
      .cov-container {
        display:flex;
        flex-direction: row;
        padding: 10px;
      }
      .cov-column {
        display:flex;
        flex-direction: column;
      }
      .leaf-items {
        display: flex;
        flex-direction: row;
      }
      .leaf-green {
        color:green;
      }
      .cov-display {
        margin: 10px;
        text-align: center;
      }
      .cov-value {
        font-size: 4em;
        font-weight:300;
        color:var(--primary-text-color);
      }
      .cov-unit {
        font-size: 1.5em;
        font-weight:300;
        color:var(--secondary-text-color);
      }
    `;
  }

  private getCovLeafDisplay(covValue: number) {
    const leafIcon = "mdi:leaf";
    if (covValue < 150) {
      return html`
       <div class="leaf-item leaf-green">
        <ha-icon .icon=${leafIcon}><ha-icon/>
      </div>
      <div class="leaf-item leaf-green">
        <ha-icon .icon=${leafIcon}><ha-icon/>
      </div>
      <div class="leaf-item leaf-green">
        <ha-icon .icon=${leafIcon}><ha-icon/>
      </div>
      <div class="leaf-item leaf-green">
        <ha-icon .icon=${leafIcon}><ha-icon/>
      </div>
      <div class="leaf-item leaf-green">
        <ha-icon .icon=${leafIcon}> <ha-icon/>
      </div>
      `;
    } else if (covValue >= 150 && covValue < 350) {
      return html`
       <div class="leaf-item leaf-green">
        <ha-icon .icon=${leafIcon}><ha-icon/>
      </div>
      <div class="leaf-item leaf-green">
        <ha-icon .icon=${leafIcon}><ha-icon/>
      </div>
      <div class="leaf-item leaf-green">
        <ha-icon .icon=${leafIcon}><ha-icon/>
      </div>
      <div class="leaf-item leaf-green">
        <ha-icon .icon=${leafIcon}><ha-icon/>
      </div>
      <div class="leaf-item leaf-grey">
        <ha-icon .icon=${leafIcon}><ha-icon/>
      </div>
      `;
    } else if (covValue >= 350 && covValue < 660) {
      return html`
       <div class="leaf-item leaf-green">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      <div class="leaf-item leaf-green">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      <div class="leaf-item leaf-green">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      <div class="leaf-item">
        <ha-icon .icon="mdi:leaf leaf-grey"><ha-icon/>
      </div>
      <div class="leaf-item">
        <ha-icon .icon="mdi:leaf leaf-grey"><ha-icon/>
      </div>
      `;
    } else if (covValue >= 660 && covValue < 2200) {
      return html`
       <div class="leaf-item leaf-green">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      <div class="leaf-item leaf-green">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      <div class="leaf-item leaf-grey">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      <div class="leaf-item leaf-grey">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      <div class="leaf-item leaf-grey">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      `;
    }  else if (covValue >= 2200 && covValue < 5500) {
      return html`
       <div class="leaf-item leaf-green">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      <div class="leaf-item leaf-grey">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      <div class="leaf-item leaf-grey">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      <div class="leaf-item leaf-grey">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      <div class="leaf-item leaf-grey">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      `;
    } else {
      return html`
       <div class="leaf-item leaf-grey">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      <div class="leaf-item leaf-grey">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      <div class="leaf-item leaf-grey">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      <div class="leaf-item leaf-grey">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      <div class="leaf-item leaf-grey">
        <ha-icon .icon="mdi:leaf"><ha-icon/>
      </div>
      `;
    }
  }

  private getCovLabel(covValue: number): string {

    let returnValue = "";

    if (covValue < 150) {
      returnValue = "Excellent: Air Ok!";
    } else if (covValue >= 150 && covValue < 350) {
      returnValue = "Correct : Aération ou ventilation recommandée";
    } else if (covValue >= 350 && covValue < 660) {
      returnValue = "Moyen : Ventilation intensifiée recommandée";
    } else if (covValue >= 660 && covValue < 2200) {
      returnValue = "Mauvais: Aération ou ventilation nécessaire";
    }  else if (covValue >= 2200 && covValue < 5500) {
      returnValue = "Danger pour la santé : Ventilation intensifiée nécessaire";
    } else {
      returnValue = "X : Quitter la zone!!!";
    }

    return returnValue;
  }
}

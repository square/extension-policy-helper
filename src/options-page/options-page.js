import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/paper-styles/default-theme.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/paper-tabs/paper-tab.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-media-query/iron-media-query.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';

import { ExtensionSurvey, ExceptionRequired } from '/lib.js';
import '../extension-card/extension-card.js'
import './help-page.js'

/**
 * @customElement
 * @polymer
 */
class OptionsPage extends PolymerElement {
  constructor() {
    super();

    ExtensionSurvey
      .load()
      .then(survey => survey.runSurvey())
      .then(exceptionsRequired => { this.exceptionsRequired = exceptionsRequired; });

    chrome.storage.managed.get('formUrl', items => {
      this.formUrl = items['formUrl'];
    });

    chrome.storage.managed.get('formQueryParams', items => {
      this.formQueryParams = items['formQueryParams'] || [];
    });
  }

  static get template() {
    return html`
      <style>
        .extension-cards {
          display: grid;
          grid-column-gap: 2em;
          grid-row-gap: 2em;
        }

        extension-card {
          width: 100%;
          margin-left: auto;
          margin-right: auto;
          display: flex;
        }

        @media (min-width: 600px) {
          extension-card {
            width: 90% !important;
          }
        }

        [hidden] {
          display: none !important;
        }

        app-toolbar {
          background-color: #000;
          color: #fff;
        }

        .card-container {
          padding: 1em;
        }
      </style>

      <app-drawer-layout force-narrow>
        <app-drawer slot="drawer">
          <app-toolbar></app-toolbar>
          <div class="drawer-contents">
            <paper-item on-click="showNew" disabled="[[isOnPage(page, 'new')]]" role="menuitem">New</paper-item>
            <paper-item on-click="showOld" disabled="[[isOnPage(page, 'history')]]" role="menuitem">History</paper-item>
            <paper-item on-click="showHelp" disabled="[[isOnPage(page, 'help')]]" role="menuitem">Help</paper-item>
          </div>
        </app-drawer>

        <app-header-layout fullbleed>
          <app-header slot="header" condenses fixed effects="waterfall">
            <app-toolbar>
              <paper-icon-button icon="menu" drawer-toggle hidden="[[wideLayout]]"></paper-icon-button>
              <div main-title>Chrome Extension Policy Helper</div>
            </app-toolbar>

            <app-toolbar class="tabs-bar" hidden\$="[[!wideLayout]]">
              <paper-tabs selected="{{page}}" attr-for-selected="page">
                <paper-tab page="new">New</paper-tab>
                <paper-tab page="history">History</paper-tab>
                <paper-tab page="help">Help</paper-tab>
              </paper-tabs>
            </app-toolbar>
          </app-header>

          <iron-pages id="page" selected="{{page}}" attr-for-selected="page">
            <div class="extension-cards content" page="new">
              <dom-repeat id="repeat" items="{{exceptionsRequired}}">
                <template>
                  <iron-collapse opened="[[!item.state.done]]">
                    <div class="card-container">
                      <extension-card exception-required="{{item}}" form-url="[[formUrl]]" form-query-params="[[formQueryParams]]"></extension-card>
                    </div>
                  </iron-collapse>
                </template>
              </dom-repeat>
            </div>

            <div class="extension-cards content" page="history">
            <dom-repeat id="repeat" items="{{exceptionsRequired}}">
              <template>
                <div class="card-container" hidden\$="[[!item.state.done]]">
                  <extension-card exception-required="{{item}}"></extension-card>
                </div>
              </template>
            </dom-repeat>
            </div>

            <div class="content" page="help">
              <help-page></help-page>
            </div>
          </iron-pages>
        </app-header-layout>
      </app-drawer-layout>
      <iron-media-query query="min-width: 600px" query-matches="{{wideLayout}}"></iron-media-query>
    `;
  }

  static get properties() {
    return {
      exceptionsRequired: {
        type: Array,
      },

      page: {
        type: String,
        value: 'new',
      },

      wideLayout: {
        type: Boolean,
      },

      formUrl: {
        type: String,
      },

      formQueryParams: {
        type: Array,
      }
    };
  }

  /**
   * @param {!ExceptionRequired} x
   * @return {boolean}
   */
  doneItems(x) {
    return !!x.state.done;
  }

  /**
   * @param {!ExceptionRequired} x
   * @return {boolean}
   */
  notDoneItems(x) {
    return !x.state.done;
  }

  showNew() {
    this.page = 'new';
  }

  showOld() {
    this.page = 'history';
  }

  showHelp() {
    this.page = 'help';
  }

  isOnPage(page, n) {
    return page == n;
  }
}

customElements.define('options-page', OptionsPage);

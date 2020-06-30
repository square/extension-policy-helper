import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { ExtensionSurvey, ExceptionRequired } from '/lib.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-styles/color.js';
import '@polymer/paper-styles/typography.js';

class PopupPage extends PolymerElement {
  static get template() {
    return html`
<style>
  div {
    padding: 0.5em;
  }

  .title {
    display: flex;
    padding: 0.5em;
  }

  .title > span {
    @apply --paper-font-title;
    margin-right: 1em;
    overflow: unset;
  }

  .title > iron-icon {
    margin-left: auto;
    color: var(--paper-pink-500);
  }

  paper-button {
    background-color: var(--google-blue-500);
    color: white;
  }
</style>
<div class="title"><span>Chrome Extension Policy Helper</span><iron-icon icon="extension"></iron-icon></div>
<div class="summary">There [[areOrIs(exceptionsRequired.length)]] <b>[[exceptionsRequired.length]]</b> extension[[needS(exceptionsRequired.length)]] that needs attention.</div>
<div class="buttons"><paper-button on-tap="openOptions">More Info</paper-button></div>
    `
  }

  ready() {
    super.ready();
    ExtensionSurvey
      .load()
      .then(survey => survey.runSurvey())
      .then(exceptionsRequired => {
        this.exceptionsRequired = exceptionsRequired.filter(x => !x.state.done);
      }, console.error);
  }

  static get properties() {
    return {
      exceptionsRequired: {
        type: Array,
      },
    };
  }

  openOptions() {
    chrome.runtime.openOptionsPage();
  }

  areOrIs(n) {
    if (n == 1) {
      return 'is';
    }
    return 'are';
  }

  needS(n) {
    if (n == 1) {
      return '';
    }
    return 's';
  }
}

customElements.define('popup-page', PopupPage);

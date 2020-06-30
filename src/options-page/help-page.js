import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { htmlLiteral } from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/marked-element/marked-element.js'
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-item/paper-item-body.js';
import '@polymer/paper-styles/shadow.js';

class HelpPage extends PolymerElement {

  /**
   * Items for the help page.
   *
   * @return {!Array<{title: string, body: string}>}
   */
  static getDefaultHelpItems() {
    return [
      {
        title: "What is this?",
        body: `
This extension models the impact of Chrome extension controls, so that extensions that will have their functionality limited can be granted exceptions.

You are likely here because you have an extension installed that would be affected by current or future policy.
`,
      },
      {
        title: "I received this notification in my personal browser profile",
        body: `
Extensions will still be prevented from accessing resources in profiles that aren't signed in with
corporate accounts.  If you need an exception for an extension in a non-corporate profile, follow
these steps:
- Right click *REQUEST EXCEPTION*
- Choose the *Open Link As* submenu
- Choose the browser profile you use to access corporate gmail/Google Docs in
- Click the *IGNORE* button to clear the notification count and move it to the History tab
            `
      }
    ]
  }

  static get template() {
    return html`
<style>
  div[secondary] {
    white-space: normal;
  }

  paper-item-body {
    --paper-item-body-secondary-color: var(--primary-text-color);
    --paper-item-body-two-line-min-height: 48px;
  }

  paper-item {
    @apply --shadow-elevation-2dp;
    margin-top: 12px;
  }

  paper-item:not([active]) div[secondary] {
    display: none !important;
  }

  paper-item-body > div {
    display: flex;
    margin-top: 0;
    margin-bottom: auto;
  }

  paper-item-body > div:not([secondary]) {
    padding-top: 0.5em;
  }

  paper-item-body > div[secondary] {
    padding-bottom: 0.5em;
  }

  paper-item-body > div > iron-icon {
    color: blue;
    margin-left: auto;
    margin-right: 0;
  }
  paper-item[active] paper-item-body > div > iron-icon {
    display: none !important;
  }
</style>

<dom-repeat items="{{helpItems}}">
  <template>
    <paper-item toggles>
      <paper-item-body two-line>
        <div>[[item.title]]<iron-icon icon="help"></iron-icon></div>
        <div secondary>
          <marked-element markdown="[[item.body]]">
            <div slot="markdown-html"></div>
          </marked-element>
        </div>
      </paper-item-body>
    </paper-item>
  </template>
</dom-repeat>
    `
  }

  /**
   *
   * @param {!Array<number>} selectedValues
   * @param {number} n
   */
  isSelected(selectedValues, n) {
    return selectedValues.includes(n);
  }

  ready() {
    super.ready();

    chrome.storage.managed.get('helpItems', items => {
      if (items['helpItems']) {
        this.helpItems = items['helpItems'];
      }
    });
  }

  static get properties() {
    return {
      selectedValues: {
        type: Array,
      },
      helpItems: {
        type: Array,
        value: this.getDefaultHelpItems,
      },
    };
  }
}

customElements.define('help-page', HelpPage);

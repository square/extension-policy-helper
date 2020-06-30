
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { ExceptionRequired } from '../../lib.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-image/iron-image.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-item/paper-item-body.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-tooltip/paper-tooltip.js';

/** Unique ID for iframe name (no shadow dom support for <a target>).
 * @type {number}
 */
let frameId = 0;

/**
 * @customElement
 * @polymer
 */
class ExtensionCard extends PolymerElement {
  static get template() {
    return html`
<style>
  :host {
    --chip-background: rgba(255,255,255,0.95);
  }

  [hidden] {
    display: none !important;
  }

  .card-actions > iframe {
    width: 100%;
    height: 40em;
    margin-top: 1em;
    margin-bottom: 1em;
    display: block;
  }

  paper-listbox {
    --paper-listbox-background-color: rgba(255,255,255,0);
  }

  paper-card {
    width: 100%;
  }

  paper-checkbox.exception-checkbox {
    display: block;
    padding: 0.25em;
    margin-top: 2px;
    margin-bottom: 2px;
    background-color: rgba(255,255,255,0.5);
  }

  .summary {
    @apply --paper-font-subhead;
  }

  .description {
    @apply --paper-font-body1;
  }

  .summary iron-image,paper-icon-button {
    float: right;
  }

  paper-card {
    --paper-card-background-color: var(--paper-pink-500);
    --paper-card-header-color: #fff;
  }

  paper-card[done] {
    --paper-card-background-color: var(--paper-pink-200);
    --paper-card-header-color: #272727;
  }

  paper-button {
    background-color: var(--chip-background);
  }

  div.card-actions > a {
    text-decoration: none;
  }

  paper-button > iron-icon {
    width: 1.5em;
    height: 1.5em;
    margin-right: 0.5em;
  }

  iron-icon[icon="done"] {
    color: green;
  }

  iron-icon[icon="launch"] {
    color: blue;
  }

  div.card-content {
    display: grid;
    grid-gap: 0.5em;
  }

  .description-chip {
    padding: 1em;
    border: 1px solid var(--divider-color);
    background-color: var(--chip-background);
  }

  .permission-chip ul {
    list-style-type: none;
  }

  #permissions {
    display: flex;
  }

  #permission-description {
    background-color: var(--chip-background);
    @apply --paper-font-subhead;
    padding: 1em;
    display: inline;
    margin-top: 0px;
    margin-bottom: 0px;
    margin-left: 0px;
    margin-right: 0.25em;
  }

  #permission-chips {
    display: grid;
    width: 100%;
    grid-gap: 0.25em;
  }

  .permission-chip {
    padding: 1em;
    margin: 0px;
    background-color: var(--chip-background);
  }

  .paper-item-link {
    color: inherit;
    text-decoration: none;
  }

  .tech-details {
    display: grid;
    padding: 1em;
    grid-column-gap: 1.5em;
    grid-row-gap: 0.3em;
    @apply --paper-font-code1;
  }

  .grid-left {
    grid-column: 1;
    white-space: nowrap;
  }

  .grid-right {
    grid-column: 2;
  }
</style>
<paper-card done\$="[[exceptionRequired.state.done]]" heading="[[exceptionRequired.extInfo.name]]">
  <div class="card-content">
    <div class="description-chip">
      <div class="summary">
        <span>Description</span>
        <iron-image id="icon" height="24" width="24" sizing="contain" src="[[getImage(exceptionRequired)]]"></iron-image>
      </div>
      <div class="description">[[exceptionRequired.extInfo.description]]</div>
    </div>

    <div class="description-chip">
      <div class="summary"><span>Tech Details</span><paper-icon-button on-tap="toggleTechDetails" icon="[[getExpandIcon(showTechDetails)]]"></paper-icon-buton></div>
      <div class="description tech-details" hidden\$="[[!showTechDetails]]">
        <div class="grid-left">id</div>
        <div class="grid-right">[[exceptionRequired.extInfo.id]]</div>

        <div class="grid-left">Version</div>
        <div class="grid-right">[[exceptionRequired.extInfo.version]]</div>

        <div class="grid-left">Install Type</div>
        <div class="grid-right">[[exceptionRequired.extInfo.installType]]</div>

        <div class="grid-left">Enabled?</div>
        <div class="grid-right">[[exceptionRequired.extInfo.enabled]]</div>

        <div class="grid-left">Can be disabled/uninstalled?</div>
        <div class="grid-right">[[exceptionRequired.extInfo.mayDisable]]</div>

        <div class="grid-left" hidden\$="[[exceptionRequired.extInfo.enabled]]">Disabled Reason</div>
        <div class="grid-right" hidden\$="[[exceptionRequired.extInfo.enabled]]">[[exceptionRequired.extInfo.disabledReason]]</div>

        <div class="grid-left" hidden\$="[[exceptionRequired.extInfo.enabled]]">Can be enabled?</div>
        <div class="grid-right" hidden\$="[[exceptionRequired.extInfo.enabled]]">[[exceptionRequired.extInfo.mayEnable]]</div>
      </div>
    </div>


    <div class="description-chip">
      <div class="summary"><span>External Resources</span><paper-icon-button on-tap="toggleExternalResources" icon="[[getExpandIcon(showExternalResources)]]"></paper-icon-buton></div>
      <div class="description" role="listbox" hidden\$="[[!showExternalResources]]">
        <a href="[[webstoreLink(exceptionRequired)]]" target="_blank" rel="noopener noreferrer" tabindex="-1" class="paper-item-link">
          <paper-icon-item>
            <iron-icon icon="launch" slot="item-icon"></iron-icon>
            <paper-item-body>Chrome Webstore</paper-item-body>
          </paper-icon-item>
        </a>
        <a href="[[crxcavatorLink(exceptionRequired)]]" target="_blank" rel="noopener noreferrer" tabindex="-1" class="paper-item-link">
          <paper-icon-item>
            <iron-icon icon="launch" slot="item-icon"></iron-icon>
            <paper-item-body two-line>
              <div>CRXcavator</div>
              <div secondary>CRXcavator is a service provided by Duo Security to help evaluate Chrome Extension risk</div>
            </paper-item-body>
          </paper-icon-item>
        </a>
      </div>
    </div>

    <div id="permissions">

      <div id="permission-description">Permissions</div>

      <div id="permission-chips">
        <div class="permission-chip" hidden\$="[[isInstallationAllowed(exceptionRequired.installationMode)]]">
          <div class="summary">Installation Blocked</div>
          <div class="description">[[installationModeDescription(exceptionRequired.installationMode)]]</div>
        </div>
        <div class="permission-chip" hidden\$="[[hideSystemAccess(exceptionRequired)]]">
          <div class="summary">System Access</div>
          <div class="description">
            <div>This extension requests access to the following system resources:</div>
            <ul>
              <dom-repeat items="[[exceptionRequired.systemAccess]]">
                <template>
                  <li>[[item]]</li>
                </template>
              </dom-repeat>
            </ul>
            <div>It will be automatically disabled.</div>
          </div>
        </div>

        <div class="permission-chip" hidden\$="[[hideSensitiveDomains(exceptionRequired)]]">
          <div class="summary">Access to sensitive domains</div>
          <div class="description">
            <div>This extension requests access to some internal or sensitive domains, which will be prevented by the policy.</div>
            <div>(Optional) Please select any websites that you wish to request an exception for:</div>
            <paper-listbox multi attr-for-selected="name" selected-values="{{sensitiveDomainsExceptions}}">
              <dom-repeat items="[[exceptionRequired.sensitiveDomains]]">
                <template>
                  <paper-checkbox name="[[item]]" class="exception-checkbox">[[item]]</paper-checkbox>
                </template>
              </dom-repeat>
            </paper-listbox>
          </div>
        </div>

        <div class="permission-chip" hidden\$="[[hideAllUrls(exceptionRequired)]]">
          <div class="summary">Access to all websites</div>
          <div class="description">
            <div>This extension requests access to all websites.</div>
            <div>It will continue to work, but will lose access to some websites.</div>
            <div>(Optional) Please select any websites that you wish to request an exception for:</div>
              <paper-listbox multi attr-for-selected="name" selected-values="{{allUrlsExceptions}}">
                <dom-repeat items="[[computeAllUrlsBlockedHosts(exceptionRequired)]]">
                  <template>
                    <paper-checkbox name="[[item]]" class="exception-checkbox">[[item]]</paper-checkbox>
                  </template
                </dom-repeat>
              </paper-listbox>
            </div>
          </div>
        </div>

      </div> <!-- id="permission-chips" -->
    </div> <!-- id="permissions" -->
  </div> <!-- class="card-content" -->

  <div class="card-actions">
    <paper-button raised on-tap="done" hidden="[[exceptionRequired.state.done]]"><iron-icon icon="done"></iron-icon>Done</paper-button>
    <a href="[[formsLink]]" target="[[frameId]]" tabindex="-1" rel="noopener noreferrer">
      <paper-button raised id="formbutton" disabled="[[noExceptionNeeded]]" on-tap="exceptionButtonTapped"><iron-icon icon="launch"></iron-icon>Request Exception</paper-button>
    </a>
    <paper-tooltip>[[tooltipText(noExceptionNeeded)]]</paper-tooltip>
    <iframe on-load="formLoaded" hidden\$="[[hideFrame]]" name="[[frameId]]"></iframe>
  </div>
</paper-card>
`
  }

  /**
   * Create the tooltip text for the Request Exception button.
   *
   * @param {boolean} noExceptionNeeded
   */
  tooltipText(noExceptionNeeded) {
    if (noExceptionNeeded) {
      return "No need to request an exception - the extension will continue working, but will no longer affect internal websites";
    } else {
      return "Request an exception by launching Google Forms - the form will be pre-filled";
    }
  }

  /**
   * Event handler for form iframe load events.
   *
   * @param {Event} ev
   */
  formLoaded(ev) {
    this.iFrameLoadCount += 1;
    if (this.iFrameLoadCount == 3) {
      this.exceptionRequired.updateState({ done: true });
    }
  }

  exceptionButtonTapped() {
    this.hideFrame = false;
  }

  /**
   * Find the value of a form item.
   *
   * @param {!ExceptionRequired} exceptionRequired
   * @param {string[]} allUrlsExceptions
   * @param {string[]} sensitiveDomainsExceptions
   * @param {string} formField
   * @return {*}
   */
  findFormItemValue(exceptionRequired, allUrlsExceptions, sensitiveDomainsExceptions, formField) {
    if (!formField) {
      return undefined;
    }

    if (formField == 'requestedDomains') {
      return allUrlsExceptions.concat(sensitiveDomainsExceptions);
    }

    if (formField == 'blockedPermissions') {
      return exceptionRequired.systemAccess;
    }

    if (exceptionRequired.extInfo.hasOwnProperty(formField)) {
      return exceptionRequired.extInfo[formField];
    }

    return undefined;
  }

  /**
   * Compute the Google Forms link for this extension.
   *
   * @param {string} formUrl
   * @param {object} formQueryParams
   * @param {!ExceptionRequired} exceptionRequired
   * @param {!Array<string>} allUrlsExceptions
   * @param {!Array<string>} sensitiveDomainsExceptions
   * @return {string}
   */
  computeFormsLink(formUrl, formQueryParams, exceptionRequired, allUrlsExceptions, sensitiveDomainsExceptions, noExceptionNeeded) {
    if (noExceptionNeeded) {
      return '';
    }

    if (!formUrl) {
      return '';
    }

    const /** !URL */ baseUrl = new URL(formUrl);
    const /** !URLSearchParams */ params = baseUrl.searchParams;
    for (let field of formQueryParams) {
      let value = this.findFormItemValue(exceptionRequired, allUrlsExceptions, sensitiveDomainsExceptions, field.value);

      if (value === undefined) {
        continue;
      }

      /** Normalize array to string with join, if specified.  Browser defaults to ',' otherwise. */
      if (value instanceof Array) {
        if (field.join !== undefined) {
          value = value.join(field.join);
        } else {
          for (let v of value) {
            params.append(field.param, v);
          }
          continue;
        }
      }

      params.set(field.param, value);
    }

    return baseUrl.toString();
  }

  /**
   * Checks whether no exception request is needed.
   *
   * @param {!Array<string>} allUrlsExceptions
   * @param {!Array<string>} sensitiveDomainsExceptions
   * @param {ExceptionRequired} exceptionRequired
   * @returns {boolean}
   */
  computeNoExceptionNeeded(allUrlsExceptions, sensitiveDomainsExceptions, exceptionRequired) {
    if (!exceptionRequired) {
      return true;
    }
    return (allUrlsExceptions.length + sensitiveDomainsExceptions.length + exceptionRequired.systemAccess.length) == 0;
  }

  crxcavatorLink(exceptionRequired) {
    return `https://crxcavator.io/report/${exceptionRequired.extInfo.id}/${exceptionRequired.extInfo.version}`;
  }

  webstoreLink(exceptionRequired) {
    return `https://chrome.google.com/webstore/detail/${exceptionRequired.extInfo.id}`;
  }

  /**
   * Whether to hide the allUrls permission chip.
   *
   * @param {!ExceptionRequired} exceptionRequired
   * @return {boolean}
   */
  hideAllUrls(exceptionRequired) {
    return (!!exceptionRequired.allUrls) && exceptionRequired.allUrls.length == 0;
  }

  /**
   * Whether to hide the sensitiveDomains permission chip.
   *
   * @param {!ExceptionRequired} exceptionRequired
   * @return {boolean}
   */
  hideSensitiveDomains(exceptionRequired) {
    return (!!exceptionRequired.sensitiveDomains) && exceptionRequired.sensitiveDomains.length == 0;
  }

  /**
   * Whether to hide the systemAccess permission chip.
   *
   * @param {!ExceptionRequired} exceptionRequired
   * @return {boolean}
   */
  hideSystemAccess(exceptionRequired) {
    return (!!exceptionRequired.systemAccess) && exceptionRequired.systemAccess.length == 0;
  }

  done() {
    this.exceptionRequired.updateState({ done: true });
    this.notifyPath('exceptionRequired.state.done');
  }

  /**
   * @param {!ExceptionRequired} exceptionRequired
   * @return {(string|undefined)}
   */
  getImage(exceptionRequired) {
    const icons = exceptionRequired.extInfo.icons || [];
    if (icons.length == 0) {
      return '';
    }

    const /** number */ imageSize = this.$.icon.width;

    /**
     * @param {number} x
     * @return {number}
     */
    function targetSize(x) {
      if (x > imageSize) {
        return x - imageSize;
      }
      return imageSize - x;
    }

    const icon = icons.sort((a, b) => targetSize(a.size) - targetSize(b.size))[0];
    return icon.url;
  }

  toggleTechDetails() {
    this.showTechDetails = !this.showTechDetails;
  }

  toggleExternalResources() {
    this.showExternalResources = !this.showExternalResources;
  }

  /**
   * Get the icon for an expand button.
   *
   * @param {boolean} expanded
   */
  getExpandIcon(expanded) {
    if (expanded) {
      return 'expand-less';
    }
    return 'expand-more';
  }

  isInstallationAllowed(installationMode) {
    return installationMode != 'blocked' && installationMode != 'removed';
  }

  installationModeDescription(installationMode) {
    if (installationMode == 'blocked') {
      return 'This extension will be disabled.  This is usually because the extension is malicious or has serious security vulnerabilities.';
    }

    if (installationMode == 'removed') {
      return 'This extension will be uninstalled.  This is usually because the extension is malicious or has serious security vulnerabilities.';
    }

    return installationMode;
  }

  /**
   * @param {!ExceptionRequired} exceptionRequired
   */
  computeAllUrlsBlockedHosts(exceptionRequired) {
    return exceptionRequired.blockedDomains.map(bd => {
      const overlapping = bd.getOverlapping(exceptionRequired.allowedDomains);
      if (overlapping.length == 0) {
        return bd.toString();
      }

      return `${bd.toString()}, except for ${overlapping.join(', ')}`
    });
  }

  static get properties() {
    return {
      exceptionRequired: {
        type: Object,
      },
      showTechDetails: {
        type: Boolean,
        value: false,
      },
      showExternalResources: {
        type: Boolean,
        value: false,
      },
      allUrlsExceptions: {
        type: Array,
        value: () => [],
      },
      sensitiveDomainsExceptions: {
        type: Array,
        value: () => [],
      },
      noExceptionNeeded: {
        type: Boolean,
        computed: 'computeNoExceptionNeeded(allUrlsExceptions, sensitiveDomainsExceptions, exceptionRequired, allUrlsExceptions.*, sensitiveDomainsExceptions.*)'
      },
      formsLink: {
        type: String,
        computed: 'computeFormsLink(formUrl, formQueryParams, exceptionRequired, allUrlsExceptions, sensitiveDomainsExceptions, noExceptionNeeded, allUrlsExceptions.*, sensitiveDomainsExceptions.*)'
      },
      frameId: {
        type: String,
        readOnly: true,
        value: () => {
          frameId += 1;
          return `formframe-${frameId}`;
        },
      },
      hideFrame: {
        type: Boolean,
        value: true,
      },
      iFrameLoadCount: {
        type: Number,
        value: 0,
      },
      formUrl: {
        type: String,
      },
      formQueryParams: {
        type: Array,
        value: () => [],
      },
    }
  }
}

customElements.define('extension-card', ExtensionCard);

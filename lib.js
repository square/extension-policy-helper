/**
 * Regular expression that matches the various types of host permissions that match all domains.
 *
 * @type {!RegExp}
 */
const ALL_URLS_RE = /^(<all_urls>$|(https?|ftp|\*):\/\/\*\/)/;

export class ExtensionSetting {
  /**
   * @param {object} param0
   * @param {string=} param0.installation_mode
   * @param {!Array<string>=} param0.allowed_permissions
   * @param {!Array<string>=} param0.blocked_permissions
   * @param {string=} param0.blocked_install_message
   * @param {!Array<string>=} param0.runtime_blocked_hosts
   * @param {!Array<string>=} param0.runtime_allowed_hosts
   */
  constructor({ installation_mode, allowed_permissions, blocked_permissions, blocked_install_message, runtime_blocked_hosts, runtime_allowed_hosts }) {
    this.installation_mode = installation_mode;
    this.allowed_permissions = allowed_permissions;
    this.blocked_permissions = blocked_permissions;
    this.blocked_install_message = blocked_install_message;
    this.runtime_blocked_hosts = runtime_blocked_hosts;
    this.runtime_allowed_hosts = runtime_allowed_hosts;
  }
}

/**
 * Regular expression that matches host permissions.  The domain(ish) part is the third group.
 *
 * @const {!RegExp}
 */
const HOST_PERMISSION_RE = /^(https?|ftp|\*):\/\/((\*\.)?([^\/])+|\*)([:\/].*)?$/;

export class HostPattern {
  constructor(matchPattern) {
    if (matchPattern == '<all_urls>') {
      this.scheme = '*';
      this.host = '*';
      return;
    }

    const match = HOST_PERMISSION_RE.exec(matchPattern);
    if (!match) {
      throw new Error('Invalid matchPattern: ' + matchPattern);
    }
    this.scheme = match[1];
    this.host = match[2];
  }

  /**
   * @param {HostPattern} other
   * @returns {boolean}
   */
  isOverlapping(other) {
    if (this.scheme != '*' && other.scheme != '*' && this.scheme != other.scheme) {
      return false;
    }

    if (this.host === other.host) {
      return true;
    }

    if (this.host == '*' || other.host == '*') {
      return true;
    }

    if (this.host.startsWith('*.')) {
      const domain1 = this.host.substr(2);

      /** this.host = *.example.com, other.host = a.b.c.example.com */
      if (other.host.endsWith('.' + domain1)) {
        return true;
      }

      /** this.host = *.example.com, other.host = example.com */
      if (other.host === domain1) {
        return true;
      }
    }

    if (other.host.startsWith('*.')) {
      const domain2 = other.host.substr(2);

      /** other.host = *.example.com, this.host = a.b.c.example.com */
      if (this.host.endsWith('.' + domain2)) {
        return true;
      }

      /** other.host = *.example.com, this.host = example.com */
      if (this.host === domain2) {
        return true;
      }
    }

    // TODO(msamuel): suppert eTLD wildcards (eg. *.example.*)

    return false;
  }

  /**
   * @param {!HostPattern} other
   */
  equals(other) {
    return other.scheme == this.scheme && other.host == this.host;
  }

  /**
   * @param {!Array<!HostPattern>} others
   * @returns {boolean}
   */
  hasEquals(others) {
    return others.filter(x => x.equals(this)).length > 0;
  }


  /**
   * Get all overlapping host hostPatterns to this one.
   *
   * @param {!Array<HostPattern>} others
   * @return {!Array<hostPattern>}
   */
  getOverlapping(others) {
    return others.filter(x => x.isOverlapping(this));
  }

  /**
   * @returns {string}
   */
  toString() {
    return this.scheme + '://' + this.host;
  }
}

/**
 * Information about an installed Chrome Extension and its relation to policy.
 */
export class ExceptionRequired {
  /**
   * @param {!chrome.management.ExtensionInfo} extInfo
   * @param {(!Object|undefined)} state
   */
  constructor(extInfo, state) {
    /** @type {!chrome.management.ExtensionInfo} */
    this.extInfo = extInfo;

    /** @type {!Array<string>} */
    this.systemAccess = [];

    /** @type {!Array<string>} */
    this.sensitiveDomains = [];

    /** @type {!Array<string>} */
    this.allUrls = [];

    /** @type {string} */
    this.installationMode = 'allowed';

    /** @type {!Object} */
    this.state = state || {};

    /** @type {!Array<!HostPattern>} */
    this.blockedDomains = [];

    /** @type {!Array<!HostPattern>} */
    this.allowedDomains = [];
  }

  /**
   * Whether exception is required for this extension.
   *
   * @return {!boolean}
   */
  isExceptionRequired() {
    const /** boolean */ permissionsRequested = !!(this.systemAccess.length + this.sensitiveDomains.length + this.allUrls.length);
    const /** boolean */ installBlocked = this.installationMode == 'blocked' || this.installationMode == 'removed';
    return permissionsRequested || installBlocked;
  }

  /**
   * Update the state in both this object and sync storage.
   *
   * @param {object} param0
   * @param {boolean=} param0.notified
   * @param {boolean=} param0.done
   */
  updateState({ notified, done }) {
    if (notified !== undefined) {
      this.state.notified = notified;
    }

    if (done !== undefined) {
      this.state.done = done;
    }

    chrome.storage.sync.set({
      ['state-' + this.extInfo.id]: this.state,
    })
  }
}

export class ExtensionSurvey {
  /**
   * @param {!Map<string, ExtensionSetting>} extensionSettings Extension settings (see https://www.chromium.org/administrators/policy-list-3/extension-settings-full)
   * @param {!Map<string, !Object>} extensionStates List of extensions that have already had questions answered by this user.
   */
  constructor(extensionSettings, extensionStates) {
    this.extensionSettings = extensionSettings;
    this.extensionStates = extensionStates;
  }

  /**
   * @return {!Promise<!ExtensionSurvey>}
   */
  static async load() {
    const extensionSettings = await new Promise((resolve, reject) => {
      chrome.storage.managed.get('ExtensionSettings', items => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        const es = items['ExtensionSettings'] || {};
        const /** Map<string, ExtensionSetting> */ esMap = new Map(Object.keys(es).map(k => [k, new ExtensionSetting(es[k])]));
        resolve(esMap);
      });
    });

    const extensionStates = await new Promise((resolve, reject) => {
      chrome.storage.sync.get(items => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        const /** !Array<string> */ extensionStateKeys = Object.keys(items || {}).filter(x => x.startsWith("state-"));
        const /** !Map<string, object> */ extensionStates = new Map(extensionStateKeys.map(k => [k.substr(6), items[k]]));
        resolve(extensionStates)
      });
    });

    return new ExtensionSurvey(extensionSettings, extensionStates);
  }

  /**
   * @param {chrome.management.ExtensionInfo} extInfo
   * @return {!ExceptionRequired}
   */
  getExceptionRequired(extInfo) {
    const er = new ExceptionRequired(extInfo, this.extensionStates.get(extInfo.id));

    let specificExtensionSettings = this.extensionSettings.get(extInfo.id);
    let defaultExtensionSettings = this.extensionSettings.get('*');

    er.installationMode = function () {
      if (specificExtensionSettings && specificExtensionSettings.installation_mode) {
        return specificExtensionSettings.installation_mode;
      }

      if (defaultExtensionSettings && defaultExtensionSettings.installation_mode) {
        return defaultExtensionSettings.installation_mode;
      }

      return 'allowed';
    }();

    const allowedPermissions = function () {
      if (specificExtensionSettings && specificExtensionSettings.allowed_permissions) {
        return new Set(specificExtensionSettings.allowed_permissions);
      }

      if (defaultExtensionSettings && defaultExtensionSettings.allowed_permissions) {
        return new Set(defaultExtensionSettings.allowed_permissions);
      }

      return new Set();
    }();

    const blockedPermissions = function () {
      if (specificExtensionSettings && specificExtensionSettings.blocked_permissions) {
        return new Set(specificExtensionSettings.blocked_permissions);
      }

      if (defaultExtensionSettings && defaultExtensionSettings.blocked_permissions) {
        return new Set(defaultExtensionSettings.blocked_permissions);
      }

      return new Set();
    }();

    /** @type {function(string): (!HostPattern|undefined)} */
    const extractHostPattern = (matchPattern) => {
      try {
        return new HostPattern(matchPattern);
      } catch (e) {
        console.error(e);
        return undefined;
      }
    }

    const allowedDomains = (() => {
      if (specificExtensionSettings && specificExtensionSettings.runtime_allowed_hosts) {
        return specificExtensionSettings.runtime_allowed_hosts.map(extractHostPattern).filter(x => x !== undefined);
      }

      if (defaultExtensionSettings && defaultExtensionSettings.runtime_allowed_hosts) {
        return defaultExtensionSettings.runtime_allowed_hosts.map(extractHostPattern).filter(x => x !== undefined);
      }

      return [];
    })();

    const blockedDomains = (() => {
      if (specificExtensionSettings && specificExtensionSettings.runtime_blocked_hosts) {
        return specificExtensionSettings.runtime_blocked_hosts.map(extractHostPattern).filter(x => x !== undefined);
      }

      if (defaultExtensionSettings && defaultExtensionSettings.runtime_blocked_hosts) {
        return defaultExtensionSettings.runtime_blocked_hosts.map(extractHostPattern).filter(x => x !== undefined);
      }

      return [];
    })().filter(x => !x.hasEquals(allowedDomains));

    er.blockedDomains = blockedDomains;
    er.allowedDomains = allowedDomains;

    for (let p of extInfo.permissions) {
      if (blockedPermissions.has(p) && !allowedPermissions.has(p)) {
        er.systemAccess.push(p);
      }
    }

    /**
     *
     * @param {!Array<!HostPattern>} domainList
     * @param {!HostPattern} d
     * @returns {boolean}
     */
    const hasOverlappingDomain = (domainList, d) => {
      for (let bd of domainList) {
        if (bd.isOverlapping(d)) {
          return true;
        }
      }
      return false;
    };

    for (let h of extInfo.hostPermissions) {
      if (blockedDomains.length > 0 && ALL_URLS_RE.test(h)) {
        er.allUrls.push(h);
        continue
      }

      const domainOrHost = extractHostPattern(h);
      if (!domainOrHost) {
        continue;
      }

      if (hasOverlappingDomain(blockedDomains, domainOrHost) && !hasOverlappingDomain(allowedDomains, domainOrHost)) {
        er.sensitiveDomains.push(h);
      }
    }

    return er;
  }


  /**
   * @return {!Promise<!Array<!ExceptionRequired>>}
   */
  async runSurvey(survey) {
    const extensions = await getAllExtensions();
    const exceptionNeeded = extensions
      .map(x => this.getExceptionRequired(x))
      .filter(x => x.isExceptionRequired());
    return exceptionNeeded;
  }
}

function getAllExtensions() {
  return new Promise((resolve, reject) => {
    if (!chrome || !chrome.management) {
      reject(new Error("No management permissions available"));
      return;
    }
    chrome.management.getAll(extensions => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(extensions);
    });
  });
}

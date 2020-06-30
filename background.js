'use strict';

import { ExtensionSurvey, ExceptionRequired } from './lib.js';

const /** string */ NOTIFICATION_ID = 'info_required';

/**
 * @param {!Array<!ExceptionRequired>} extensions
 */
function showNotification(extensions) {
  const /** number */ badgeNum = extensions.filter(x => !x.state.done).length;

  if (badgeNum == 0) {
    chrome.browserAction.setBadgeText({ text: '' });
    return;
  }

  chrome.browserAction.setBadgeText({ text: `${badgeNum}` });

  const /** {!Array<ExceptionRequired>} */ unNotified = extensions.filter(x => !x.state.notified);
  if (unNotified.length == 0) {
    return;
  }

  /**
   * @param {!ExceptionRequired} extension
   * @return {{title: string, message: string}}
   */
  function makeNotificationItem(extension) {
    const /** !Array<string> */ permissionList = [];
    if (extension.allUrls.length > 0) {
      permissionList.push('Access to all websites');
    }
    if (extension.systemAccess.length > 0) {
      permissionList.push('Access to system resources');
    }
    if (extension.sensitiveDomains.length > 0) {
      permissionList.push('Access to internal or sensitive domains');
    }

    return {
      'title': extension.extInfo.shortName,
      'message': `Permissions: ${permissionList.join(', ')}`
    };
  }

  const notificationDetails = {
    'type': 'list',
    'title': 'Extension Survey',
    'iconUrl': 'icon48.png',
    'message': 'We need some information about some Chrome extensions',
    'requireInteraction': true,
    'items': unNotified.map(makeNotificationItem),
  };

  chrome.notifications.create(NOTIFICATION_ID, notificationDetails);

  for (var er of unNotified) {
    er.updateState({ notified: true });
  }
}

function notificationClicked(notificationId) {
  if (notificationId != NOTIFICATION_ID) {
    return;
  }

  chrome.runtime.openOptionsPage();
  chrome.notifications.clear(NOTIFICATION_ID);
}

/**
 * Update the notification state
 */
function updateNotificationState() {
  ExtensionSurvey.load()
    .then(survey => survey.runSurvey())
    .then(showNotification, console.error);
}

chrome.notifications.onClicked.addListener(notificationClicked);

// Update the notification on state changes
chrome.storage.onChanged.addListener(updateNotificationState);        // storage (managed or sync) was changed
chrome.runtime.onInstalled.addListener(updateNotificationState);      // this is extension was installed
chrome.management.onInstalled.addListener(updateNotificationState);   // an app/extension was installed
chrome.management.onUninstalled.addListener(updateNotificationState); // an app/extension was uninstalled

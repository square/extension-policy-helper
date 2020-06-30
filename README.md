# Extension policy helper

This Chrome extension will look at the locally installed Chrome extensions, compare them to
a proposed policy, and notify users if some of their extensions will be affected.

Employees will then be prompted to fill in an exception request form, so that when policy is
rolled out, employees can be minimally affected by the change.

# License

Copyright 2020 Square, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

# Building

## Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) installed.

## Building The Extensions

```
$ ./production-build.sh
```

This will create a zipfile called `build/extension.zip`.

## Locally testing the extension

Run `polymer build` after any changes, then
from `chrome://extensions` choose "Load Unpacked" and select the `build/default`
subdirectory containined the compiled extension files.

## Uploading to the Chrome Web Store

To deploy a new version, go to the [Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).

The item will need to be `Unlisted`, unless all browsers are expected to be logged in to your GSuite domain.

Take note of the ID, as it is relevenant to configuration.

# Configuration

The extension is configured through managed policy - the details of which change between platforms:

- On MacOS, a plist file is installed as a Profile
- On Windows, the registry is used
- On ChromeOS, it is set through the GSuite Admin console

The file `managed_schema.json` contains the most detailed description of the configuration format.

For registry/profiles configuration, the TL;DR is that you configure `com.google.Chrome.extensions.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` where `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` is replaced with the ID that the Chrome Web Store assigns your copy of the extension.
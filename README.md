# Detect Unused Media Extension

The Antora Detect Unused Media Extension is intended to be used with Antora. Be sure to register it as an Antora extension in your playbook, not as an AsciiDoc extension.

## Overview

This extension checks if media assets (located in `assets/images`) are referenced in the `.adoc` content with `image:` or `video:`.

## Prerequisites

In order to use this extension, you must be using Node.js 20.
The following instructions assume you've already set up an Antora playbook file (i.e., `antora-playbook.yml`) to build your site.

To learn about using extensions with Antora, see the [Antora extension documentation]({url-extension-docs}).

## Install

Use the following command to install the extension into your playbook project:

```console
$ npm i @bonitasoft/antora-detect-unused-media-extension
```

## Register

Open your Antora playbook file and register the extension as an entry in the `antora.extensions` key.
If this key doesn't yet exist in your playbook, first create it.

.antora-playbook.yml
```yaml
antora:
  extensions:
  - require: '@bonitasoft/antora-detect-unused-media-extension'
    excludeImageExtension:  ['.png', 'gif']
```


You can configure this extension from configuration with attributes:

| Attribute             | Description                                         | Default value |
|-----------------------|-----------------------------------------------------|---------------|
| excludeImageExtension | List of image extensions to exclude from detection. | ['.cast']     |


**IMPORTANT**

* By default, the `.cast` extension are ignored



## References

<https://docs.antora.org/antora/latest>
<https://docs.antora.org/antora/latest/extend/extensions>

## ADDED Requirements

### Requirement: Public folder is self-contained extension package
The public/ folder SHALL contain all files needed for the extension to function when loaded directly into Chrome/Firefox.

#### Scenario: Load extension from public folder
- **WHEN** user loads public/ folder as unpacked extension in Chrome
- **THEN** extension installs successfully and popup works correctly

#### Scenario: All resources are accessible
- **WHEN** extension popup opens
- **THEN** all CSS, JS, icons, images, and TinyMCE editor load correctly without 404 errors

### Requirement: Manifest is in public folder
The manifest.json file SHALL be located in the public/ folder with correct paths.

#### Scenario: Manifest references correct paths
- **WHEN** Chrome loads extension from public/
- **THEN** default_popup points to "index.html" (not "./public/index.html")

### Requirement: Index HTML has correct resource paths
The index.html file SHALL use correct relative paths to access all resources within the public/ folder.

#### Scenario: CSS loads correctly
- **WHEN** popup opens
- **THEN** bootstrap.min.css and styles.css load from ./css/ paths

#### Scenario: JavaScript loads correctly
- **WHEN** popup opens
- **THEN** bootstrap.min.js, popper.min.js, and tinymce.min.js load from ./Js/ and ./tinymce/ paths

#### Scenario: Icons and images load correctly
- **WHEN** popup renders
- **THEN** all icons load from ./icons/ and images load from ./images/

## 1. Prepare public/ folder

- [x] 1.1 Create subdirectories in public/: css/, Js/, icons/, images/, tinymce/
- [x] 1.2 Copy css/bootstrap.min.css to public/css/
- [x] 1.3 Copy css/styles.css to public/css/
- [x] 1.4 Copy Js/bootstrap.min.js to public/Js/
- [x] 1.5 Copy Js/bootstrap.bundle.min.js to public/Js/
- [x] 1.6 Copy Js/popper.min.js to public/Js/
- [x] 1.7 Copy Js/firebase-app.js to public/Js/
- [x] 1.8 Copy Js/firebase-analytics.js to public/Js/
- [x] 1.9 Copy Js/firebase-firestore.js to public/Js/

## 2. Copy icons, images, and TinyMCE

- [x] 2.1 Copy all files from icons/ to public/icons/
- [x] 2.2 Copy images/default.png to public/images/
- [x] 2.3 Copy tinymce/ directory to public/tinymce/

## 3. Copy service worker and manifest

- [x] 3.1 Copy contextMenusNote.js to public/
- [x] 3.2 Copy manifest.json to public/

## 4. Update manifest.json

- [x] 4.1 Change default_popup from "./public/index.html" to "index.html"
- [x] 4.2 Verify service_worker path is correct (contextMenusNote.js)

## 5. Update index.html paths

- [x] 5.1 Change css paths from "../css/" to "./css/"
- [x] 5.2 Change Js paths from "../Js/" to "./Js/"
- [x] 5.3 Change tinymce path from "../tinymce/" to "./tinymce/"
- [x] 5.4 Change bundle.js path from "../public/bundle.js" to "./bundle.js"
- [x] 5.5 Change icon paths from "/icons/" to "./icons/"
- [x] 5.6 Change image paths from "/images/" to "./images/"

## 6. Cleanup

- [x] 6.1 Delete public/bundle.js.map (not needed for distribution)
- [x] 6.2 Delete public/.env (config should be set via settings UI)

## 7. Verify

- [x] 7.1 Build with webpack: npx webpack --config webpack.prod.js
- [x] 7.2 Copy all new files to public/ (repeat steps 1-3)
- [ ] 7.3 Test by loading public/ folder in Chrome extension manager

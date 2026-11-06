# MCQ Practice Scanner

Chrome extension (Manifest V3, no build step). It screenshots the visible tab when the user clicks Scan and sends it to `POST /v1/tools/mcq-solver/scan` on the backend.

## Distribution

Users download it from `/tools/mcq-practice` and add it with Load unpacked. `scripts/package-extension.sh` builds `public/downloads/mcq-practice-scanner.zip` from this folder on every `npm run build`. This README is left out of the zip.

The extension doesn't update itself, so users must download new versions again.

## Extension ID

`key` in `manifest.json` is a public key that gives every install the ID `knooemamppkbebedclhgbjnkchlenpfd`. The connect page only sends the login to this ID, so changing `key` means changing `MCQ_EXTENSION_ID` in `ConnectExtension.tsx` too.

The matching private key was not kept. A Chrome Web Store listing would get its own ID, which would need setting on the connect page.

## Point it at a local environment

The extension targets production by default. To use local servers, change `config.js`, and add the local origins to `host_permissions` and `externally_connectable` in `manifest.json`.

Don't commit those local changes.

## Login

The side panel opens `/tools/mcq-practice/connect/`, which sends the access token to the extension. It is held in `chrome.storage.session`, so it clears when the browser closes. When it expires the panel asks the user to connect again.

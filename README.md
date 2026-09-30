# Relink Save Workshop

A browser-based, save-file-only editor for Granblue Fantasy: Relink overmasteries. It does not connect to the game or modify game memory. The app reads and edits the selected save locally, then downloads an edited copy.

## Run locally

Requires Node.js 18 or newer. No packages or account are required.

```sh
npm run dev
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000). To stop the local server, press `Ctrl+C` in the terminal.

The app is deployed to [GitHub Pages](https://maristie.com/gbfr-save-workshop/). The site makes no save-file upload requests.

## Use

1. Choose or drop a readable `.dat` save file.
2. Pick a character and edit any of its four overmastery slots.
3. Choose **Download edited save**. The browser checks the save checksum and reads back the changed fields before exporting a new `*-edited.dat` file.
4. Keep the original save as a backup and make sure the game is closed before replacing a save manually.

The editor preserves unknown overmastery hashes and invalid existing values when their slots are untouched. Character records whose identity is not in the supported playable-character map, as well as incomplete or ambiguous attribute/level pairs, are read-only. A checksum mismatch disables exporting.

## Version and value notes

The [`xcier/GBFR-Save-Editor`](https://github.com/xcier/GBFR-Save-Editor) sample is useful. At the time this app was built, its current `main` pointed to [commit `8fdb449`](https://github.com/xcier/GBFR-Save-Editor/tree/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942), released as v1.1 on June 22, 2026. That predates the official [2.0.6 update](https://relink-ragnarok.granbluefantasy.com/en/updates/408/) of September 17, 2026. This does not prove the editor is incompatible; it means its behavior is not current-version confirmation.

The two references describe `1607` differently. BitterG's save path accepts the ordinary level flags `1, 2, 4, …, 512`. Save Lab v1.1 exposes raw amount presets and labels `0x03FF` as an 80% community override. This app keeps the one-hot levels as the normal choices and exposes `0x03FF` only as an explicitly nonstandard, version-dependent preset. Its in-game effect has not been verified against a current-version save.

Save Lab also labels character field `1404` as a separate four-hash RNG/overmastery vector. The editor here targets the four visible effect/value pairs in `1606/1607`; it does not conflate field `1404` with those slots. Its current 1606 catalog is based on the hashes recognized by BitterG's save path; unrecognized hashes are preserved when left untouched. See Save Lab's [field mapping audit](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/resources/overmastery_mapping_audit.csv) and [character field implementation](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/core/cheat_actions.py) for that distinction.

## Save layout

The format analysis follows the save and offline-loadout paths in [BitterG/GBFR-PE-Patch-Tool](https://github.com/BitterG/GBFR-PE-Patch-Tool):

- A character record is `IDType 1301`.
- Four overmastery attributes use `IDType 1606`; their level flags use `IDType 1607`.
- A character's four slot unit IDs start at `10,000,000 + (characterUnitID - 10,000) × 1,000`.
- A level is stored as a single bit: `1` through `512`, corresponding to levels 1 through 10.
- An empty stat uses the save's `0x887AE0B0` empty-value hash and level `0`.
- The edited slot checksum is recalculated using the hash seed and the section selected by save field `IDType 1003`.

Relevant upstream files: [`internal/backend/loadout_stats.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/master/internal/backend/loadout_stats.go) reads the four save slots; [`internal/backend/loadout_import_apply.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/master/internal/backend/loadout_import_apply.go) writes and verifies them; [`internal/backend/sigil_store.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/master/internal/backend/sigil_store.go) describes the checksum sections; [`internal/backend/overlimit.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/master/internal/backend/overlimit.go) contains the recognized stat hashes and value curves. The upstream desktop app also has a separate live-memory overmastery editor; this project uses only the save-file path.

The app checks for the expected FlatBuffers save structure and fails closed when required character, overmastery, or checksum data cannot be identified. It is not a universal save converter; saves with a different or encrypted layout are not supported.

## Credits and licensing

We use OpenAI Codex for development support.

This editor's browser interface, FlatBuffers parser and writer, and checksum implementation were written for this project. Its save-format analysis and some character/stat hash and value mappings were informed by these references:

- [BitterG/GBFR-PE-Patch-Tool](https://github.com/BitterG/GBFR-PE-Patch-Tool/tree/b67bce7704719e331359c1a3393ec8f090bcc192), especially its [Overmastery save reader](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/loadout_stats.go), [offline save writer](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/loadout_import_apply.go), [checksum implementation](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/sigil_store.go), and [Overmastery catalog](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/overlimit.go).
- [xcier/GBFR-Save-Editor](https://github.com/xcier/GBFR-Save-Editor/tree/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942), especially its [save parser/checksum](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/core/gbfr_save.py), [field 1404 editor](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/core/cheat_actions.py), and [Overmastery mapping audit](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/resources/overmastery_mapping_audit.csv).

As of September 30, 2026, GitHub reports no license for either reference repository, and neither repository contains a `LICENSE` file at the inspected revision. This project also currently has no `LICENSE` file. A public repository and attribution do not by themselves grant general rights to reuse source code; see [GitHub's licensing guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository). This project does not bundle source files from either reference repository.

## Privacy

The browser reads the selected file into local memory. The code has no analytics, external font loading, or upload endpoint. When hosted remotely, the host serves the static app files, but save contents remain in the browser.

## Feedback

Report app problems in [GitHub Issues](https://github.com/maristie/gbfr-save-workshop/issues). Issues are public, so do not attach save files or include private save data.

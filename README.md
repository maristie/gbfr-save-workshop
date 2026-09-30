# Relink Save Workshop

A browser-based, save-file-only editor for Granblue Fantasy: Relink. It edits overmasteries and adds Sigils and Wrightstones to the bag. It does not connect to the game or modify game memory. The app reads and edits the selected save locally, then downloads an edited copy.

## Run locally

Requires Node.js 18 or newer. No packages or account are required.

```sh
npm run dev
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000). To stop the local server, press `Ctrl+C` in the terminal.

The app is deployed to [GitHub Pages](https://maristie.com/gbfr-save-workshop/). The site makes no save-file upload requests.

## Use

1. Choose or drop a readable `.dat` save file.
2. Use **Overmastery** to edit any character’s four overmastery slots, or **Bag items** to add Sigils and Wrightstones.
3. In **Bag items**, copy an existing entry or open **Create from item catalog** to choose a named Sigil or Wrightstone, its traits, and how many copies to add. The editor fills in the save hashes automatically and keeps your catalog selections when you queue additions. Copies are unassigned and use existing empty save slots. Trait combinations are not checked for in-game legality, and the catalog may not cover every game item.
4. Choose **Download edited save**. The browser checks the save checksum and reads back changed overmastery and inventory fields before exporting a new `*-edited.dat` file.
5. Keep the original save as a backup and make sure the game is closed before replacing a save manually.

The editor preserves unknown overmastery hashes and invalid existing values when their slots are untouched. Character records whose identity is not in the supported playable-character map, as well as incomplete or ambiguous attribute/level pairs, are read-only. A checksum mismatch disables exporting.

Sigil and Wrightstone inventory records with incomplete or ambiguous fields cannot be selected as copy sources or empty targets. Adding an item reuses an existing empty item slot; this editor does not insert new FlatBuffers records or alter equipment currently attached to a weapon. New Sigils use an empty owner field and flags `2`; new Wrightstones use inactive `2104` and flags `2`. The tool derives a new serial from the save’s existing serials and advances the global counter when that counter is present.

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
- Sigil slot IDs begin at `30,000`: `2701` is the optional maximum serial counter, `2702` the serial, `2703` the Sigil hash, `2704` the Sigil level, `2706` the assigned-character hash, and `2707` the flags. Two trait lanes use `1701/1702` at `120,000,000 + (unitID - 30,000) × 100 + lane`.
- Wrightstone slot IDs begin at `50,000`: `2101` is the optional maximum serial counter, `2102` the stone hash, `2103` the serial, `2104` the active flag, and `2105` the flags. Three trait lanes use `1701/1702` at `140,000,000 + (unitID - 50,000) × 100 + lane`.

Relevant upstream files, pinned to the inspected revision: [`internal/backend/loadout_stats.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/loadout_stats.go) reads the four save slots; [`internal/backend/loadout_import_apply.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/loadout_import_apply.go) writes and verifies them; [`internal/backend/sigil_store.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/sigil_store.go) and [`internal/backend/wrightstone_store.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/wrightstone_store.go) define the Sigil and Wrightstone fields; [`internal/backend/sigil_gen.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/sigil_gen.go) and [`internal/backend/wrightstone_gen.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/wrightstone_gen.go) allocate empty slots and verify writes; [`internal/backend/overlimit.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/overlimit.go) contains the recognized stat hashes and value curves. The upstream desktop app also has separate live-memory editors; this project uses only save-file writes.

The `xcier/GBFR-Save-Editor` [Sigils and inventory implementation](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/ui/main_window.py) provides another comparison. Both references reuse empty preallocated rows and update per-item fields. BitterG’s save writer uses normal Sigil flags `2`, an empty owner hash, and Wrightstone `2104=false` / flags `2`; xcier documents `2707=3` as a common locked, unassigned Sigil variant. This editor uses the BitterG normal flags for newly added entries, leaving them unassigned and unlocked. The web app resolves named catalog choices to item and trait hashes without copying either reference’s generator code or legality rules. The catalog is a lookup aid, not a guarantee that any selected trait combination is legal in-game. The xcier snapshot above predates the official 2.0.6 update and does not confirm behavior on that game version.

The app checks for the expected FlatBuffers save structure and fails closed when required character, overmastery, inventory, or checksum data cannot be identified. It is not a universal save converter; saves with a different or encrypted layout are not supported.

## Credits and licensing

We use OpenAI Codex for development support.

This editor's browser interface, FlatBuffers parser and writer, and checksum implementation were written for this project. Its save-format analysis and some character/stat hash and inventory field mappings were informed by these references:

- [BitterG/GBFR-PE-Patch-Tool](https://github.com/BitterG/GBFR-PE-Patch-Tool/tree/b67bce7704719e331359c1a3393ec8f090bcc192), especially its [Overmastery save reader](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/loadout_stats.go), [offline save writer](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/loadout_import_apply.go), [Sigil writer](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/sigil_store.go), [Wrightstone writer](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/wrightstone_store.go), and [Overmastery catalog](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/overlimit.go).
- [xcier/GBFR-Save-Editor](https://github.com/xcier/GBFR-Save-Editor/tree/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942), especially its [save parser/checksum](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/core/gbfr_save.py), [field 1404 editor](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/core/cheat_actions.py), [Sigil/inventory UI](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/ui/main_window.py), and [Overmastery mapping audit](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/resources/overmastery_mapping_audit.csv).
- [Nenkai/GBFRDataTools](https://github.com/Nenkai/GBFRDataTools/tree/6783d753ef2beb8922e0419747bd972c68768ad8), whose MIT-licensed `item_id.csv` provides item names and ID hashes used by the selector catalog.
- [KrisCris/GBRelink-Sigil-Wiki](https://github.com/KrisCris/GBRelink-Sigil-Wiki/tree/93add042ed840d92bf2b0667355bc0b4773dfc17), whose MIT-licensed data provides Sigil-to-trait mappings and trait names used by the selector catalog.

As of September 30, 2026, GitHub reports no license for BitterG or xcier, and neither repository contains a `LICENSE` file at the inspected revision. This project does not copy their generator source code or legality rules. The reduced item and trait lookup data has separate MIT notices in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and `licenses/`. This project itself still has no `LICENSE` file. A public repository and attribution do not by themselves grant general rights to reuse source code; see [GitHub's licensing guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).

## Privacy

The browser reads the selected file into local memory. The code has no analytics, external font loading, or upload endpoint. When hosted remotely, the host serves the static app files, but save contents remain in the browser.

## Feedback

Report app problems in [GitHub Issues](https://github.com/maristie/gbfr-save-workshop/issues). Issues are public, so do not attach save files or include private save data.

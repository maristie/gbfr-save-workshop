# Relink Save Workshop

A browser-based, save-file-only editor for Granblue Fantasy: Relink. It edits overmasteries and Mastery Points, changes quantities on existing stackable bag items, adds or removes Sigils and Wrightstones, and adds Endless Ragnarok summon stones. It does not connect to the game or modify game memory. The app reads and edits the selected save locally, then downloads an edited copy.

## Run locally

Requires Node.js 18 or newer. No packages or account are required.

```sh
npm run dev
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000). To stop the local server, press `Ctrl+C` in the terminal.

The app is deployed to [GitHub Pages](https://maristie.com/gbfr-save-workshop/). The site makes no save-file upload requests.

## Languages

Use the language selector in the header to switch between English, Japanese, Simplified Chinese, and Traditional Chinese. The app remembers this preference in the browser. Interface labels, character names, overmastery stats, Sigils, traits, summon stones, summon bonuses, and stackable items are localized. Japanese Wrightstone labels use the in-game category name 加護. Stackable item labels use public Japanese item lists where available and readable Japanese renderings for English-only entries; a complete Japanese table keyed to Relink's item IDs is not publicly available.

## Use

1. Choose or drop a readable `.dat` save file.
2. Use **Overmastery** to edit any character’s four overmastery slots, **Mastery Points** to set the saved balance, **Bag items** to edit stack quantities and manage Sigils or Wrightstones, or **Summons** to add an Endless Ragnarok summon stone.
3. In **Bag items**, set amounts for multiple active stackable items and click **Apply all amounts**, or apply a single amount from its row. Then copy an existing Sigil or Wrightstone, delete an unassigned Sigil or inactive Wrightstone, or open **Create from item catalog** to choose a named Sigil/Wrightstone and how many copies to add. Search Sigils by name or first trait in separate fields; matching choices are grouped by first trait. After selecting a Sigil, use the second-trait search above the **SECONDARY TRAIT** selector to narrow its options. When a selectable-secondary Sigil has the same name and first trait as fixed-secondary variants, catalog search shows the selectable entry and omits those redundant variants. The catalog includes ER’s Celestial series, including 天星の界, as well as Fatebreaker and Divergence. For a new Sigil, its single level value is applied to the Sigil and every populated trait lane. Alpha+, Beta+, and Gamma+ Code Sigils are available with their fixed DMG Cap secondary trait. Stackable item quantities are editable only when their item hash and quantity fields are complete and the save already marks the stack as active. The editor does not create material rows or activate inactive catalog rows. For selectable `+` Sigils, the second-trait list includes every cataloged trait, allowing combinations made through Sigil Synthesis even when they are outside the natural drop pool. Fixed-secondary Sigils keep their fixed trait. New Sigils and Wrightstones use existing empty save slots. Trait combinations are not checked for in-game legality. Uncatalogued Sigils, Wrightstones, traits, and stackable items display their hashes alongside the label.
4. In **Summons**, search for a stone, then choose its main trait, equip bonus, and levels from that stone’s cataloged natural roll pools. Set the upgrade rank and quantity, then click **Add summon**. Both traits and their allowed levels are checked against the selected stone’s pool. Summons can only be added after the game has unlocked the summon system and when the save contains complete empty summon records and a registration entry for the selected type.
5. Choose **Download edited save**. The browser checks the save checksum and reads back changed overmastery, Mastery Points, stack quantities, Sigils, Wrightstones, and added summons before exporting a new `*-edited.dat` file.
6. Keep the original save as a backup and make sure the game is closed before replacing a save manually.

The editor preserves unknown overmastery hashes and invalid existing values when their slots are untouched. Character records whose identity is not in the supported playable-character map, as well as incomplete or ambiguous attribute/level pairs, are read-only. A checksum mismatch disables exporting.

Stack quantities use signed `IDType 1802` paired by unit ID with the item hash in unsigned `IDType 1801`. The editor accepts `0` through `2,147,483,647`, the signed int32 range. An existing positive quantity marks a row active; a zero-quantity row is treated as active only when its `1803`, `1804`, or `1807` state records are complete and unambiguous, with at least one nonzero value. The editor changes only the quantity and leaves inactive catalog rows, equipment slot fields, and special 190x/200x records alone. The item name lookup comes from the pinned `ITEM_*` subset in `src/material-catalog.js`; unknown or uncataloged hashes remain editable when their save rows meet the same checks.

Sigil and Wrightstone inventory records with incomplete or ambiguous fields cannot be selected as copy sources or empty targets. Adding an item reuses an existing empty item slot, and deleting one clears its item and trait fields while preserving its serial record. Assigned Sigils and active Wrightstones cannot be deleted. This editor does not insert new FlatBuffers records or alter equipment currently attached to a weapon. New Sigils use an empty owner field and flags `2`; new Wrightstones use inactive `2104` and flags `2`. The tool derives a new serial from the save’s existing serials and advances the global counter when that counter is present.

Summon additions reuse one of the 1,000 preallocated ER records. The writer fills `1456` through `1460`, advances the `1454` maximum slot ID, and sets the matching `1453` registration flag. The two levels in `1459` are stored in the signed integer table; the other summon fields are in the unsigned table. It requires a complete, unambiguous summon inventory and the game's `1455` unlock flag. The four equipped summon references in `1451` are left as they were, so new summons arrive unequipped. Both traits and their levels are restricted to the selected stone’s cataloged natural roll pools. A successful save readback does not establish that the game will accept every selected combination on every update.

The roll-pool catalog verifies trait and level combinations, but it does not yet map every summon hash to a natural reward route. A [reverse-engineered reward-table analysis](https://github.com/alexfrljuckic/GBFRelinkMod/blob/main/mods/summon-drops/DROP-TABLES.md) reports 174 of the 189 summon definitions reachable from the analyzed reward tables, but its published list omits the raw summon hashes. So the editor currently verifies natural roll legality; it cannot confirm that every selectable summon type is in an unmodified quest drop table.

## Version and value notes

The [`xcier/GBFR-Save-Editor`](https://github.com/xcier/GBFR-Save-Editor) sample is useful. At the time this app was built, its current `main` pointed to [commit `8fdb449`](https://github.com/xcier/GBFR-Save-Editor/tree/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942), released as v1.1 on June 22, 2026. That predates the official [2.0.6 update](https://relink-ragnarok.granbluefantasy.com/en/updates/408/) of September 17, 2026. This does not prove the editor is incompatible; it means its behavior is not current-version confirmation.

The two references describe `1607` differently. BitterG's save path accepts the ordinary level flags `1, 2, 4, …, 512`. Save Lab v1.1 exposes raw amount presets and labels `0x03FF` as an 80% community override. This app keeps the one-hot levels as the normal choices and exposes `0x03FF` only as an explicitly nonstandard, version-dependent preset. Its in-game effect has not been verified against a current-version save.

Save Lab also labels character field `1404` as a separate four-hash RNG/overmastery vector. The editor here targets the four visible effect/value pairs in `1606/1607`; it does not conflate field `1404` with those slots. Its current 1606 catalog is based on the hashes recognized by BitterG's save path; unrecognized hashes are preserved when left untouched. See Save Lab's [field mapping audit](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/resources/overmastery_mapping_audit.csv) and [character field implementation](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/core/cheat_actions.py) for that distinction.

Save Lab maps the Mastery Points balance to signed `IDType 1112`, unit ID `0`, and caps its editor at 9,999,999. This project uses that field mapping, allows edits only when exactly one complete scalar record exists, and verifies the value after writing. The reference snapshot predates the official 2.0.6 update, so the mapping has not been confirmed against a 2.0.6 save here.

## Save layout

The format analysis follows the save and offline-loadout paths in [BitterG/GBFR-PE-Patch-Tool](https://github.com/BitterG/GBFR-PE-Patch-Tool):

- A character record is `IDType 1301`.
- Four overmastery attributes use `IDType 1606`; their level flags use `IDType 1607`.
- A character's four slot unit IDs start at `10,000,000 + (characterUnitID - 10,000) × 1,000`.
- The Mastery Points balance is signed `IDType 1112` on unit ID `0`; this editor accepts `0` through `9,999,999`.
- Stackable ItemManager entries pair the item hash in `IDType 1801` with the signed quantity in `IDType 1802`. The quantity editor writes only the existing `1802` scalar.
- A level is stored as a single bit: `1` through `512`, corresponding to levels 1 through 10.
- An empty stat uses the save's `0x887AE0B0` empty-value hash and level `0`.
- The edited slot checksum is recalculated using the hash seed and the section selected by save field `IDType 1003`.
- Sigil slot IDs begin at `30,000`: `2701` is the optional maximum serial counter, `2702` the serial, `2703` the Sigil hash, `2704` the Sigil level, `2706` the assigned-character hash, and `2707` the flags. Two trait lanes use `1701/1702` at `120,000,000 + (unitID - 30,000) × 100 + lane`.
- Wrightstone slot IDs begin at `50,000`: `2101` is the optional maximum serial counter, `2102` the stone hash, `2103` the serial, `2104` the active flag, and `2105` the flags. Three trait lanes use `1701/1702` at `140,000,000 + (unitID - 50,000) × 100 + lane`.
- Endless Ragnarok summon records use unit IDs `0` through `999`: `1456` stores the slot ID, `1457` the summon type hash, `1458` two trait/bonus hashes, `1459` their levels, and `1460` the upgrade rank. `1452/1453` map summon types to registration flags; `1454` stores the maximum slot ID and `1455` the unlock flag.

Relevant upstream files, pinned to the inspected revision: [`internal/backend/loadout_stats.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/loadout_stats.go) reads the four save slots; [`internal/backend/loadout_import_apply.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/loadout_import_apply.go) writes and verifies them; [`internal/backend/sigil_store.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/sigil_store.go) and [`internal/backend/wrightstone_store.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/wrightstone_store.go) define the Sigil and Wrightstone fields; [`internal/backend/sigil_gen.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/sigil_gen.go) and [`internal/backend/wrightstone_gen.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/wrightstone_gen.go) allocate empty slots and verify writes; [`internal/backend/overlimit.go`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/overlimit.go) contains the recognized stat hashes and value curves. The upstream desktop app also has separate live-memory editors; this project uses only save-file writes.

The `xcier/GBFR-Save-Editor` [Mastery Points mapping](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/data/save_id_catalog.py) and [wallet field implementation](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/ui/main_window.py) informed the `1112` mapping above. Its [1801/1802 stack mapping](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/ui/main_window.py#L7609-L7627) and [active-row safety gate](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/ui/main_window.py#L7538-L7553) informed the quantity editor. The reference reports unsafe edits to inactive catalog rows, so this project only changes rows already marked active. Both inventory references reuse empty preallocated rows and update per-item fields. BitterG’s save writer uses normal Sigil flags `2`, an empty owner hash, and Wrightstone `2104=false` / flags `2`; xcier documents `2707=3` as a common locked, unassigned Sigil variant. This editor uses the BitterG normal flags for newly added entries, leaving them unassigned and unlocked. The web app resolves named catalog choices to item and trait hashes without copying either reference’s generator code or legality rules. The catalog is a lookup aid, not a guarantee that any selected trait combination is legal in-game. The xcier snapshot above predates the official 2.0.6 update and does not confirm behavior on that game version.

The app checks for the expected FlatBuffers save structure and fails closed when required character, overmastery, inventory, or checksum data cannot be identified. The Mastery Points control is read-only if its field is missing, duplicated, or incomplete. It is not a universal save converter; saves with a different or encrypted layout are not supported.

## Credits and licensing

We use OpenAI Codex for development support.

This editor's browser interface, FlatBuffers parser and writer, and checksum implementation were written for this project. Its save-format analysis and some character/stat hash and inventory field mappings were informed by these references:

- [BitterG/GBFR-PE-Patch-Tool](https://github.com/BitterG/GBFR-PE-Patch-Tool/tree/b67bce7704719e331359c1a3393ec8f090bcc192), especially its [Overmastery save reader](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/loadout_stats.go), [offline save writer](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/loadout_import_apply.go), [Sigil writer](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/sigil_store.go), [Wrightstone writer](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/wrightstone_store.go), and [Overmastery catalog](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/overlimit.go).
- [xcier/GBFR-Save-Editor](https://github.com/xcier/GBFR-Save-Editor/tree/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942), especially its [save parser/checksum](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/core/gbfr_save.py), [field 1404 editor](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/core/cheat_actions.py), [Sigil/inventory UI](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/ui/main_window.py), and [Overmastery mapping audit](https://github.com/xcier/GBFR-Save-Editor/blob/8fdb4497fcf0cf67a4b122062a00f8ff07cc3942/gbfr_editor/resources/overmastery_mapping_audit.csv).
- [Nenkai/GBFRDataTools](https://github.com/Nenkai/GBFRDataTools/tree/6783d753ef2beb8922e0419747bd972c68768ad8), whose MIT-licensed `item_id.csv` and trait/skill ID data provide item and trait names and hashes used by the selector catalog.
- [KrisCris/GBRelink-Sigil-Wiki](https://github.com/KrisCris/GBRelink-Sigil-Wiki/tree/93add042ed840d92bf2b0667355bc0b4773dfc17), whose MIT-licensed `outputs/sigil-database.json` provides current Sigil hashes, names, trait mappings, and localized Sigil/trait labels reduced into `src/inventory-catalog.js` and `src/inventory-terms.js`.

As of September 30, 2026, GitHub reports no license for BitterG or xcier, and neither repository contains a `LICENSE` file at the inspected revision. This project does not copy their generator source code or legality rules. Original application code and project-authored documentation are MIT licensed under [`LICENSE`](LICENSE). Third-party catalog data has the separate terms described in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and the accompanying license files. A public repository and attribution do not by themselves grant general rights to reuse source code; see [GitHub's licensing guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).

## Privacy

The browser reads the selected file into local memory. The code has no analytics, external font loading, or upload endpoint. When hosted remotely, the host serves the static app files, but save contents remain in the browser.

## Feedback

Report app problems in [GitHub Issues](https://github.com/maristie/gbfr-save-workshop/issues). Issues are public, so do not attach save files or include private save data.

# Third-party notices

The root [`LICENSE`](LICENSE) applies to original application code and project-authored documentation. It does not replace the terms for third-party catalog data below or grant rights to Granblue Fantasy: Relink content.

The named item and trait lookup tables in `src/inventory-catalog.js` are reduced mappings derived from these projects:

- [Nenkai/GBFRDataTools](https://github.com/Nenkai/GBFRDataTools/tree/6783d753ef2beb8922e0419747bd972c68768ad8): Sigil and item names and ID hashes from `GBFRQuestClearChecker/csv_data/item_id.csv`. The MIT license is reproduced in [`licenses/GBFRDataTools-MIT.txt`](licenses/GBFRDataTools-MIT.txt).
- [KrisCris/GBRelink-Sigil-Wiki](https://github.com/KrisCris/GBRelink-Sigil-Wiki/tree/93add042ed840d92bf2b0667355bc0b4773dfc17): Sigil-to-trait mappings, trait names, and the Japanese, Simplified Chinese, and Traditional Chinese Sigil/trait labels in `src/inventory-terms.js`, derived from `outputs/sigil-database.json`. The MIT license is reproduced in [`licenses/GBRelink-Sigil-Wiki-MIT.txt`](licenses/GBRelink-Sigil-Wiki-MIT.txt).
- The four Wrightstone type/hash and primary-trait mappings are based on [`BitterG/GBFR-PE-Patch-Tool`](https://github.com/BitterG/GBFR-PE-Patch-Tool/blob/b67bce7704719e331359c1a3393ec8f090bcc192/internal/backend/data/wrightstones.json) and its trait catalog. That repository had no `LICENSE` file at the inspected revision; no source code or legality rules from it are included here.

The reproduced MIT licenses apply to the respective upstream projects and their licensed material, not to other catalog material by implication. The Wrightstone mapping is included as factual reference data; no license is claimed for the upstream repository or for material that it did not license. GRANBLUE FANTASY: Relink, its item and trait names, and related game content are associated with Cygames and remain subject to their rights. This editor's catalog is a best-effort hash lookup; it does not establish that every trait combination is obtainable or valid in-game.

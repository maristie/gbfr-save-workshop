import {
  OVERMASTERY_STATS,
  MAX_ITEM_QUANTITY,
  MAX_MASTER_POINTS,
  changesForSave,
  checksumDisplay,
  createEditedSave,
  formatStatValue,
  getStat,
  hashToText,
  hasValidLevel,
  isEmptySlot,
  levelFromBit,
  parseSave,
  validateCustomInventoryAddition,
} from './save-format.js'
import { INVENTORY_CATALOG } from './inventory-catalog.js'
import { MATERIAL_ITEMS_BY_HASH } from './material-catalog.js'
import {
  allInventoryTermNames,
  characterSearchNames,
  initialLanguage,
  LANGUAGE_OPTIONS,
  localizeCharacter,
  localizeDOM,
  localizeInventoryTerm,
  localizeMaterialItem,
  allMaterialItemNames,
  localizeText,
  normalizeLanguage,
  saveLanguage,
} from './localization.js'

const app = document.querySelector('#app')
const ITEM_LIST_PAGE_SIZE = 100
const state = {
  fileName: '',
  bytes: null,
  parsed: null,
  selectedUnitId: null,
  error: '',
  notice: '',
  filter: '',
  activeTab: 'overmastery',
  masterPointsDraft: null,
  inventoryAdds: [],
  inventoryRemovals: [],
  itemQuantityDrafts: {},
  itemQuantityInputDrafts: {},
  inventoryFilter: { sigil: '', wrightstone: '', items: '' },
  itemListLimit: ITEM_LIST_PAGE_SIZE,
  catalogDrafts: { sigil: null, wrightstone: null },
  nextDraftId: 1,
  openRawKind: '',
  language: initialLanguage(),
}

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]))

const sigilsById = new Map(INVENTORY_CATALOG.sigils.map((item) => [item.id, item]))
const wrightstonesById = new Map(INVENTORY_CATALOG.wrightstones.map((item) => [item.id, item]))
const traitsByHash = new Map(INVENTORY_CATALOG.traits.map((trait) => [Number(trait.hash) >>> 0, trait]))
const sigilsByHash = new Map(INVENTORY_CATALOG.sigils.map((item) => [Number(item.hash) >>> 0, item]))
const wrightstonesByHash = new Map(INVENTORY_CATALOG.wrightstones.map((item) => [Number(item.hash) >>> 0, item]))
const duplicateSigilNames = new Set(INVENTORY_CATALOG.sigils
  .filter((item, index, items) => items.some((other, otherIndex) => otherIndex !== index && other.name === item.name))
  .map((item) => item.name))

function inventoryCatalog(kind) {
  return kind === 'sigil' ? INVENTORY_CATALOG.sigils : INVENTORY_CATALOG.wrightstones
}

function itemForHash(kind, hash) {
  return (kind === 'sigil' ? sigilsByHash : wrightstonesByHash).get(hash >>> 0) ?? null
}

function traitForHash(hash) {
  return traitsByHash.get(hash >>> 0) ?? null
}

function traitLabel(hash) {
  const trait = traitForHash(hash)
  return trait
    ? localizeInventoryTerm(trait.name, 'trait', state.language)
    : `${localizeText('Uncatalogued trait', state.language)}（${hashToText(hash)}）`
}

function itemLabel(kind, hash) {
  const item = itemForHash(kind, hash)
  if (!item) return `${localizeText(`Uncatalogued ${kind === 'sigil' ? 'Sigil' : 'Wrightstone'}`, state.language)}（${hashToText(hash)}）`
  const name = localizeInventoryTerm(item.name, kind, state.language)
  if (kind === 'sigil' && duplicateSigilNames.has(item.name)) {
    const secondary = localizeText(item.fixedSecondary ? 'fixed secondary' : 'selectable secondary', state.language)
    return `${name} · ${secondary}`
  }
  return name
}

function materialItemForHash(hash) {
  return MATERIAL_ITEMS_BY_HASH.get(hash >>> 0) ?? null
}

function materialItemLabel(hash) {
  const item = materialItemForHash(hash)
  return item
    ? localizeMaterialItem(item.name, state.language)
    : `${localizeText('Uncatalogued item', state.language)}（${hashToText(hash)}）`
}

function traitOptions(traits, includeEmpty = false, selectedHash = '') {
  const empty = includeEmpty ? `<option value="">${escapeHTML(localizeText('No additional trait', state.language))}</option>` : ''
  return `${empty}${traits.map((trait) => `<option value="${trait.hash}" data-max-level="${trait.maxLevel}"${trait.hash === selectedHash ? ' selected' : ''}>${escapeHTML(traitLabel(Number(trait.hash)))}</option>`).join('')}`
}

function optionsForSigil(item) {
  const secondaryHashes = item.secondaryTraitHashes ?? []
  if (!item.fixedSecondary && secondaryHashes.length > 0) return INVENTORY_CATALOG.traits
  return secondaryHashes
    .map((hash) => traitForHash(Number(hash)))
    .filter(Boolean)
}

function primaryTraitFor(item) {
  return traitForHash(Number(item.primaryTraitHash))
}

function selectedCharacter() {
  return state.parsed?.characters.find((character) => character.supported && character.unitId === state.selectedUnitId) ?? null
}

function supportedCharacters() {
  return state.parsed?.characters.filter((character) => character.supported) ?? []
}

function currentChanges() {
  if (!state.parsed) return []
  return changesForSave(state.parsed.characters)
}

function masterPointsChange() {
  const field = state.parsed?.masterPoints
  if (!field?.editable || state.masterPointsDraft === null || state.masterPointsDraft === field.value) return null
  return state.masterPointsDraft
}

function itemQuantityChanges() {
  return Object.entries(state.itemQuantityDrafts).map(([unitId, quantity]) => ({
    unitId: Number(unitId),
    quantity,
  }))
}

function itemQuantityInputCount() {
  return Object.keys(state.itemQuantityInputDrafts).length
}

function itemQuantityInputCountLabel(count) {
  const locale = state.language === 'ja' ? 'ja-JP' : state.language === 'zh-CN' ? 'zh-CN' : state.language === 'zh-TW' ? 'zh-TW' : 'en-US'
  const formattedCount = count.toLocaleString(locale)
  if (state.language === 'ja') return `${formattedCount} 件を一括適用できます`
  if (state.language === 'zh-CN') return `${formattedCount} 项数量待应用`
  if (state.language === 'zh-TW') return `${formattedCount} 項數量待套用`
  return `${formattedCount} item amount${count === 1 ? '' : 's'} ready to apply`
}

function updateItemQuantityBatchControls() {
  const count = itemQuantityInputCount()
  const label = app.querySelector('[data-role="item-quantity-input-count"]')
  const button = app.querySelector('[data-action="apply-all-item-quantities"]')
  if (label) label.textContent = itemQuantityInputCountLabel(count)
  if (button) button.disabled = count === 0 || !state.parsed?.checksumValid
}

function editFeedbackMarkup(changes, queued, pointsChange) {
  if (state.notice) return `<span class="feedback-check">✓</span>${escapeHTML(state.notice)}`
  const itemDrafts = itemQuantityInputCount()
  return `<span class="feedback-dot"></span><span>${changes.length ? `${changes.length} overmastery slot${changes.length === 1 ? '' : 's'}` : 'No overmastery edits'}</span>${pointsChange !== null ? `<span>· ${escapeHTML(localizeText('Mastery Points', state.language))}: ${escapeHTML(Number(state.parsed.masterPoints.value).toLocaleString())} → ${escapeHTML(Number(pointsChange).toLocaleString())}</span>` : ''}${queued ? `<span>· ${queued} bag change${queued === 1 ? '' : 's'}</span>` : ''}${itemDrafts ? `<span>· ${escapeHTML(itemQuantityInputCountLabel(itemDrafts))}</span>` : ''}`
}

function statOptions(slot) {
  const groups = new Map()
  for (const stat of OVERMASTERY_STATS) {
    if (!groups.has(stat.canonical)) groups.set(stat.canonical, { name: stat.name, rows: [] })
    groups.get(stat.canonical).rows.push(stat)
  }
  const currentKnown = getStat(slot.draftHash)
  const currentEmpty = isEmptySlot(slot)
  const preserved = !currentEmpty && !currentKnown
    ? `<option value="raw:${slot.draftHash >>> 0}" selected>Unrecognized existing stat · ${hashToText(slot.draftHash)} (preserved)</option>`
    : ''
  const options = [...groups.values()].map((group) => {
    const rows = group.rows.map((stat) => {
      const selected = stat.hash === slot.draftHash ? ' selected' : ''
      const suffix = stat.hash === stat.canonical ? localizeText('Standard', state.language) : `${localizeText('Compatibility ID', state.language)} · ${hashToText(stat.hash)}`
      return `<option value="${stat.hash.toString(16).toUpperCase()}"${selected}>${escapeHTML(suffix)}</option>`
    }).join('')
    return `<optgroup label="${escapeHTML(group.name)}">${rows}</optgroup>`
  }).join('')
  return `<option value=""${currentEmpty ? ' selected' : ''}>Empty slot</option>${preserved}${options}`
}

function levelOptions(slot) {
  const stat = getStat(slot.draftHash)
  const levelNumber = levelFromBit(slot.draftLevelBit)
  const communityRaw = slot.draftLevelBit === 0x03ff
  const invalid = !isEmptySlot(slot) && !levelNumber && !communityRaw
  const invalidOption = invalid
    ? `<option value="__stored__" selected>Invalid stored level · preserved</option>`
    : ''
  const options = Array.from({ length: 10 }, (_, index) => {
    const level = index + 1
    const value = formatStatValue(stat, level)
    const selected = level === levelNumber ? ' selected' : ''
    return `<option value="${level}"${selected}>LV ${level} <span>· ${escapeHTML(value)}</span></option>`
  }).join('')
  const rawOption = `<option value="community-raw"${communityRaw ? ' selected' : ''}>${escapeHTML(localizeText('Community raw preset · 0x03FF', state.language))}</option>`
  return `${invalidOption}<option value=""${isEmptySlot(slot) ? ' selected' : ''}>—</option>${options}${rawOption}`
}

function slotValue(slot) {
  if (!slot.editable) return { title: 'Unavailable', detail: 'The paired save fields are incomplete.' }
  if (isEmptySlot(slot)) return { title: 'Open slot', detail: 'Choose a stat to fill this slot.' }
  const stat = getStat(slot.draftHash)
  const level = levelFromBit(slot.draftLevelBit)
  if (!stat) return { title: 'Unknown stat', detail: `Stored ID ${hashToText(slot.draftHash)} will be preserved.` }
  if (slot.draftLevelBit === 0x03ff) return { title: stat.name, detail: 'Community raw override · 0x03FF' }
  if (!level) return { title: stat.name, detail: `The stored level ${hashToText(slot.draftLevelBit)} is invalid and will be preserved.` }
  return { title: stat.name, detail: `Level ${level} · ${formatStatValue(stat, level)}` }
}

function slotChanged(slot) {
  return slot.draftHash !== slot.originalHash || slot.draftLevelBit !== slot.originalLevelBit
}

function characterList() {
  const characters = supportedCharacters()
  const filtered = characters.filter((character) => `${characterSearchNames(character.name).join(' ')} ${character.hashText}`.toLowerCase().includes(state.filter.toLowerCase()))
  const rows = filtered.map((character) => {
    const available = character.slots.filter((slot) => slot.editable).length
    const filled = character.slots.filter((slot) => slot.editable && !isEmptySlot(slot)).length
    const selected = character.unitId === state.selectedUnitId
    const changed = character.slots.some(slotChanged)
    return `<button class="character-row${selected ? ' is-selected' : ''}" type="button" data-action="select-character" data-unit-id="${character.unitId}" aria-pressed="${selected}">
      <span class="character-mark">${escapeHTML(localizeCharacter(character.name, state.language).slice(0, 1).toUpperCase())}</span>
      <span class="character-copy"><strong>${escapeHTML(character.name)}</strong><small>${character.hashText} · ${filled}/${available} filled</small></span>
      ${changed ? '<span class="change-dot" aria-label="Edited"></span>' : ''}
      <span class="row-chevron" aria-hidden="true">›</span>
    </button>`
  }).join('')
  return {
    rows,
    count: filtered.length,
    emptyMessage: characters.length === 0 && !state.filter ? 'No supported characters found.' : 'No matching characters.',
  }
}

function renderUpload() {
  return `<section class="welcome-grid">
    <div class="welcome-copy">
      <p class="eyebrow"><span class="pulse-dot"></span> SAVE FILE EDITOR <span class="eyebrow-divider">/</span> SAVE WORKSHOP</p>
      <h1>Edit overmasteries. Set Mastery Points.</h1>
      <p class="welcome-text">Read a Relink save, adjust overmastery stats and Mastery Points, edit existing stackable item quantities, add Sigils and Wrightstones, or choose equipment from the catalog. Then download a verified copy.</p>
      <div class="trust-points">
        <span><i>01</i> Files stay on this device</span>
        <span><i>02</i> Original save stays untouched</span>
        <span><i>03</i> Mastery Points, Sigils and Wrightstones</span>
      </div>
      <button class="primary-button welcome-button" data-action="open-file" type="button"><span class="button-icon">↑</span> Choose save file</button>
    </div>
    <div class="drop-card" id="dropzone" tabindex="0" role="button" aria-label="Choose or drop a save file">
      <div class="drop-orbit orbit-one"></div><div class="drop-orbit orbit-two"></div>
      <div class="save-glyph"><span></span><span></span><span></span></div>
      <p class="drop-title">Drop your save here</p>
      <p class="drop-subtitle">A readable <code>.dat</code> save file</p>
      <span class="drop-browse">or browse files</span>
    </div>
    <div class="privacy-strip"><span class="privacy-lock">▣</span><span><strong>Private by design</strong> · The save is parsed and edited locally; nothing is uploaded.</span><a href="https://github.com/BitterG/GBFR-PE-Patch-Tool" target="_blank" rel="noreferrer">Save format reference ↗</a></div>
  </section>`
}

function queuedFor(kind) {
  return state.inventoryAdds.filter((addition) => addition.kind === kind).length
}

function queuedRemovalsFor(kind) {
  return state.inventoryRemovals.filter((removal) => removal.kind === kind).length
}

function inventorySlotsAfterQueue(kind) {
  return inventoryBucket(kind).available + queuedRemovalsFor(kind) - queuedFor(kind)
}

function isRemovalQueued(kind, unitId) {
  return state.inventoryRemovals.some((removal) => removal.kind === kind && removal.unitId === unitId)
}

function canDeleteInventoryRow(kind, row) {
  if (!row?.editable || row.empty) return false
  if (kind === 'sigil') return row.ownerHash === 0 || row.ownerHash === 0x887ae0b0
  return row.active === 0
}

function inventoryChangeCount() {
  return state.inventoryAdds.length + state.inventoryRemovals.length + itemQuantityChanges().length
}

function inventoryBucket(kind) {
  return state.parsed.inventory[kind === 'sigil' ? 'sigils' : 'wrightstones']
}

function inventoryRowSearchText(kind, row) {
  const item = itemForHash(kind, row.hash)
  const itemTerms = item ? allInventoryTermNames(item.name, kind) : [itemLabel(kind, row.hash)]
  const traitTerms = row.lanes.flatMap((lane) => {
    const trait = traitForHash(lane.hash)
    return [...(trait ? allInventoryTermNames(trait.name, 'trait') : [traitLabel(lane.hash)]), lane.level ?? '']
  })
  return [...itemTerms, row.unitId, row.level, ...traitTerms].join(' ').toLowerCase()
}

function renderInventoryCategory(kind) {
  const bucket = inventoryBucket(kind)
  const label = kind === 'sigil' ? 'Sigils' : 'Wrightstones'
  const title = kind === 'sigil' ? 'Sigils' : 'Wrightstones'
  const search = state.inventoryFilter[kind].trim().toLowerCase()
  const active = bucket.rows.filter((row) => !row.empty)
  const matched = search ? active.filter((row) => inventoryRowSearchText(kind, row).includes(search)) : active
  const shown = matched.slice(0, 100)
  const freeAfterQueue = Math.max(0, inventorySlotsAfterQueue(kind))
  const rows = shown.map((row) => {
    const traitSummary = row.lanes.map((lane, index) => {
      const empty = lane.hash === 0 || lane.hash === 0x887ae0b0
      return empty ? '' : `T${index + 1} ${traitLabel(lane.hash)} · Lv ${lane.level}`
    }).filter(Boolean).join('  /  ')
    const subtitle = kind === 'sigil' ? `Sigil Lv ${row.level}` : `Serial ${row.serial}`
    const queueAllowed = state.parsed.checksumValid && row.cloneable && freeAfterQueue > 0 && !bucket.maxCount.ambiguous && !bucket.serialAmbiguous
    const removalQueued = isRemovalQueued(kind, row.unitId)
    const removable = canDeleteInventoryRow(kind, row)
    const ownerLabel = removalQueued
      ? 'queued for removal'
      : kind === 'sigil'
        ? (!row.ownerHash || row.ownerHash === 0x887ae0b0 ? 'bag item' : 'assigned in source')
        : (row.active === 0 ? 'bag item' : 'active in source')
    const removeTitle = kind === 'sigil' ? 'Only unassigned Sigils can be deleted.' : 'Only inactive Wrightstones can be deleted.'
    const searchText = escapeHTML(inventoryRowSearchText(kind, row))
    return `<article class="inventory-row" data-inventory-row data-search="${searchText}">
      <div class="inventory-item-copy"><strong>${escapeHTML(itemLabel(kind, row.hash))}</strong><small>${subtitle} · Unit ${row.unitId} · ${ownerLabel}</small><span>${escapeHTML(traitSummary || 'No trait values recognized')}</span></div>
      <div class="inventory-row-actions">
        <button class="subtle-button inventory-add-button" data-action="queue-copy" data-kind="${kind}" data-unit-id="${row.unitId}" type="button" ${queueAllowed ? '' : 'disabled'}>Add copy</button>
        <button class="subtle-button inventory-remove-button" data-action="${removalQueued ? 'restore-removal' : 'queue-removal'}" data-kind="${kind}" data-unit-id="${row.unitId}" type="button" ${removalQueued || (state.parsed.checksumValid && removable) ? '' : 'disabled'}${!removalQueued && !removable ? ` title="${escapeHTML(localizeText(removeTitle, state.language))}"` : ''}>${removalQueued ? 'Undo' : 'Delete'}</button>
      </div>
    </article>`
  }).join('')
  const capText = `${(bucket.occupied - queuedRemovalsFor(kind)).toLocaleString()} in bag · ${freeAfterQueue.toLocaleString()} empty slots`
  const counterWarning = bucket.maxCount.ambiguous || bucket.serialAmbiguous
    ? `<div class="alert alert-warning"><strong>Slot counter or serial records are ambiguous.</strong> Adding copies is disabled for this item type in this save.</div>`
    : ''
  const emptyMarkup = matched.length === 0 ? '<p class="inventory-empty">No matching bag entries.</p>' : ''
  const moreMarkup = matched.length > shown.length
    ? `<p class="inventory-limit">Showing 100 of ${matched.length.toLocaleString()} matches. Refine the item name or trait search to narrow the list.</p>`
    : ''
  const catalogHelp = kind === 'sigil'
    ? 'For selectable + Sigils, all cataloged traits are available as the second trait, including combinations produced by Sigil Synthesis outside the natural drop pool. Trait combinations are not checked for in-game legality.'
    : 'Select named items and traits. Their save hashes are filled in automatically. Trait combinations are not checked for in-game legality.'
  return `<section class="inventory-card">
    <div class="inventory-card-heading"><div><p class="eyebrow">${label.toUpperCase()}</p><h3>${title}</h3></div><span class="inventory-capacity">${capText}</span></div>
    <p class="inventory-help">Copy an owned entry, delete unassigned Sigils or inactive Wrightstones, or choose one by name from the catalog. New copies go into an empty slot and are left unassigned.</p>
    ${counterWarning}
    <label class="search-box inventory-search"><span>⌕</span><input data-role="inventory-search" data-kind="${kind}" type="search" placeholder="Search item names, traits, or slot ID" value="${escapeHTML(state.inventoryFilter[kind])}" autocomplete="off" /></label>
    <div class="inventory-list">${rows || emptyMarkup}${moreMarkup}</div>
    <details class="raw-add-details" ${state.openRawKind === kind ? 'open' : ''}>
      <summary>Create from item catalog</summary>
      <p>${catalogHelp}</p>
      ${renderCatalogForm(kind)}
    </details>
  </section>`
}

function renderItemStacks() {
  const bucket = state.parsed.inventory.items
  const active = bucket.rows.filter((row) => row.active)
  const search = state.inventoryFilter.items.trim().toLowerCase()
  const matched = search ? active.filter((row) => {
    const item = materialItemForHash(row.hash)
    return [...(item ? allMaterialItemNames(item.name, state.language) : []), item?.id, row.hashText, row.unitId]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(search)
  }) : active
  const shown = matched.slice(0, state.itemListLimit)
  const locale = state.language === 'ja' ? 'ja-JP' : state.language === 'zh-CN' ? 'zh-CN' : state.language === 'zh-TW' ? 'zh-TW' : 'en-US'
  const rows = shown.map((row) => {
    const item = materialItemForHash(row.hash)
    const label = materialItemLabel(row.hash)
    const itemCode = item?.id ?? row.hashText
    const hasDraft = Object.hasOwn(state.itemQuantityDrafts, row.unitId)
    const quantity = hasDraft ? state.itemQuantityDrafts[row.unitId] : row.quantity
    const hasInputDraft = Object.hasOwn(state.itemQuantityInputDrafts, row.unitId)
    const inputValue = hasInputDraft
      ? state.itemQuantityInputDrafts[row.unitId]
      : quantity
    const disabled = !row.editable || !state.parsed.checksumValid
    const current = row.quantity === null ? localizeText('Unavailable', state.language) : row.quantity.toLocaleString(locale)
    const pending = hasInputDraft
      ? `${localizeText('Ready to apply', state.language)} ${inputValue || '—'}`
      : hasDraft
        ? `${localizeText('New amount', state.language)} ${Number(quantity).toLocaleString(locale)}`
        : ''
    const searchNames = item ? allMaterialItemNames(item.name, state.language) : [label]
    const searchText = escapeHTML([...searchNames, label, itemCode, row.hashText, row.unitId].join(' ').toLowerCase())
    return `<article class="inventory-row item-quantity-row" data-inventory-row data-search="${searchText}">
      <div class="inventory-item-copy"><strong>${escapeHTML(label)}</strong><small>${escapeHTML(itemCode)} · ${escapeHTML(localizeText('Unit', state.language))} ${row.unitId}</small><span>${escapeHTML(localizeText('Current amount', state.language))}: ${escapeHTML(current)}</span><span class="item-quantity-pending" data-role="item-quantity-input-status"${pending ? '' : ' hidden'}>${escapeHTML(pending)}</span>${row.editable ? '' : `<small>${escapeHTML(localizeText('Read-only: item or quantity fields are incomplete or ambiguous.', state.language))}</small>`}</div>
      <form class="item-quantity-form" data-role="item-quantity-form" data-unit-id="${row.unitId}">
        <label class="raw-field" for="item-quantity-${row.unitId}">${escapeHTML(localizeText('AMOUNT', state.language))}
          <input id="item-quantity-${row.unitId}" data-role="item-quantity-input" type="number" min="0" max="${MAX_ITEM_QUANTITY}" step="1" inputmode="numeric" value="${inputValue === null ? '' : escapeHTML(inputValue)}" ${disabled ? 'disabled' : ''} required />
        </label>
        <button class="subtle-button item-quantity-apply" type="submit" ${disabled ? 'disabled' : ''}>Apply amount</button>
      </form>
    </article>`
  }).join('')
  const capText = `${active.length.toLocaleString(locale)} ${localizeText('active stacks', state.language)} · ${active.filter((row) => row.editable).length.toLocaleString(locale)} ${localizeText('editable', state.language)}`
  const emptyMarkup = matched.length === 0 ? `<p class="inventory-empty">${escapeHTML(localizeText('No matching bag items.', state.language))}</p>` : ''
  const moreMarkup = matched.length > shown.length
    ? `<div class="inventory-load-more"><p class="inventory-limit">${escapeHTML(localizeText(`Showing ${shown.length.toLocaleString(locale)} of ${matched.length.toLocaleString(locale)} item matches.`, state.language))}</p><button class="subtle-button inventory-show-more" data-action="show-more-items" type="button">${escapeHTML(localizeText('Show more items', state.language))}</button></div>`
    : ''
  return `<section class="inventory-card stackable-items-card">
    <div class="inventory-card-heading"><div><p class="eyebrow">STACKABLE ITEMS</p><h3>Items and materials</h3></div><span class="inventory-capacity">${capText}</span></div>
    <p class="inventory-help">Set quantities for existing materials, currency, consumables, and other stackable items. Only stacks already active in the save can be edited. The save field accepts 0–${MAX_ITEM_QUANTITY.toLocaleString('en-US')}.</p>
    <p class="item-quantity-bulk-help">Edit several amounts, then apply them together.</p>
    <div class="item-quantity-bulk-actions"><span data-role="item-quantity-input-count" aria-live="polite">${escapeHTML(itemQuantityInputCountLabel(itemQuantityInputCount()))}</span><button class="subtle-button item-quantity-bulk-apply" data-action="apply-all-item-quantities" type="button" ${itemQuantityInputCount() > 0 && state.parsed.checksumValid ? '' : 'disabled'}>Apply all amounts</button></div>
    <label class="search-box inventory-search"><span>⌕</span><input data-role="inventory-search" data-kind="items" type="search" placeholder="Search item names, IDs, hashes, or slot" value="${escapeHTML(state.inventoryFilter.items)}" autocomplete="off" /></label>
    <div class="inventory-list">${rows || emptyMarkup}${moreMarkup}</div>
  </section>`
}

function renderCatalogForm(kind) {
  const items = inventoryCatalog(kind)
  if (!items.length) return '<p class="inventory-empty">The item catalog is unavailable.</p>'
  const draft = state.catalogDrafts[kind] ?? {}
  const itemId = String(draft.catalogItemId ?? '')
  const item = (kind === 'sigil' ? sigilsById : wrightstonesById).get(itemId) ?? null
  const primaryTrait = item ? primaryTraitFor(item) : null
  if (item && !primaryTrait) return '<p class="inventory-empty">The item catalog is unavailable.</p>'
  const bucket = inventoryBucket(kind)
  const remaining = Math.max(0, inventorySlotsAfterQueue(kind))
  const disabled = !state.parsed.checksumValid || remaining <= 0 || bucket.maxCount.ambiguous || bucket.serialAmbiguous
  const quantity = Math.max(1, Number.parseInt(draft.quantity, 10) || 1)
  const itemOptions = `<option value="" disabled${item ? '' : ' selected'}>Choose a ${kind === 'sigil' ? 'Sigil' : 'Wrightstone'}</option>${items.map((entry) => `<option value="${escapeHTML(entry.id)}"${entry.id === itemId ? ' selected' : ''}>${escapeHTML(itemLabel(kind, entry.hash))}</option>`).join('')}`
  const allTraits = INVENTORY_CATALOG.traits
  const secondaryTraits = kind === 'sigil' ? (item ? optionsForSigil(item) : []) : allTraits
  const secondaryDisabled = kind === 'sigil' && (!item || secondaryTraits.length === 0)
  const secondTraitLabel = kind === 'sigil' ? 'SECONDARY TRAIT' : 'ADDITIONAL TRAIT 1'
  const secondaryHash = item?.fixedSecondary ? item.secondaryTraitHashes[0] : String(draft.trait1Hash ?? '')
  const secondaryTrait = secondaryHash ? traitForHash(Number(secondaryHash)) : null
  const thirdTraitHash = String(draft.trait2Hash ?? '')
  const thirdTraitDefinition = thirdTraitHash ? traitForHash(Number(thirdTraitHash)) : null
  const primaryLevel = String(draft.trait0Level ?? '1')
  const secondaryLevel = String(draft.trait1Level ?? '')
  const secondaryLevelRequired = Boolean(item?.fixedSecondary && secondaryTraits.length)
  const thirdTrait = kind === 'wrightstone' ? `<div class="raw-lane">
    <label class="raw-field"><span>ADDITIONAL TRAIT 2</span><select data-role="trait-select" name="trait2Hash">${traitOptions(allTraits, true, String(draft.trait2Hash ?? ''))}</select></label>
    <label class="raw-field"><span>LEVEL 3</span><input name="trait2Level" type="number" min="1" max="${thirdTraitDefinition?.maxLevel ?? 50}" value="${escapeHTML(String(draft.trait2Level ?? ''))}" placeholder="Optional" /></label>
  </div>` : ''
  const extraTrait = kind === 'sigil'
    ? `<select data-role="sigil-secondary" name="trait1Hash" ${secondaryDisabled ? 'disabled' : ''}>${traitOptions(secondaryTraits, !item?.fixedSecondary, secondaryHash)}</select>`
    : `<select data-role="trait-select" name="trait1Hash">${traitOptions(allTraits, true, String(draft.trait1Hash ?? ''))}</select>`
  const additionalLane = `<div class="raw-lane">
    <label class="raw-field"><span>${secondTraitLabel}</span>${extraTrait}</label>
    <label class="raw-field"><span>LEVEL 2</span><input name="trait1Level" type="number" min="1" max="${secondaryTrait?.maxLevel ?? 50}" value="${escapeHTML(secondaryLevel)}" placeholder="Optional" ${secondaryDisabled ? 'disabled' : ''}${secondaryLevelRequired ? 'required' : ''} /></label>
  </div>`
  return `<form class="raw-add-form" data-kind="${kind}">
    <div class="raw-lane">
      <label class="raw-field"><span>${kind === 'sigil' ? 'SIGIL TYPE' : 'WRIGHTSTONE TYPE'} *</span><select data-role="catalog-item" name="catalogItemId" required>${itemOptions}</select></label>
      <label class="raw-field"><span>QUANTITY *</span><input name="quantity" type="number" min="1" max="${Math.max(1, remaining)}" value="${quantity}" ${disabled ? 'disabled' : 'required'} /></label>
    </div>
    ${kind === 'sigil' ? `<label class="raw-field"><span>SIGIL LEVEL *</span><input name="level" type="number" min="1" max="15" value="${escapeHTML(String(draft.level ?? '15'))}" required /></label>` : ''}
    <div class="raw-lane">
      <label class="raw-field"><span>PRIMARY TRAIT · <span data-role="primary-trait-name">${escapeHTML(primaryTrait?.name ?? 'Choose an item to see its primary trait')}</span></span><input name="trait0Hash" type="hidden" value="${primaryTrait?.hash ?? ''}" /></label>
      <label class="raw-field"><span>LEVEL 1 *</span><input data-role="primary-level" name="trait0Level" type="number" min="1" max="${primaryTrait?.maxLevel ?? 50}" value="${escapeHTML(primaryLevel)}" required /></label>
    </div>
    <div class="raw-lanes">${additionalLane}${thirdTrait}</div>
    <button class="primary-button raw-submit" type="submit" ${disabled ? 'disabled' : ''}>Add ${kind === 'sigil' ? 'Sigil' : 'Wrightstone'}</button>
  </form>`
}

function rememberCatalogForm(form) {
  const value = (name) => form.elements.namedItem(name)?.value ?? ''
  state.catalogDrafts[form.dataset.kind] = {
    catalogItemId: value('catalogItemId'),
    quantity: value('quantity'),
    level: value('level'),
    trait0Level: value('trait0Level'),
    trait1Hash: value('trait1Hash'),
    trait1Level: value('trait1Level'),
    trait2Hash: value('trait2Hash'),
    trait2Level: value('trait2Level'),
  }
}

function refreshCatalogForm(form) {
  const kind = form.dataset.kind
  const itemId = form.querySelector('[name="catalogItemId"]')?.value
  const item = (kind === 'sigil' ? sigilsById : wrightstonesById).get(itemId)
  if (!item) return
  const primary = primaryTraitFor(item)
  if (!primary) return
  form.querySelector('[name="trait0Hash"]').value = primary.hash
  form.querySelector('[data-role="primary-trait-name"]').textContent = traitLabel(Number(primary.hash))
  const primaryLevel = form.querySelector('[data-role="primary-level"]')
  primaryLevel.max = primary.maxLevel
  if (Number(primaryLevel.value) > primary.maxLevel) primaryLevel.value = primary.maxLevel
  if (kind !== 'sigil') {
    localizeDOM(form, state.language)
    return
  }

  const secondarySelect = form.querySelector('[data-role="sigil-secondary"]')
  const secondaryLevel = form.querySelector('[name="trait1Level"]')
  const selectedHash = secondarySelect.value
  const allowedTraits = optionsForSigil(item)
  secondarySelect.innerHTML = traitOptions(allowedTraits, !item.fixedSecondary, item.fixedSecondary ? item.secondaryTraitHashes[0] : '')
  secondarySelect.disabled = allowedTraits.length === 0
  if (item.fixedSecondary && allowedTraits.length) secondarySelect.value = item.secondaryTraitHashes[0]
  else if (allowedTraits.some((trait) => trait.hash === selectedHash)) secondarySelect.value = selectedHash
  else {
    secondarySelect.value = ''
    secondaryLevel.value = ''
  }
  secondaryLevel.disabled = allowedTraits.length === 0
  secondaryLevel.required = Boolean(item.fixedSecondary && allowedTraits.length)
  if (allowedTraits.length === 0) secondaryLevel.value = ''
  const secondaryTrait = traitForHash(Number(secondarySelect.value))
  if (secondaryTrait) {
    secondaryLevel.max = secondaryTrait.maxLevel
    if (Number(secondaryLevel.value) > secondaryTrait.maxLevel) secondaryLevel.value = secondaryTrait.maxLevel
  } else secondaryLevel.max = 50
  localizeDOM(form, state.language)
}

function updateTraitLevelLimit(select) {
  const levelInput = select.closest('.raw-lane')?.querySelector('input[type="number"]')
  if (!levelInput) return
  if (!select.value) {
    levelInput.value = ''
    return
  }
  const selected = select.selectedOptions[0]
  const maxLevel = Number(selected?.dataset.maxLevel) || 50
  levelInput.max = maxLevel
  if (Number(levelInput.value) > maxLevel) levelInput.value = maxLevel
}

function renderInventoryPanel() {
  const queued = state.inventoryAdds
  const removals = state.inventoryRemovals
  const quantityChanges = itemQuantityChanges()
  const queuedMarkup = queued.length || removals.length || quantityChanges.length ? `${queued.map((addition) => `<div class="queue-item">
    <span><strong>${escapeHTML(itemLabel(addition.kind, addition.hash))}</strong></span>
    <small>${addition.kind === 'sigil' ? `Lv ${addition.level}` : `${addition.lanes.filter((lane) => lane.hash !== 0x887ae0b0 && lane.hash !== 0).length} traits`}${addition.sourceUnitId ? ` · copied from ${addition.sourceUnitId}` : ' · catalog selection'}</small>
    <button class="queue-remove" data-action="remove-queued" data-draft-id="${addition.draftId}" type="button" aria-label="Remove queued item">×</button>
  </div>`).join('')}${removals.map((removal) => {
    const row = inventoryBucket(removal.kind).rows.find((entry) => entry.unitId === removal.unitId)
    return `<div class="queue-item is-removal">
      <span><strong>${escapeHTML(localizeText('Remove from bag', state.language))}: ${escapeHTML(itemLabel(removal.kind, row?.hash ?? 0))}</strong></span>
      <small>${escapeHTML(localizeText(removal.kind === 'sigil' ? 'Sigil' : 'Wrightstone', state.language))} · Unit ${removal.unitId}</small>
      <button class="queue-remove" data-action="restore-removal" data-kind="${removal.kind}" data-unit-id="${removal.unitId}" type="button" aria-label="Undo item removal">×</button>
    </div>`
  }).join('')}${quantityChanges.map((change) => {
    const row = state.parsed.inventory.items.rows.find((entry) => entry.unitId === change.unitId)
    return `<div class="queue-item is-quantity-change">
      <span><strong>${escapeHTML(materialItemLabel(row?.hash ?? 0))}</strong></span>
      <small>${escapeHTML(localizeText('Unit', state.language))} ${change.unitId} · ${escapeHTML(localizeText('Quantity', state.language))} ${Number(row?.quantity ?? 0).toLocaleString()} → ${Number(change.quantity).toLocaleString()}</small>
      <button class="queue-remove" data-action="clear-item-quantity" data-unit-id="${change.unitId}" type="button" aria-label="Undo item quantity change">×</button>
    </div>`
  }).join('')}` : `<p class="queue-empty">${escapeHTML(localizeText('No bag changes queued.', state.language))}</p>`
  const pendingCount = inventoryChangeCount()
  return `<section class="inventory-workspace">
    <div class="inventory-intro"><div><p class="eyebrow">BAG INVENTORY</p><h2>Edit bag items.</h2></div><p>Set quantities for stackable items, or add and remove Sigils and Wrightstones. The editor checks each changed record and the save checksum before download.</p></div>
    <div class="inventory-grid">${renderInventoryCategory('sigil')}${renderInventoryCategory('wrightstone')}${renderItemStacks()}</div>
    <section class="queue-panel"><div><p class="eyebrow">PENDING CHANGES</p><h3>${pendingCount} change${pendingCount === 1 ? '' : 's'} queued</h3></div><div class="queue-list">${queuedMarkup}</div></section>
  </section>`
}

function renderMasterPointsPanel() {
  const field = state.parsed.masterPoints
  const checksumValid = state.parsed.checksumValid
  const draft = state.masterPointsDraft ?? field.value
  const currentValue = field.value === null ? 'Unavailable' : field.value.toLocaleString(state.language === 'ja' ? 'ja-JP' : state.language === 'zh-CN' ? 'zh-CN' : state.language === 'zh-TW' ? 'zh-TW' : 'en-US')
  const changed = masterPointsChange() !== null
  const disabled = !field.editable || !checksumValid
  return `<section class="inventory-workspace mastery-points-workspace">
    <div class="inventory-intro"><div><p class="eyebrow">PROGRESSION</p><h2>Set your Mastery Points.</h2></div><p>Choose the balance to keep in your save. The editor verifies the value before downloading the edited copy.</p></div>
    <div class="mastery-points-card inventory-card">
      <div class="inventory-card-heading"><div><p class="eyebrow">PROFILE BALANCE</p><h3>Mastery Points</h3></div><div class="inventory-capacity"><span>CURRENT BALANCE</span><strong>${escapeHTML(currentValue)}</strong></div></div>
      <p class="inventory-help">Use a whole number from 0 to ${MAX_MASTER_POINTS.toLocaleString('en-US')}.</p>
      <form id="master-points-form" class="mastery-points-form">
        <label class="raw-field" for="master-points-input">NEW AMOUNT
          <input id="master-points-input" name="master-points" type="number" min="0" max="${MAX_MASTER_POINTS}" step="1" inputmode="numeric" value="${draft === null ? '' : escapeHTML(draft)}" ${disabled ? 'disabled' : ''} required />
        </label>
        <button class="primary-button raw-submit" type="submit" ${disabled ? 'disabled' : ''}>Apply amount</button>
      </form>
      ${changed ? `<p class="mastery-points-pending"><span>Pending amount</span><strong>${escapeHTML(Number(draft).toLocaleString(state.language === 'ja' ? 'ja-JP' : state.language === 'zh-CN' ? 'zh-CN' : state.language === 'zh-TW' ? 'zh-TW' : 'en-US'))}</strong></p>` : ''}
      ${!field.editable ? '<div class="alert alert-warning"><strong>Mastery Points are read-only in this save.</strong> The value field is missing, duplicated, or incomplete.</div>' : ''}
    </div>
  </section>`
}

function renderLoaded() {
  const { rows, count, emptyMessage } = characterList()
  const changes = (() => { try { return currentChanges() } catch { return [] } })()
  const character = selectedCharacter()
  const checksumValid = state.parsed.checksumValid
  const queued = inventoryChangeCount()
  const pointsChange = masterPointsChange()
  const unappliedItemQuantityCount = itemQuantityInputCount()
  const hasPending = changes.length > 0 || queued > 0 || pointsChange !== null || unappliedItemQuantityCount > 0
  const canDownload = hasPending && checksumValid && unappliedItemQuantityCount === 0
  const slotsMarkup = character ? character.slots.map((slot) => {
    const value = slotValue(slot)
    const stat = getStat(slot.draftHash)
    const level = levelFromBit(slot.draftLevelBit)
    const rawHash = slot.draftHash >>> 0
    const alias = stat && stat.hash !== stat.canonical
    return `<article class="slot-card${slotChanged(slot) ? ' is-changed' : ''}${!slot.editable ? ' is-disabled' : ''}">
      <div class="slot-heading">
        <span class="slot-index">${String(slot.index + 1).padStart(2, '0')}</span>
        <div class="slot-title"><span>OVERMASTERY SLOT</span><strong>${escapeHTML(value.title)}</strong></div>
        ${slotChanged(slot) ? '<span class="edited-chip">Edited</span>' : ''}
        ${slot.editable && !isEmptySlot(slot) ? `<span class="value-pill${stat ? '' : ' is-warning'}">${escapeHTML(value.detail)}</span>` : ''}
      </div>
      <div class="slot-controls">
        <label class="field-label">STAT
          <select data-role="stat" data-unit-id="${character.unitId}" data-slot-index="${slot.index}" ${slot.editable ? '' : 'disabled'}>
            ${statOptions(slot)}
          </select>
        </label>
        <label class="field-label level-field">LEVEL
          <select data-role="level" data-unit-id="${character.unitId}" data-slot-index="${slot.index}" ${(slot.editable && stat && !isEmptySlot(slot)) ? '' : 'disabled'}>
            ${levelOptions(slot)}
          </select>
        </label>
        <span class="level-preview">${stat && slot.draftLevelBit === 0x03ff ? 'Community raw preset · 0x03FF' : stat && level ? `LV ${level} · ${escapeHTML(formatStatValue(stat, level))}` : '<span>Choose a stat and level</span>'}</span>
        ${alias ? `<span class="stored-id" title="Existing compatibility hash">${hashToText(rawHash)}</span>` : ''}
      </div>
      ${slot.warnings.length ? `<div class="slot-warning"><span>!</span> ${slot.warnings.map((warning) => escapeHTML(localizeText(warning, state.language))).join(' ')}</div>` : ''}
      ${slot.editable && !isEmptySlot(slot) ? `<button class="clear-slot" type="button" data-action="clear-slot" data-unit-id="${character.unitId}" data-slot-index="${slot.index}">Clear slot</button>` : ''}
    </article>`
  }).join('') : ''

  const downloadLabel = canDownload
    ? `Download edited save <span>↓</span>`
    : !checksumValid
      ? 'Checksum needs review'
      : unappliedItemQuantityCount > 0
        ? 'Apply item amounts first'
        : 'No changes to download'
  return `<section class="workspace">
    <div class="file-banner">
      <div class="file-icon"><span></span><span></span></div>
      <div class="file-details"><small>LOADED SAVE</small><strong>${escapeHTML(state.fileName)}</strong><span>${formatBytes(state.bytes.byteLength)} <b>·</b> Save data v${state.parsed.version ?? '—'} <b>·</b> ${supportedCharacters().length} characters</span></div>
      <div class="checksum-state ${checksumValid ? 'is-good' : 'is-bad'}"><span class="state-dot"></span><span>${checksumValid ? 'Checksum verified' : 'Checksum mismatch'}</span><code>${checksumDisplay(new DataView(state.bytes.buffer), state.parsed)}</code></div>
      <button class="subtle-button" data-action="open-file" type="button">Open another</button>
    </div>
    ${!checksumValid ? '<div class="alert alert-danger"><strong>This save’s checksum does not match.</strong> Editing is disabled so the browser will not make a damaged file worse. Re-export a clean save and try again.</div>' : ''}
    <div class="tool-tabs" role="tablist" aria-label="Save editor tools">
      <button class="tool-tab${state.activeTab === 'overmastery' ? ' is-active' : ''}" role="tab" aria-selected="${state.activeTab === 'overmastery'}" data-action="switch-tab" data-tab="overmastery" type="button">Overmastery</button>
      <button class="tool-tab${state.activeTab === 'inventory' ? ' is-active' : ''}" role="tab" aria-selected="${state.activeTab === 'inventory'}" data-action="switch-tab" data-tab="inventory" type="button">Bag items <span>${queued}</span></button>
      <button class="tool-tab${state.activeTab === 'master-points' ? ' is-active' : ''}" role="tab" aria-selected="${state.activeTab === 'master-points'}" data-action="switch-tab" data-tab="master-points" type="button">Mastery Points${pointsChange !== null ? '<span>1</span>' : ''}</button>
    </div>
    ${state.activeTab === 'inventory' ? renderInventoryPanel() : state.activeTab === 'master-points' ? renderMasterPointsPanel() : `<div class="editor-layout">
      <aside class="character-panel">
        <div class="panel-heading"><div><p class="eyebrow">CHARACTER ROSTER</p><h2>Characters</h2></div><span class="count-badge">${count}</span></div>
        <label class="search-box"><span>⌕</span><input id="character-search" type="search" placeholder="Find a character" value="${escapeHTML(state.filter)}" autocomplete="off" /></label>
        <div class="character-list" id="character-list">${rows}<div class="empty-search" ${rows ? 'hidden' : ''}>${emptyMessage}</div></div>
        <div class="roster-foot"><span class="roster-symbol">◈</span> Select a character to edit their save slots.</div>
      </aside>
      <section class="edit-panel">
        ${character ? `<div class="edit-heading">
          <div><p class="eyebrow">SAVED CHARACTER <span class="eyebrow-divider">/</span> UNIT ${character.unitId}</p><h2>${escapeHTML(character.name)}</h2><p class="edit-subtitle">Set all four saved slots. The 0x03FF community preset is experimental.</p></div>
          <div class="character-seal">${escapeHTML(localizeCharacter(character.name, state.language).slice(0, 1).toUpperCase())}<span>GBFR</span></div>
        </div>
        <div class="slots-grid">${slotsMarkup}</div>
        ${!character.supported ? '<div class="alert alert-warning"><strong>This unit is not mapped as a playable character.</strong> Its saved overmastery slots are read-only.</div>' : character.slots.some((slot) => !slot.editable) ? '<div class="alert alert-warning"><strong>Some slots are read-only.</strong> One or more attribute/level pairs are missing or ambiguous in this save.</div>' : ''}
        ` : '<div class="no-character"><span class="no-character-icon">◈</span><h2>Select a character</h2><p>Choose a row from the roster to inspect its overmastery slots.</p></div>'}
      </section>
    </div>`}
    <div class="edit-footer workspace-footer">
      <div class="edit-feedback" aria-live="polite">${editFeedbackMarkup(changes, queued, pointsChange)}</div>
      <div class="edit-actions"><button class="subtle-button" data-action="reset" type="button" ${hasPending ? '' : 'disabled'}>Reset edits</button><button class="primary-button download-button" data-action="download" type="button" ${canDownload ? '' : 'disabled'}>${downloadLabel}</button></div>
    </div>
    <div class="workspace-note"><span>⟲</span> Export creates a new file. Keep your original save as a backup until the game loads the edited copy.</div>
  </section>`
}

function formatBytes(size) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(2)} MB`
}

function render({ itemListScrollTop = null } = {}) {
  const changes = (() => { try { return currentChanges() } catch { return [] } })()
  const languageOptions = LANGUAGE_OPTIONS.map(({ value, label }) => `<option value="${value}"${value === state.language ? ' selected' : ''}>${label}</option>`).join('')
  app.innerHTML = `<header class="topbar">
      <a class="brand" href="./" aria-label="Relink Save Workshop home"><span class="brand-mark"><i></i><i></i><i></i><i></i></span><span>RELINK <b>SAVE WORKSHOP</b></span></a>
      <div class="topbar-right"><select id="language-select" class="language-select" aria-label="Language">${languageOptions}</select><span class="local-badge"><span></span> LOCAL MODE</span><button class="top-open" data-action="open-file" type="button">${state.parsed ? 'Switch save' : 'Open save'} <span>↗</span></button></div>
    </header>
    <main>
      <div class="page-ribbon"><span>FIELD KIT <b>01</b></span><span>GRANBLUE FANTASY: RELINK</span><span class="ribbon-version">WEB EDITION <i></i></span></div>
      ${state.error ? `<div class="alert alert-danger load-error"><strong>${state.parsed ? 'Couldn’t apply this change.' : 'Couldn’t open this save.'}</strong> ${escapeHTML(state.error)} <button data-action="dismiss-error" type="button" aria-label="Dismiss">×</button></div>` : ''}
      ${state.parsed ? renderLoaded() : renderUpload()}
      <footer class="page-footer"><span>INDEPENDENT COMMUNITY TOOL · SAVE FILES NEVER LEAVE YOUR BROWSER</span><span>DESIGNED FOR KEYBOARD, MOUSE & TOUCH</span></footer>
    </main>
    <input id="save-file-input" type="file" accept=".dat,application/octet-stream" hidden />`
  localizeDOM(app, state.language)
  bindEvents()
  if (state.filter) applyFilter()
  if (itemListScrollTop !== null) {
    const itemList = app.querySelector('.stackable-items-card .inventory-list')
    if (itemList) itemList.scrollTop = itemListScrollTop
  }
}

function applyFilter() {
  const needle = state.filter.trim().toLowerCase()
  const buttons = app.querySelectorAll('.character-row')
  let visible = 0
  for (const button of buttons) {
    const matches = button.textContent.toLowerCase().includes(needle)
    button.hidden = !matches
    if (matches) visible += 1
  }
  const empty = app.querySelector('.empty-search')
  if (empty) empty.hidden = visible > 0
  const badge = app.querySelector('.count-badge')
  if (badge) badge.textContent = visible
}

function bindEvents() {
  const input = app.querySelector('#save-file-input')
  app.querySelector('#language-select')?.addEventListener('change', (event) => {
    state.language = normalizeLanguage(event.currentTarget.value)
    saveLanguage(state.language)
    render()
  })
  app.querySelector('#master-points-form')?.addEventListener('submit', applyMasterPoints)
  input?.addEventListener('change', async () => {
    const file = input.files?.[0]
    if (file) await loadFile(file)
  }, { once: true })

  const dropzone = app.querySelector('#dropzone')
  if (dropzone) {
    dropzone.addEventListener('click', () => input?.click())
    dropzone.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input?.click() }
    })
    dropzone.addEventListener('dragover', (event) => { event.preventDefault(); dropzone.classList.add('is-dragging') })
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragging'))
    dropzone.addEventListener('drop', async (event) => {
      event.preventDefault()
      dropzone.classList.remove('is-dragging')
      const file = event.dataTransfer?.files?.[0]
      if (file) await loadFile(file)
    })
  }

  app.querySelector('#character-search')?.addEventListener('input', (event) => {
    state.filter = event.target.value
    applyFilter()
  })

  app.querySelectorAll('[data-role="inventory-search"]').forEach((inputElement) => {
    inputElement.addEventListener('input', (event) => {
      const kind = event.currentTarget.dataset.kind
      state.inventoryFilter[kind] = event.currentTarget.value
      if (kind === 'items') state.itemListLimit = ITEM_LIST_PAGE_SIZE
      const caret = event.currentTarget.selectionStart
      render()
      const replacement = app.querySelector(`[data-role="inventory-search"][data-kind="${kind}"]`)
      replacement?.focus({ preventScroll: true })
      replacement?.setSelectionRange(caret, caret)
    })
  })

  app.querySelectorAll('[data-role="item-quantity-form"]').forEach((form) => {
    form.addEventListener('submit', (event) => applyItemQuantity(event, form))
  })
  app.querySelectorAll('[data-role="item-quantity-input"]').forEach((quantityInput) => {
    quantityInput.addEventListener('input', (event) => {
      const form = event.currentTarget.closest('[data-role="item-quantity-form"]')
      const unitId = Number(form?.dataset.unitId)
      if (!Number.isSafeInteger(unitId)) return
      const row = state.parsed.inventory.items.rows.find((entry) => entry.unitId === unitId)
      const currentQuantity = Object.hasOwn(state.itemQuantityDrafts, unitId)
        ? state.itemQuantityDrafts[unitId]
        : row?.quantity
      const value = event.currentTarget.value
      const drafts = { ...state.itemQuantityInputDrafts }
      if (value === String(currentQuantity)) delete drafts[unitId]
      else drafts[unitId] = value
      state.itemQuantityInputDrafts = drafts
      const status = form.closest('.inventory-row')?.querySelector('[data-role="item-quantity-input-status"]')
      if (status) {
        if (Object.hasOwn(drafts, unitId)) {
          status.textContent = `${localizeText('Ready to apply', state.language)} ${value || '—'}`
          status.hidden = false
        } else if (Object.hasOwn(state.itemQuantityDrafts, unitId)) {
          const locale = state.language === 'ja' ? 'ja-JP' : state.language === 'zh-CN' ? 'zh-CN' : state.language === 'zh-TW' ? 'zh-TW' : 'en-US'
          status.textContent = `${localizeText('New amount', state.language)} ${Number(state.itemQuantityDrafts[unitId]).toLocaleString(locale)}`
          status.hidden = false
        } else {
          status.textContent = ''
          status.hidden = true
        }
      }
      state.error = ''
      state.notice = ''
      app.querySelector('.load-error')?.remove()
      updateItemQuantityBatchControls()
      const feedback = app.querySelector('.edit-feedback')
      if (feedback) {
        feedback.innerHTML = editFeedbackMarkup(currentChanges(), inventoryChangeCount(), masterPointsChange())
        localizeDOM(feedback, state.language)
      }
    })
  })

  app.querySelectorAll('.raw-add-form').forEach((form) => {
    form.addEventListener('submit', (event) => queueCatalogInventoryItem(event, form))
    form.querySelector('[data-role="catalog-item"]')?.addEventListener('change', () => refreshCatalogForm(form))
    form.querySelectorAll('[data-role="trait-select"]').forEach((select) => {
      select.addEventListener('change', () => updateTraitLevelLimit(select))
    })
    form.querySelector('[data-role="sigil-secondary"]')?.addEventListener('change', (event) => updateTraitLevelLimit(event.currentTarget))
    form.addEventListener('input', () => rememberCatalogForm(form))
    form.addEventListener('change', () => rememberCatalogForm(form))
  })

  app.querySelectorAll('[data-action]').forEach((element) => {
    element.addEventListener('click', async (event) => {
      const action = event.currentTarget.dataset.action
      if (action === 'open-file') input?.click()
      if (action === 'dismiss-error') { state.error = ''; render() }
      if (action === 'select-character') { state.selectedUnitId = Number(event.currentTarget.dataset.unitId); state.notice = ''; render() }
      if (action === 'switch-tab') { state.activeTab = event.currentTarget.dataset.tab; state.error = ''; render() }
      if (action === 'show-more-items') {
        const itemListScrollTop = app.querySelector('.stackable-items-card .inventory-list')?.scrollTop ?? 0
        state.itemListLimit += ITEM_LIST_PAGE_SIZE
        render({ itemListScrollTop })
      }
      if (action === 'apply-all-item-quantities') applyAllItemQuantities()
      if (action === 'queue-copy') queueInventoryCopy(event.currentTarget.dataset.kind, Number(event.currentTarget.dataset.unitId))
      if (action === 'queue-removal') queueInventoryRemoval(event.currentTarget.dataset.kind, Number(event.currentTarget.dataset.unitId))
      if (action === 'restore-removal') restoreInventoryRemoval(event.currentTarget.dataset.kind, Number(event.currentTarget.dataset.unitId))
      if (action === 'remove-queued') removeQueuedAddition(Number(event.currentTarget.dataset.draftId))
      if (action === 'clear-item-quantity') {
        const unitId = Number(event.currentTarget.dataset.unitId)
        state.itemQuantityDrafts = Object.fromEntries(Object.entries(state.itemQuantityDrafts).filter(([key]) => Number(key) !== unitId))
        state.itemQuantityInputDrafts = Object.fromEntries(Object.entries(state.itemQuantityInputDrafts).filter(([key]) => Number(key) !== unitId))
        state.error = ''
        state.notice = ''
        render()
      }
      if (action === 'reset') resetEdits()
      if (action === 'clear-slot') clearSlot(Number(event.currentTarget.dataset.unitId), Number(event.currentTarget.dataset.slotIndex))
      if (action === 'download') downloadEditedSave()
    })
  })

  app.querySelectorAll('[data-role="stat"]').forEach((select) => {
    select.addEventListener('change', (event) => updateStat(
      Number(event.currentTarget.dataset.unitId),
      Number(event.currentTarget.dataset.slotIndex),
      event.currentTarget.value,
    ))
  })
  app.querySelectorAll('[data-role="level"]').forEach((select) => {
    select.addEventListener('change', (event) => updateLevel(
      Number(event.currentTarget.dataset.unitId),
      Number(event.currentTarget.dataset.slotIndex),
      event.currentTarget.value,
    ))
  })
}

function findSlot(unitId, slotIndex) {
  const character = state.parsed?.characters.find((entry) => entry.unitId === unitId)
  return character?.slots[slotIndex] ?? null
}

function updateStat(unitId, slotIndex, value) {
  const slot = findSlot(unitId, slotIndex)
  if (!slot || !slot.editable) return
  if (value.startsWith('raw:')) return
  if (value === '') {
    slot.draftHash = 0x887ae0b0
    slot.draftLevelBit = 0
  } else {
    const nextHash = Number.parseInt(value, 16) >>> 0
    slot.draftHash = nextHash
    if (!hasValidLevel(slot.draftLevelBit)) slot.draftLevelBit = 1
  }
  state.notice = ''
  render()
}

function updateLevel(unitId, slotIndex, value) {
  const slot = findSlot(unitId, slotIndex)
  if (!slot || !slot.editable || value === '' || value === '__stored__') return
  if (value === 'community-raw') {
    slot.draftLevelBit = 0x03ff
    state.notice = ''
    render()
    return
  }
  const level = Number(value)
  if (Number.isInteger(level) && level >= 1 && level <= 10) {
    slot.draftLevelBit = 1 << (level - 1)
    state.notice = ''
    render()
  }
}

function clearSlot(unitId, slotIndex) {
  const slot = findSlot(unitId, slotIndex)
  if (!slot || !slot.editable) return
  slot.draftHash = 0x887ae0b0
  slot.draftLevelBit = 0
  state.notice = ''
  render()
}

function queueInventoryCopy(kind, unitId) {
  const bucket = inventoryBucket(kind)
  const row = bucket.rows.find((entry) => entry.unitId === unitId)
  if (!row?.cloneable) return
  if (!state.parsed.checksumValid) return
  if (inventorySlotsAfterQueue(kind) <= 0) {
    state.error = `There are no reusable empty ${kind === 'sigil' ? 'Sigil' : 'Wrightstone'} slots left.`
    render()
    return
  }
  state.error = ''
  state.notice = ''
  state.inventoryAdds.push({
    draftId: state.nextDraftId++,
    kind,
    hash: row.hash,
    itemName: itemLabel(kind, row.hash),
    level: row.level,
    lanes: row.lanes.map(({ hash, level }) => ({ hash, level })),
    sourceUnitId: unitId,
  })
  render()
}

function queueInventoryRemoval(kind, unitId) {
  const bucket = inventoryBucket(kind)
  const row = bucket.rows.find((entry) => entry.unitId === unitId)
  if (!state.parsed.checksumValid || !canDeleteInventoryRow(kind, row) || isRemovalQueued(kind, unitId)) return
  state.inventoryRemovals.push({ kind, unitId })
  state.error = ''
  state.notice = ''
  render()
}

function restoreInventoryRemoval(kind, unitId) {
  state.inventoryRemovals = state.inventoryRemovals.filter((removal) => removal.kind !== kind || removal.unitId !== unitId)
  state.error = ''
  state.notice = ''
  render()
}

function queueCatalogInventoryItem(event, form) {
  event.preventDefault()
  rememberCatalogForm(form)
  const kind = form.dataset.kind
  const data = new FormData(form)
  try {
    const itemId = String(data.get('catalogItemId') ?? '')
    const item = (kind === 'sigil' ? sigilsById : wrightstonesById).get(itemId)
    if (!item) throw new Error('Choose an item from the catalog.')
    const quantity = Number(data.get('quantity'))
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Quantity must be a positive whole number.')
    const remaining = inventorySlotsAfterQueue(kind)
    if (quantity > remaining) throw new Error(`Only ${Math.max(0, remaining)} empty ${kind === 'sigil' ? 'Sigil' : 'Wrightstone'} slots remain.`)
    const primaryTrait = primaryTraitFor(item)
    if (!primaryTrait) throw new Error('The selected item has no recognized primary trait.')
    const secondaryHash = data.get('trait1Hash')
    if (kind === 'sigil' && secondaryHash && !optionsForSigil(item).some((trait) => trait.hash === secondaryHash)) {
      throw new Error('Choose a secondary trait available for the selected Sigil.')
    }
    if (kind === 'sigil' && item.fixedSecondary && secondaryHash !== item.secondaryTraitHashes[0]) {
      throw new Error('This Sigil requires its fixed secondary trait.')
    }
    const lanes = Array.from({ length: kind === 'sigil' ? 2 : 3 }, (_, index) => ({
      hash: index === 0 ? primaryTrait.hash : data.get(`trait${index}Hash`),
      level: data.get(`trait${index}Level`),
    }))
    const addition = validateCustomInventoryAddition(kind, {
      hash: item.hash,
      level: data.get('level'),
      lanes,
    })
    if (inventoryBucket(kind).maxCount.ambiguous || inventoryBucket(kind).serialAmbiguous) throw new Error(`The ${kind} slot counter or serial records are ambiguous, so this save cannot be edited safely.`)
    for (let index = 0; index < quantity; index += 1) {
      state.inventoryAdds.push({
        ...addition,
        draftId: state.nextDraftId++,
        catalogItemId: item.id,
        itemName: itemLabel(kind, item.hash),
        lanes: addition.lanes.map((lane) => ({ ...lane })),
      })
    }
    state.activeTab = 'inventory'
    state.openRawKind = kind
    state.error = ''
    state.notice = ''
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
    state.activeTab = 'inventory'
    state.openRawKind = kind
  }
  render()
}

function removeQueuedAddition(draftId) {
  state.inventoryAdds = state.inventoryAdds.filter((addition) => addition.draftId !== draftId)
  state.error = ''
  state.notice = ''
  render()
}

function applyItemQuantity(event, form) {
  event.preventDefault()
  const unitId = Number(form.dataset.unitId)
  const text = form.querySelector('[data-role="item-quantity-input"]')?.value.trim() ?? ''
  commitItemQuantityValues([[unitId, text]])
}

function applyAllItemQuantities() {
  commitItemQuantityValues(Object.entries(state.itemQuantityInputDrafts))
}

function commitItemQuantityValues(values) {
  const itemListScrollTop = app.querySelector('.stackable-items-card .inventory-list')?.scrollTop ?? 0
  try {
    if (values.length === 0) return
    if (!state.parsed?.checksumValid) throw new Error('The input save checksum is invalid; editing is disabled for safety.')
    const validated = values.map(([unitIdText, textValue]) => {
      const unitId = Number(unitIdText)
      const row = state.parsed.inventory.items.rows.find((entry) => entry.unitId === unitId)
      if (!row?.active || !row.editable) throw new Error('This bag item quantity cannot be safely changed.')
      const text = String(textValue).trim()
      if (!/^\d+$/.test(text)) {
        throw new Error(`Item quantity must be a whole number from 0 to ${MAX_ITEM_QUANTITY.toLocaleString('en-US')}.`)
      }
      const quantity = Number(text)
      if (!Number.isSafeInteger(quantity) || quantity > MAX_ITEM_QUANTITY) {
        throw new Error(`Item quantity must be a whole number from 0 to ${MAX_ITEM_QUANTITY.toLocaleString('en-US')}.`)
      }
      return { unitId, row, quantity }
    })
    const drafts = { ...state.itemQuantityDrafts }
    let changed = false
    for (const { unitId, row, quantity } of validated) {
      const previousQuantity = Object.hasOwn(drafts, unitId) ? drafts[unitId] : row.quantity
      if (quantity === row.quantity) delete drafts[unitId]
      else drafts[unitId] = quantity
      if (quantity !== previousQuantity) changed = true
    }
    state.itemQuantityDrafts = drafts
    const inputDrafts = { ...state.itemQuantityInputDrafts }
    for (const { unitId } of validated) delete inputDrafts[unitId]
    state.itemQuantityInputDrafts = inputDrafts
    state.error = ''
    const singular = validated.length === 1
    state.notice = changed
      ? singular ? 'Item amount applied.' : 'Item amounts applied.'
      : singular ? 'Item amount unchanged.' : 'Item amounts unchanged.'
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
    state.notice = ''
  }
  render({ itemListScrollTop })
}

function resetEdits() {
  for (const character of state.parsed.characters) {
    for (const slot of character.slots) {
      slot.draftHash = slot.originalHash
      slot.draftLevelBit = slot.originalLevelBit
    }
  }
  state.inventoryAdds = []
  state.inventoryRemovals = []
  state.itemQuantityDrafts = {}
  state.itemQuantityInputDrafts = {}
  state.masterPointsDraft = null
  state.error = ''
  state.notice = 'All edits reset.'
  render()
}

async function loadFile(file) {
  state.error = ''
  state.notice = ''
  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const parsed = parseSave(bytes)
    state.fileName = file.name
    state.bytes = bytes
    state.parsed = parsed
    state.masterPointsDraft = null
    state.itemQuantityDrafts = {}
    state.itemQuantityInputDrafts = {}
    state.selectedUnitId = parsed.characters.find((character) => character.supported)?.unitId ?? null
    state.filter = ''
    state.activeTab = 'overmastery'
    state.inventoryAdds = []
    state.inventoryRemovals = []
    state.catalogDrafts = { sigil: null, wrightstone: null }
    state.inventoryFilter = { sigil: '', wrightstone: '', items: '' }
    state.itemListLimit = ITEM_LIST_PAGE_SIZE
    state.openRawKind = ''
    if (!parsed.checksumValid) state.notice = ''
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
    state.fileName = ''
    state.bytes = null
    state.parsed = null
    state.masterPointsDraft = null
    state.itemQuantityDrafts = {}
    state.itemQuantityInputDrafts = {}
    state.selectedUnitId = null
    state.inventoryAdds = []
    state.inventoryRemovals = []
  }
  render()
}

function applyMasterPoints(event) {
  event.preventDefault()
  try {
    const field = state.parsed?.masterPoints
    if (!field?.editable) throw new Error('The Mastery Points field is missing or ambiguous in this save.')
    if (!state.parsed.checksumValid) throw new Error('The input save checksum is invalid; editing is disabled for safety.')
    const text = app.querySelector('#master-points-input')?.value.trim() ?? ''
    if (!/^\d+$/.test(text)) throw new Error(`Mastery Points must be a whole number from 0 to ${MAX_MASTER_POINTS.toLocaleString('en-US')}.`)
    const value = Number(text)
    if (!Number.isSafeInteger(value)) throw new Error('Mastery Points amount is too large.')
    if (value !== field.value && (value < 0 || value > MAX_MASTER_POINTS)) {
      throw new Error(`Mastery Points must be a whole number from 0 to ${MAX_MASTER_POINTS.toLocaleString('en-US')}.`)
    }
    state.masterPointsDraft = value === field.value ? null : value
    state.error = ''
    state.notice = state.masterPointsDraft === null ? 'Mastery Points amount unchanged.' : 'Mastery Points change queued.'
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
    state.notice = ''
  }
  render()
}

function downloadEditedSave() {
  try {
    const changes = currentChanges()
    const pointsChange = masterPointsChange()
    const quantityChanges = itemQuantityChanges()
    const output = createEditedSave(state.bytes, state.parsed, changes, state.inventoryAdds, state.inventoryRemovals, pointsChange, quantityChanges)
    const blob = new Blob([output], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const baseName = state.fileName.replace(/\.[^.]+$/, '') || 'SaveData'
    link.href = url
    link.download = `${baseName}-edited.dat`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    const additionCount = state.inventoryAdds.length
    const removalCount = state.inventoryRemovals.length
    const itemQuantityCount = quantityChanges.length
    const overmasteryCount = changes.length
    const masterPointsCount = pointsChange === null ? 0 : 1
    state.notice = `Downloaded ${link.download}; checksum, ${overmasteryCount} overmastery edits, ${additionCount} bag additions, ${removalCount} bag removals, ${itemQuantityCount} item quantity edits, and ${masterPointsCount} Mastery Points edits verified.`
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
    state.notice = ''
  }
  render()
}

render()

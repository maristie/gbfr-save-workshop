import {
  OVERMASTERY_STATS,
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
} from './save-format.js'

const app = document.querySelector('#app')
const state = {
  fileName: '',
  bytes: null,
  parsed: null,
  selectedUnitId: null,
  error: '',
  notice: '',
  filter: '',
}

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]))

function selectedCharacter() {
  return state.parsed?.characters.find((character) => character.unitId === state.selectedUnitId) ?? null
}

function currentChanges() {
  if (!state.parsed) return []
  return changesForSave(state.parsed.characters)
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
      const suffix = stat.hash === stat.canonical ? 'Standard' : `Compatibility ID · ${hashToText(stat.hash)}`
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
  const rawOption = `<option value="community-raw"${communityRaw ? ' selected' : ''}>Community raw preset · 0x03FF</option>`
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
  const characters = state.parsed?.characters ?? []
  const filtered = characters.filter((character) => `${character.name} ${character.hashText}`.toLowerCase().includes(state.filter.toLowerCase()))
  const rows = filtered.map((character) => {
    const available = character.slots.filter((slot) => slot.editable).length
    const filled = character.slots.filter((slot) => slot.editable && !isEmptySlot(slot)).length
    const selected = character.unitId === state.selectedUnitId
    const changed = character.slots.some(slotChanged)
    return `<button class="character-row${selected ? ' is-selected' : ''}" type="button" data-action="select-character" data-unit-id="${character.unitId}" aria-pressed="${selected}">
      <span class="character-mark">${escapeHTML(character.name.slice(0, 1).toUpperCase())}</span>
      <span class="character-copy"><strong>${escapeHTML(character.name)}</strong><small>${character.hashText} · ${filled}/${available} filled</small></span>
      ${changed ? '<span class="change-dot" aria-label="Edited"></span>' : ''}
      <span class="row-chevron" aria-hidden="true">›</span>
    </button>`
  }).join('')
  return { rows, count: filtered.length }
}

function renderUpload() {
  return `<section class="welcome-grid">
    <div class="welcome-copy">
      <p class="eyebrow"><span class="pulse-dot"></span> SAVE FILE EDITOR <span class="eyebrow-divider">/</span> OVERMASTERY</p>
      <h1>Shape your four overmastery slots.</h1>
      <p class="welcome-text">Read a Relink save, adjust any character’s overmastery stats, then download a verified copy. No game connection or desktop install needed.</p>
      <div class="trust-points">
        <span><i>01</i> Files stay on this device</span>
        <span><i>02</i> Original save stays untouched</span>
        <span><i>03</i> Browser-based on desktop or mobile</span>
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

function renderLoaded() {
  const { rows, count } = characterList()
  const changes = (() => { try { return currentChanges() } catch { return [] } })()
  const character = selectedCharacter()
  const checksumValid = state.parsed.checksumValid
  const canDownload = changes.length > 0 && checksumValid
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
      ${slot.warnings.length ? `<div class="slot-warning"><span>!</span> ${slot.warnings.map(escapeHTML).join(' ')}</div>` : ''}
      ${slot.editable && !isEmptySlot(slot) ? `<button class="clear-slot" type="button" data-action="clear-slot" data-unit-id="${character.unitId}" data-slot-index="${slot.index}">Clear slot</button>` : ''}
    </article>`
  }).join('') : ''

  const downloadLabel = canDownload ? `Download edited save <span>↓</span>` : checksumValid ? 'No changes to download' : 'Checksum needs review'
  return `<section class="workspace">
    <div class="file-banner">
      <div class="file-icon"><span></span><span></span></div>
      <div class="file-details"><small>LOADED SAVE</small><strong>${escapeHTML(state.fileName)}</strong><span>${formatBytes(state.bytes.byteLength)} <b>·</b> Save data v${state.parsed.version ?? '—'} <b>·</b> ${state.parsed.characters.length} characters</span></div>
      <div class="checksum-state ${checksumValid ? 'is-good' : 'is-bad'}"><span class="state-dot"></span><span>${checksumValid ? 'Checksum verified' : 'Checksum mismatch'}</span><code>${checksumDisplay(new DataView(state.bytes.buffer), state.parsed)}</code></div>
      <button class="subtle-button" data-action="open-file" type="button">Open another</button>
    </div>
    ${!checksumValid ? '<div class="alert alert-danger"><strong>This save’s checksum does not match.</strong> Editing is disabled so the browser will not make a damaged file worse. Re-export a clean save and try again.</div>' : ''}
    <div class="editor-layout">
      <aside class="character-panel">
        <div class="panel-heading"><div><p class="eyebrow">CHARACTER ROSTER</p><h2>Characters</h2></div><span class="count-badge">${count}</span></div>
        <label class="search-box"><span>⌕</span><input id="character-search" type="search" placeholder="Find a character" value="${escapeHTML(state.filter)}" autocomplete="off" /></label>
        <div class="character-list" id="character-list">${rows}<div class="empty-search" ${rows ? 'hidden' : ''}>No matching characters.</div></div>
        <div class="roster-foot"><span class="roster-symbol">◈</span> Select a character to edit their save slots.</div>
      </aside>
      <section class="edit-panel">
        ${character ? `<div class="edit-heading">
          <div><p class="eyebrow">SAVED CHARACTER <span class="eyebrow-divider">/</span> UNIT ${character.unitId}</p><h2>${escapeHTML(character.name)}</h2><p class="edit-subtitle">Set all four saved slots. The 0x03FF community preset is experimental.</p></div>
          <div class="character-seal">${escapeHTML(character.name.slice(0, 1).toUpperCase())}<span>GBFR</span></div>
        </div>
        <div class="slots-grid">${slotsMarkup}</div>
        <div class="edit-footer">
          <div class="edit-feedback" aria-live="polite">${state.notice ? `<span class="feedback-check">✓</span>${escapeHTML(state.notice)}` : `<span class="feedback-dot"></span>${changes.length ? `${changes.length} slot${changes.length === 1 ? '' : 's'} changed` : 'No unsaved changes'}`}</div>
          <div class="edit-actions"><button class="subtle-button" data-action="reset" type="button" ${changes.length ? '' : 'disabled'}>Reset edits</button><button class="primary-button download-button" data-action="download" type="button" ${canDownload ? '' : 'disabled'}>${downloadLabel}</button></div>
        </div>
        ${!character.supported ? '<div class="alert alert-warning"><strong>This unit is not mapped as a playable character.</strong> Its saved overmastery slots are read-only.</div>' : character.slots.some((slot) => !slot.editable) ? '<div class="alert alert-warning"><strong>Some slots are read-only.</strong> One or more attribute/level pairs are missing or ambiguous in this save.</div>' : ''}
        ` : '<div class="no-character"><span class="no-character-icon">◈</span><h2>Select a character</h2><p>Choose a row from the roster to inspect its overmastery slots.</p></div>'}
      </section>
    </div>
    <div class="workspace-note"><span>⟲</span> Export creates a new file. Keep your original save as a backup until the game loads the edited copy.</div>
  </section>`
}

function formatBytes(size) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(2)} MB`
}

function render() {
  const changes = (() => { try { return currentChanges() } catch { return [] } })()
  app.innerHTML = `<header class="topbar">
      <a class="brand" href="./" aria-label="Relink Save Workshop home"><span class="brand-mark"><i></i><i></i><i></i><i></i></span><span>RELINK <b>SAVE WORKSHOP</b></span></a>
      <div class="topbar-right"><span class="local-badge"><span></span> LOCAL MODE</span><button class="top-open" data-action="open-file" type="button">${state.parsed ? 'Switch save' : 'Open save'} <span>↗</span></button></div>
    </header>
    <main>
      <div class="page-ribbon"><span>FIELD KIT <b>01</b></span><span>GRANBLUE FANTASY: RELINK</span><span class="ribbon-version">WEB EDITION <i></i></span></div>
      ${state.error ? `<div class="alert alert-danger load-error"><strong>Couldn’t open this save.</strong> ${escapeHTML(state.error)} <button data-action="dismiss-error" type="button" aria-label="Dismiss">×</button></div>` : ''}
      ${state.parsed ? renderLoaded() : renderUpload()}
      <footer class="page-footer"><span>INDEPENDENT COMMUNITY TOOL · SAVE FILES NEVER LEAVE YOUR BROWSER</span><span>DESIGNED FOR KEYBOARD, MOUSE & TOUCH</span></footer>
    </main>
    <input id="save-file-input" type="file" accept=".dat,application/octet-stream" hidden />`
  bindEvents()
  if (state.filter) applyFilter()
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

  app.querySelectorAll('[data-action]').forEach((element) => {
    element.addEventListener('click', async (event) => {
      const action = event.currentTarget.dataset.action
      if (action === 'open-file') input?.click()
      if (action === 'dismiss-error') { state.error = ''; render() }
      if (action === 'select-character') { state.selectedUnitId = Number(event.currentTarget.dataset.unitId); state.notice = ''; render() }
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

function resetEdits() {
  for (const character of state.parsed.characters) {
    for (const slot of character.slots) {
      slot.draftHash = slot.originalHash
      slot.draftLevelBit = slot.originalLevelBit
    }
  }
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
    state.selectedUnitId = parsed.characters[0]?.unitId ?? null
    state.filter = ''
    if (!parsed.checksumValid) state.notice = ''
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
    state.fileName = ''
    state.bytes = null
    state.parsed = null
    state.selectedUnitId = null
  }
  render()
}

function downloadEditedSave() {
  try {
    const changes = currentChanges()
    const output = createEditedSave(state.bytes, state.parsed, changes)
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
    state.notice = `Downloaded ${link.download}; checksum and changed slots verified.`
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
    state.notice = ''
  }
  render()
}

render()

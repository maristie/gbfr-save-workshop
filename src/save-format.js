const EMPTY_HASH = 0x887ae0b0
const HASH_SEED_ID_TYPE = 1003
const CHARACTER_ID_TYPE = 1301
const OVERMASTERY_ATTRIBUTE_ID_TYPE = 1606
const OVERMASTERY_LEVEL_ID_TYPE = 1607
const FIRST_CHARACTER_UNIT_ID = 10000
const LAST_CHARACTER_UNIT_ID = 20000
const SLOT_BASE = 10000000
const SLOT_STEP = 1000
const SLOT_COUNT = 4
const COMMUNITY_RAW_OVERRIDE = 0x03ff
const HASH_SEED = 0x2f1a43ebcdn
const HASH_SECTIONS = [
  [0x58, 0x80], [0x30, 0xa0], [0x28, 0x30], [0x38, 0xc0], [0x40, 0xb0],
  [0x68, 0x50], [0x48, 0x60], [0x70, 0x90], [0x50, 0x40], [0x60, 0x70],
]

const U64_MASK = (1n << 64n) - 1n
const PRIME1 = 11400714785074694791n
const PRIME2 = 14029467366897019727n
const PRIME3 = 1609587929392839161n
const PRIME4 = 9650029242287828579n
const PRIME5 = 2870177450012600261n

const pctCurve = [1, 1, 2, 4, 6, 8, 10, 12, 16, 20]
const attackCurve = [100, 100, 200, 300, 400, 500, 600, 700, 800, 1000]
const hpCurve = [100, 200, 400, 500, 600, 800, 1000, 1200, 1600, 2000]
const stunCurve = [0.1, 0.1, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.6, 2]

// The aliases are save-file hashes already recognized by the reference tool.
// New selections use the canonical hash; an existing alias is kept until the
// user changes that slot.
export const OVERMASTERY_STATS = [
  { hash: 0xc4925bd7, canonical: 0xc4925bd7, name: 'Attack', values: attackCurve, unit: 'flat', aliases: [0xcb63be55, 0xdcbd8423, 0x59dce1e8, 0xf203bb15] },
  { hash: 0x52a207b5, canonical: 0x52a207b5, name: 'HP', values: hpCurve, unit: 'flat', aliases: [0x57bbc478, 0x5a51f0cb, 0x9c6375cf, 0xf004e9f2] },
  { hash: 0x45c65767, canonical: 0x45c65767, name: 'Critical Hit Rate', values: pctCurve, unit: 'pct', aliases: [0xc4b86ed7, 0xceb0dbd2] },
  { hash: 0x6cb38ef3, canonical: 0x6cb38ef3, name: 'Stun Power', values: stunCurve, unit: 'flat', aliases: [0xa3545ca1, 0x59fbb7d8] },
  { hash: 0x9a97c049, canonical: 0x9a97c049, name: 'Skill Damage', values: pctCurve, unit: 'pct', aliases: [] },
  { hash: 0x4e42646b, canonical: 0x4e42646b, name: 'Skybound Art Damage', values: pctCurve, unit: 'pct', aliases: [] },
  { hash: 0x68b39018, canonical: 0x68b39018, name: 'Chain Burst Damage', values: pctCurve, unit: 'pct', aliases: [] },
  { hash: 0x43b7581d, canonical: 0x43b7581d, name: 'Normal Attack Damage Cap', values: pctCurve, unit: 'pct', aliases: [] },
  { hash: 0x9c555433, canonical: 0x9c555433, name: 'Skill Damage Cap', values: pctCurve, unit: 'pct', aliases: [] },
  { hash: 0x4a4c093d, canonical: 0x4a4c093d, name: 'Skybound Art Damage Cap', values: pctCurve, unit: 'pct', aliases: [] },
  { hash: 0x54929589, canonical: 0x54929589, name: 'Healing Cap', values: pctCurve, unit: 'pct', aliases: [] },
].flatMap((stat) => [stat, ...stat.aliases.map((hash) => ({ ...stat, hash }))])

const statByHash = new Map(OVERMASTERY_STATS.map((stat) => [stat.hash, stat]))

const characterNames = new Map([
  [0x2a26b1b2, 'Gran'], [0xa4acba76, 'Djeeta'], [0x18e2f9f9, 'Katalina'],
  [0x079df0cc, 'Rackam'], [0x4d0a60c3, 'Io'], [0xdd7a151e, 'Eugen'],
  [0xc8616284, 'Rosetta'], [0x978e4b18, 'Ghandagoza'], [0xc3ffd418, 'Ferry'],
  [0x22e437e5, 'Lancelot'], [0x2ebe91d5, 'Vane'], [0xbdef7181, 'Percival'],
  [0x627bcb0d, 'Siegfried'], [0xfd3be362, 'Charlotta'], [0xbad16e3b, 'Tweyen'],
  [0xfc6cdf7b, 'Yodarha'], [0xe7053919, 'Narmaya'], [0x1bb37ef0, 'Gallanza'],
  [0x0d21b430, 'Zeta'], [0xa3a3cb2f, 'Id'], [0xf0eb77ef, 'Vaseraga'],
  [0xaa66178a, 'Cagliostro'], [0x718e1a14, 'Sandalphon'], [0x296471be, 'Seofon'],
  [0x74dd4c79, 'Fediel'], [0x9a8af295, 'Beatrix'], [0x25d46f4b, 'Maglielle'],
  [0x9b15cfb1, 'Eustace'], [0x646c3168, 'Fraux'],
])

function fail(message) {
  throw new Error(message)
}

function checkSpan(offset, size, total, label) {
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(size) || offset < 0 || size < 0 || offset > total || size > total - offset) {
    fail(`${label} is outside the save file.`)
  }
}

function safeU64(view, offset, label) {
  checkSpan(offset, 8, view.byteLength, label)
  const value = view.getBigUint64(offset, true)
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) fail(`${label} is too large for this browser.`)
  return Number(value)
}

function tableField(view, base, length, tablePosition, fieldIndex, label) {
  checkSpan(tablePosition, 4, length, `${label} table`)
  const vtablePosition = tablePosition - view.getInt32(base + tablePosition, true)
  checkSpan(vtablePosition, 4, length, `${label} vtable`)
  const vtableSize = view.getUint16(base + vtablePosition, true)
  checkSpan(vtablePosition, vtableSize, length, `${label} vtable`)
  const entryPosition = vtablePosition + 4 + fieldIndex * 2
  if (entryPosition + 2 > vtablePosition + vtableSize) return null
  const offset = view.getUint16(base + entryPosition, true)
  if (offset === 0) return null
  const position = tablePosition + offset
  checkSpan(position, 1, length, `${label} field`)
  return position
}

function vectorAt(view, base, length, tablePosition, fieldIndex, elementSize, label) {
  const fieldPosition = tableField(view, base, length, tablePosition, fieldIndex, label)
  if (fieldPosition === null) return null
  checkSpan(fieldPosition, 4, length, `${label} vector pointer`)
  const vectorPosition = fieldPosition + view.getUint32(base + fieldPosition, true)
  checkSpan(vectorPosition, 4, length, `${label} vector`)
  const count = view.getUint32(base + vectorPosition, true)
  if (count > (1 << 20)) fail(`${label} has an unreasonable number of entries.`)
  const dataPosition = vectorPosition + 4
  checkSpan(dataPosition, count * elementSize, length, `${label} vector values`)
  return { count, dataPosition }
}

function rootTable(view, base, length, label) {
  checkSpan(base, 4, view.byteLength, `${label} root pointer`)
  const relative = view.getUint32(base, true)
  if (relative > length - 4) fail(`${label} root pointer is invalid.`)
  const position = relative
  const vtablePosition = position - view.getInt32(base + position, true)
  checkSpan(vtablePosition, 4, length, `${label} root vtable`)
  return position
}

function parseUnitTable(view, base, length, rootPosition, rootFieldIndex, signed, label) {
  const tableVector = vectorAt(view, base, length, rootPosition, rootFieldIndex, 4, `${label} table`)
  if (!tableVector) return []

  const units = []
  const readValue = signed
    ? (offset) => view.getInt32(base + offset, true)
    : (offset) => view.getUint32(base + offset, true)

  for (let index = 0; index < tableVector.count; index += 1) {
    const offsetPosition = tableVector.dataPosition + index * 4
    const recordPosition = offsetPosition + view.getUint32(base + offsetPosition, true)
    checkSpan(recordPosition, 4, length, `${label} entry ${index + 1}`)
    const idPosition = tableField(view, base, length, recordPosition, 0, `${label} entry`)
    const unitPosition = tableField(view, base, length, recordPosition, 1, `${label} entry`)
    const values = vectorAt(view, base, length, recordPosition, 2, 4, `${label} values`)
    const valueDataPosition = values?.dataPosition ?? null
    const valueCount = values?.count ?? 0
    if (idPosition !== null) checkSpan(idPosition, 4, length, `${label} ID type`)
    if (unitPosition !== null) checkSpan(unitPosition, 4, length, `${label} unit ID`)
    units.push({
      idType: idPosition === null ? 0 : view.getUint32(base + idPosition, true),
      unitId: unitPosition === null ? 0 : view.getUint32(base + unitPosition, true),
      valueCount,
      firstValue: valueCount > 0 ? readValue(valueDataPosition) : null,
      firstValueOffset: valueCount > 0 ? base + valueDataPosition : null,
    })
  }
  return units
}

function decodeLevel(levelBit) {
  if (levelBit <= 0 || levelBit > 0x200 || (levelBit & (levelBit - 1)) !== 0) return null
  return 32 - Math.clz32(levelBit)
}

function hex32(value) {
  return `0x${(value >>> 0).toString(16).toUpperCase().padStart(8, '0')}`
}

function characterName(hash, unitId) {
  return characterNames.get(hash) ?? `Unmapped unit ${unitId}`
}

export function getStat(hash) {
  return statByHash.get(hash >>> 0) ?? null
}

export function formatStatValue(stat, level) {
  if (!stat || !level || level < 1 || level > 10) return ''
  const value = stat.values[level - 1]
  // Stun is stored at one tenth of the value surfaced by the in-game panel.
  const multiplier = stat.canonical === 0x6cb38ef3 ? 10 : 1
  const shown = value * multiplier
  if (stat.unit === 'pct') return `+${shown}%`
  return `+${Number.isInteger(shown) ? shown : shown.toFixed(1)}`
}

export function parseSave(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (bytes.byteLength < 52) fail('This file is too small to be a Relink save.')

  const slotOffset = safeU64(view, 28, 'Save slot offset')
  const slotLength = safeU64(view, 44, 'Save slot length')
  checkSpan(slotOffset, slotLength, bytes.byteLength, 'Save slot')
  if (slotLength < 0x40) fail('The save slot is incomplete.')

  const rootPosition = rootTable(view, slotOffset, slotLength, 'Save slot')
  const versionPosition = tableField(view, slotOffset, slotLength, rootPosition, 0, 'Save slot')
  if (versionPosition !== null) checkSpan(versionPosition, 4, slotLength, 'Save version')
  const version = versionPosition === null ? null : view.getUint32(slotOffset + versionPosition, true)
  const uintUnits = parseUnitTable(view, slotOffset, slotLength, rootPosition, 7, false, 'Unsigned save data')
  const intUnits = parseUnitTable(view, slotOffset, slotLength, rootPosition, 6, true, 'Signed save data')

  const characterUnits = uintUnits.filter((unit) => (
    unit.idType === CHARACTER_ID_TYPE &&
    unit.unitId >= FIRST_CHARACTER_UNIT_ID && unit.unitId < LAST_CHARACTER_UNIT_ID &&
    unit.valueCount === 1
  ))
  if (characterUnits.length === 0) fail('No character records were found. This save format or game version may not be supported.')
  const characterUnitIds = new Set()
  const characterHashes = new Set()
  for (const character of characterUnits) {
    if (characterUnitIds.has(character.unitId) || characterHashes.has(character.firstValue >>> 0)) {
      fail('Duplicate character records were found; editing is disabled because slot ownership is ambiguous.')
    }
    characterUnitIds.add(character.unitId)
    characterHashes.add(character.firstValue >>> 0)
  }

  const indexUnits = (units, idType) => {
    const result = new Map()
    for (const unit of units) {
      if (unit.idType !== idType) continue
      const key = unit.unitId
      if (!result.has(key)) result.set(key, [])
      result.get(key).push(unit)
    }
    return result
  }
  const attributesByUnit = indexUnits(uintUnits, OVERMASTERY_ATTRIBUTE_ID_TYPE)
  const levelsByUnit = indexUnits(intUnits, OVERMASTERY_LEVEL_ID_TYPE)

  const characters = characterUnits
    .sort((a, b) => a.unitId - b.unitId)
    .map((character) => {
      const charHash = character.firstValue >>> 0
      const name = characterName(charHash, character.unitId)
      const supportedCharacter = characterNames.has(charHash)
      const baseUnitId = SLOT_BASE + (character.unitId - FIRST_CHARACTER_UNIT_ID) * SLOT_STEP
      const slots = Array.from({ length: SLOT_COUNT }, (_, index) => {
        const unitId = baseUnitId + index
        const attributes = attributesByUnit.get(unitId) ?? []
        const levels = levelsByUnit.get(unitId) ?? []
        const attribute = attributes.length === 1 && attributes[0].valueCount === 1 ? attributes[0] : null
        const level = levels.length === 1 && levels[0].valueCount === 1 ? levels[0] : null
        const editable = supportedCharacter && Boolean(attribute && level)
        const hash = attribute?.firstValue >>> 0
        const levelBit = level?.firstValue ?? 0
        const levelNumber = decodeLevel(levelBit)
        const empty = editable && (hash === 0 || hash === EMPTY_HASH) && levelBit === 0
        const stat = editable ? getStat(hash) : null
        const warnings = []
        if (!attribute || attributes.length !== 1 || attribute.valueCount !== 1) warnings.push('Attribute field is missing, duplicated, or not scalar.')
        if (!level || levels.length !== 1 || level.valueCount !== 1) warnings.push('Level field is missing, duplicated, or not scalar.')
        if (editable && !empty && levelBit === COMMUNITY_RAW_OVERRIDE) warnings.push('Community raw override 0x03FF; behavior can vary by game version.')
        else if (editable && !empty && !levelNumber) warnings.push(`Unrecognized stored level ${hex32(levelBit)}.`)
        if (editable && !empty && !stat) warnings.push(`Unrecognized stat ${hex32(hash)}; its data will be preserved unless this slot is changed.`)
        return {
          index,
          unitId,
          attributeOffset: attribute?.firstValueOffset ?? null,
          levelOffset: level?.firstValueOffset ?? null,
          originalHash: hash,
          originalLevelBit: levelBit,
          draftHash: hash,
          draftLevelBit: levelBit,
          levelNumber,
          empty,
          editable,
          warnings,
        }
      })
      return {
        unitId: character.unitId,
        hash: charHash,
        hashText: hex32(charHash),
        name,
        supported: supportedCharacter,
        slots,
      }
    })

  const seedMatches = uintUnits.filter((unit) => unit.idType === HASH_SEED_ID_TYPE && unit.unitId === 0 && unit.valueCount === 1)
  if (seedMatches.length !== 1) fail('The save hash seed could not be identified unambiguously; editing is disabled for safety.')
  const hashIndex = seedMatches[0].firstValue % HASH_SECTIONS.length
  const hashTableOffset = view.getUint32(slotOffset + slotLength - 0x14, true)
  checkSpan(hashTableOffset, HASH_SECTIONS.length * 8, slotLength, 'Save checksum table')
  const [sectionStart, sectionSize] = HASH_SECTIONS[hashIndex]
  const checksumEnd = hashTableOffset - sectionSize
  if (checksumEnd < sectionStart || checksumEnd > slotLength) fail('The checksum region is invalid.')
  const checksumOffset = slotOffset + hashTableOffset + hashIndex * 8
  checkSpan(checksumOffset, 8, view.byteLength, 'Save checksum')
  const checksumValid = view.getBigUint64(checksumOffset, true) === xxhash64(
    view,
    slotOffset + sectionStart,
    slotOffset + checksumEnd,
    HASH_SEED,
  )

  return {
    slotOffset,
    slotLength,
    version,
    hashIndex,
    hashTableOffset,
    checksumOffset,
    checksumStart: slotOffset + sectionStart,
    checksumEnd: slotOffset + checksumEnd,
    checksumValid,
    characters,
  }
}

function rotl64(value, shift) {
  const count = BigInt(shift)
  return ((value << count) | (value >> (64n - count))) & U64_MASK
}

function round64(accumulator, input) {
  let value = (accumulator + input * PRIME2) & U64_MASK
  value = rotl64(value, 31)
  return (value * PRIME1) & U64_MASK
}

function mergeRound(accumulator, value) {
  let result = accumulator ^ round64(0n, value)
  result = (result * PRIME1 + PRIME4) & U64_MASK
  return result
}

function xxhash64(view, start, end, seed) {
  let position = start
  let hash
  const length = end - start

  if (length >= 32) {
    let v1 = (seed + PRIME1 + PRIME2) & U64_MASK
    let v2 = (seed + PRIME2) & U64_MASK
    let v3 = seed & U64_MASK
    let v4 = (seed - PRIME1) & U64_MASK
    const limit = end - 32
    while (position <= limit) {
      v1 = round64(v1, view.getBigUint64(position, true)); position += 8
      v2 = round64(v2, view.getBigUint64(position, true)); position += 8
      v3 = round64(v3, view.getBigUint64(position, true)); position += 8
      v4 = round64(v4, view.getBigUint64(position, true)); position += 8
    }
    hash = (rotl64(v1, 1) + rotl64(v2, 7) + rotl64(v3, 12) + rotl64(v4, 18)) & U64_MASK
    hash = mergeRound(hash, v1)
    hash = mergeRound(hash, v2)
    hash = mergeRound(hash, v3)
    hash = mergeRound(hash, v4)
  } else {
    hash = (seed + PRIME5) & U64_MASK
  }

  hash = (hash + BigInt(length)) & U64_MASK
  while (position + 8 <= end) {
    const lane = round64(0n, view.getBigUint64(position, true))
    hash ^= lane
    hash = (rotl64(hash, 27) * PRIME1 + PRIME4) & U64_MASK
    position += 8
  }
  if (position + 4 <= end) {
    hash ^= (BigInt(view.getUint32(position, true)) * PRIME1) & U64_MASK
    hash = (rotl64(hash, 23) * PRIME2 + PRIME3) & U64_MASK
    position += 4
  }
  while (position < end) {
    hash ^= (BigInt(view.getUint8(position)) * PRIME5) & U64_MASK
    hash = (rotl64(hash, 11) * PRIME1) & U64_MASK
    position += 1
  }
  hash ^= hash >> 33n
  hash = (hash * PRIME2) & U64_MASK
  hash ^= hash >> 29n
  hash = (hash * PRIME3) & U64_MASK
  hash ^= hash >> 32n
  return hash & U64_MASK
}

export function isEmptySlot(slot) {
  return slot.draftLevelBit === 0 && (slot.draftHash === 0 || slot.draftHash === EMPTY_HASH)
}

export function hasValidLevel(levelBit) {
  return decodeLevel(levelBit) !== null || levelBit === COMMUNITY_RAW_OVERRIDE
}

export function levelFromBit(levelBit) {
  return decodeLevel(levelBit)
}

export function changesForSave(characters) {
  const changes = []
  for (const character of characters) {
    for (const slot of character.slots) {
      if (!slot.editable) continue
      if (slot.draftHash === slot.originalHash && slot.draftLevelBit === slot.originalLevelBit) continue
      if (slot.attributeOffset === null || slot.levelOffset === null) fail(`Slot ${slot.index + 1} for ${character.name} is incomplete.`)
      const empty = isEmptySlot(slot)
      if (!empty && (!statByHash.has(slot.draftHash >>> 0) || !hasValidLevel(slot.draftLevelBit))) {
        fail(`Slot ${slot.index + 1} for ${character.name} has an invalid selection.`)
      }
      if (empty && slot.draftLevelBit !== 0) fail(`Empty slot ${slot.index + 1} for ${character.name} has a level.`)
      changes.push({ character, slot, hash: empty ? EMPTY_HASH : slot.draftHash >>> 0, levelBit: empty ? 0 : slot.draftLevelBit })
    }
  }
  return changes
}

export function createEditedSave(bytes, parsed, changes) {
  if (!parsed.checksumValid) fail('The input save checksum is invalid; editing is disabled for safety.')
  if (!changes.length) fail('There are no overmastery changes to download.')
  const output = new Uint8Array(bytes)
  const view = new DataView(output.buffer, output.byteOffset, output.byteLength)

  for (const change of changes) {
    view.setUint32(change.slot.attributeOffset, change.hash, true)
    view.setInt32(change.slot.levelOffset, change.levelBit, true)
  }

  const checksum = xxhash64(view, parsed.checksumStart, parsed.checksumEnd, HASH_SEED)
  view.setBigUint64(parsed.checksumOffset, checksum, true)
  const savedChecksum = view.getBigUint64(parsed.checksumOffset, true)
  const checkedChecksum = xxhash64(view, parsed.checksumStart, parsed.checksumEnd, HASH_SEED)
  if (savedChecksum !== checkedChecksum) fail('Checksum verification failed. No file was downloaded.')

  const reparsed = parseSave(output)
  for (const change of changes) {
    const char = reparsed.characters.find((entry) => entry.unitId === change.character.unitId)
    const slot = char?.slots[change.slot.index]
    if (!slot || slot.originalHash !== change.hash || slot.originalLevelBit !== change.levelBit) {
      fail(`Read-back verification failed for ${change.character.name}, slot ${change.slot.index + 1}.`)
    }
  }
  return output
}

export function checksumDisplay(view, parsed) {
  return view.getBigUint64(parsed.checksumOffset, true).toString(16).toUpperCase().padStart(16, '0')
}

export function hashToText(value) {
  return hex32(value)
}

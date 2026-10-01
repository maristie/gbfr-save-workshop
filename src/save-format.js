const EMPTY_HASH = 0x887ae0b0
const HASH_SEED_ID_TYPE = 1003
const CHARACTER_ID_TYPE = 1301
const OVERMASTERY_ATTRIBUTE_ID_TYPE = 1606
const OVERMASTERY_LEVEL_ID_TYPE = 1607
const MASTER_POINTS_ID_TYPE = 1112
const MASTER_POINTS_UNIT_ID = 0
export const MAX_MASTER_POINTS = 9_999_999
const FIRST_CHARACTER_UNIT_ID = 10000
const LAST_CHARACTER_UNIT_ID = 20000
const SLOT_BASE = 10000000
const SLOT_STEP = 1000
const SLOT_COUNT = 4
const COMMUNITY_RAW_OVERRIDE = 0x03ff
const SIGIL = {
  baseUnitId: 30000,
  maxCountIdType: 2701,
  serialIdType: 2702,
  hashIdType: 2703,
  levelIdType: 2704,
  ownerIdType: 2706,
  flagsIdType: 2707,
  traitBaseUnitId: 120000000,
  traitLanes: 2,
}
const WRIGHTSTONE = {
  baseUnitId: 50000,
  maxCountIdType: 2101,
  hashIdType: 2102,
  serialIdType: 2103,
  activeIdType: 2104,
  flagsIdType: 2105,
  traitBaseUnitId: 140000000,
  traitLanes: 3,
}
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

function parseUnitTable(view, base, length, rootPosition, rootFieldIndex, signed, label, valueSize = 4) {
  const tableVector = vectorAt(view, base, length, rootPosition, rootFieldIndex, 4, `${label} table`)
  if (!tableVector) return []

  const units = []
  const readValue = signed
    ? (offset) => view.getInt32(base + offset, true)
    : valueSize === 1
      ? (offset) => view.getUint8(base + offset)
      : (offset) => view.getUint32(base + offset, true)

  for (let index = 0; index < tableVector.count; index += 1) {
    const offsetPosition = tableVector.dataPosition + index * 4
    const recordPosition = offsetPosition + view.getUint32(base + offsetPosition, true)
    checkSpan(recordPosition, 4, length, `${label} entry ${index + 1}`)
    const idPosition = tableField(view, base, length, recordPosition, 0, `${label} entry`)
    const unitPosition = tableField(view, base, length, recordPosition, 1, `${label} entry`)
    const values = vectorAt(view, base, length, recordPosition, 2, valueSize, `${label} values`)
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

function indexUnits(units, idType) {
  const result = new Map()
  for (const unit of units) {
    if (unit.idType !== idType) continue
    if (!result.has(unit.unitId)) result.set(unit.unitId, [])
    result.get(unit.unitId).push(unit)
  }
  return result
}

function scalarRecord(index, unitId) {
  const matches = index.get(unitId) ?? []
  return matches.length === 1 && matches[0].valueCount === 1 ? matches[0] : null
}

function hash32(value) {
  return `0x${(value >>> 0).toString(16).toUpperCase().padStart(8, '0')}`
}

function parseInventory(uintUnits, intUnits, boolUnits) {
  const uintByType = new Map()
  const intByType = new Map()
  const boolByType = new Map()
  const buildTypeIndex = (units, target) => {
    const types = new Map()
    for (const unit of units) {
      if (!types.has(unit.idType)) types.set(unit.idType, [])
      types.get(unit.idType).push(unit)
    }
    for (const [idType, entries] of types) target.set(idType, indexUnits(entries, idType))
  }
  buildTypeIndex(uintUnits, uintByType)
  buildTypeIndex(intUnits, intByType)
  buildTypeIndex(boolUnits, boolByType)

  const record = (table, idType, unitId) => scalarRecord(table.get(idType) ?? new Map(), unitId)
  const counter = (idType) => {
    const rows = uintByType.get(idType) ?? new Map()
    if (!rows.size) return { ambiguous: false, value: null, offset: null, unitId: null }
    const matches = (rows.get(0) ?? []).concat(rows.get(4) ?? [])
    if (matches.length !== 1 || matches[0].valueCount !== 1) return { ambiguous: true, value: null, offset: null }
    return { ambiguous: false, value: matches[0].firstValue >>> 0, offset: matches[0].firstValueOffset, unitId: matches[0].unitId }
  }
  const serialState = (idType, baseUnitId) => {
    const entriesByUnit = uintByType.get(idType) ?? new Map()
    let max = 0
    let ambiguous = false
    for (const [unitId, entries] of entriesByUnit) {
      if (unitId < baseUnitId) continue
      if (entries.length !== 1 || entries[0].valueCount !== 1) ambiguous = true
      for (const entry of entries) {
        if (entry.firstValue !== null) max = Math.max(max, entry.firstValue >>> 0)
      }
    }
    return { max, ambiguous }
  }
  const slots = ({ kind, config, signedTypes }) => {
    const hashIndex = uintByType.get(config.hashIdType) ?? new Map()
    const units = [...hashIndex.keys()].filter((unitId) => unitId >= config.baseUnitId).sort((a, b) => a - b)
    const rows = []

    for (const unitId of units) {
      const hash = record(uintByType, config.hashIdType, unitId)
      if (!hash) {
        rows.push({
          kind, unitId, hash: null, hashText: 'Ambiguous hash record', empty: false,
          serial: null, level: null, ownerHash: null, flags: null, active: null,
          lanes: Array.from({ length: config.traitLanes }, () => ({ hash: 0, level: null, hashOffset: null, levelOffset: null, editable: false })),
          editable: false, cloneable: false,
          offsets: { hash: null, serial: null, level: null, owner: null, flags: null, active: null },
        })
        continue
      }
      const lanes = Array.from({ length: config.traitLanes }, (_, lane) => {
        const base = config.traitBaseUnitId + (unitId - config.baseUnitId) * 100 + lane
        const traitHash = record(uintByType, 1701, base)
        const traitLevel = record(intByType, 1702, base)
        return {
          hash: traitHash?.firstValue >>> 0,
          level: traitLevel?.firstValue ?? null,
          hashOffset: traitHash?.firstValueOffset ?? null,
          levelOffset: traitLevel?.firstValueOffset ?? null,
          editable: Boolean(traitHash && traitLevel),
        }
      })
      const itemLevel = signedTypes.length ? record(intByType, signedTypes[0], unitId) : null
      const serial = record(uintByType, config.serialIdType, unitId)
      const owner = config.ownerIdType ? record(uintByType, config.ownerIdType, unitId) : null
      const flags = record(uintByType, config.flagsIdType, unitId)
      const active = config.activeIdType ? record(boolByType, config.activeIdType, unitId) : null
      const empty = (hash.firstValue >>> 0) === EMPTY_HASH
      const required = [hash, serial, flags, ...lanes.flatMap((lane) => lane.editable ? [] : [null])]
      if (signedTypes.length) required.push(itemLevel)
      if (config.ownerIdType) required.push(owner)
      if (config.activeIdType) required.push(active)
      rows.push({
        kind,
        unitId,
        hash: hash.firstValue >>> 0,
        hashText: hash32(hash.firstValue),
        empty,
        serial: serial ? serial.firstValue >>> 0 : null,
        level: itemLevel?.firstValue ?? null,
        ownerHash: owner ? owner.firstValue >>> 0 : null,
        flags: flags ? flags.firstValue >>> 0 : null,
        active: active?.firstValue ?? null,
        lanes,
        editable: required.every(Boolean),
        cloneable: !empty && required.every(Boolean),
        offsets: {
          hash: hash.firstValueOffset,
          serial: serial?.firstValueOffset ?? null,
          level: itemLevel?.firstValueOffset ?? null,
          owner: owner?.firstValueOffset ?? null,
          flags: flags?.firstValueOffset ?? null,
          active: active?.firstValueOffset ?? null,
        },
      })
    }
    const maxCount = counter(config.maxCountIdType)
    const serials = serialState(config.serialIdType, config.baseUnitId)
    const available = rows.filter((row) => row.empty && row.editable).length
    return { rows, occupied: rows.filter((row) => !row.empty).length, available, maxCount, maxSerial: serials.max, serialAmbiguous: serials.ambiguous }
  }

  return {
    sigils: slots({ kind: 'sigil', config: SIGIL, signedTypes: [SIGIL.levelIdType] }),
    wrightstones: slots({ kind: 'wrightstone', config: WRIGHTSTONE, signedTypes: [] }),
  }
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
  const boolUnits = parseUnitTable(view, slotOffset, slotLength, rootPosition, 1, false, 'Boolean save data', 1)
  const masterPointRecords = intUnits.filter((unit) => (
    unit.idType === MASTER_POINTS_ID_TYPE && unit.unitId === MASTER_POINTS_UNIT_ID
  ))
  const masterPointRecord = masterPointRecords.length === 1 && masterPointRecords[0].valueCount === 1
    ? masterPointRecords[0]
    : null
  const masterPoints = {
    editable: Boolean(masterPointRecord),
    value: masterPointRecord?.firstValue ?? null,
    offset: masterPointRecord?.firstValueOffset ?? null,
  }

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
  const inventory = parseInventory(uintUnits, intUnits, boolUnits)

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
    masterPoints,
    inventory,
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

export function parseHashInput(value, label = 'Hash') {
  const text = String(value ?? '').trim()
  if (!text) fail(`${label} is required.`)
  const isHex = /^0x[0-9a-f]{1,8}$/i.test(text)
  const isDecimal = /^\d+$/.test(text)
  if (!isHex && !isDecimal) fail(`${label} must be a 32-bit decimal or 0x-prefixed hexadecimal value.`)
  const value32 = Number(isHex ? Number.parseInt(text.slice(2), 16) : text)
  if (!Number.isSafeInteger(value32) || value32 < 0 || value32 > 0xffffffff) fail(`${label} is outside the uint32 range.`)
  if (value32 === 0 || value32 === EMPTY_HASH) fail(`${label} cannot use an empty-slot value.`)
  return value32 >>> 0
}

export function validateCustomInventoryAddition(kind, input) {
  if (kind !== 'sigil' && kind !== 'wrightstone') fail('Unknown inventory type.')
  const hash = parseHashInput(input.hash, kind === 'sigil' ? 'Sigil hash' : 'Wrightstone hash')
  const level = kind === 'sigil' ? Number(input.level) : null
  if (kind === 'sigil' && (!Number.isInteger(level) || level < 1 || level > 15)) fail('Sigil level must be from 1 to 15.')
  const laneCount = kind === 'sigil' ? SIGIL.traitLanes : WRIGHTSTONE.traitLanes
  const lanes = Array.from({ length: laneCount }, (_, index) => {
    const source = input.lanes?.[index] ?? {}
    const laneHashText = String(source.hash ?? '').trim()
    const laneLevelText = String(source.level ?? '').trim()
    if (index === 0 && !laneHashText) fail('Trait 1 hash is required.')
    if (!laneHashText && !laneLevelText) return { hash: EMPTY_HASH, level: 0 }
    if (!laneHashText || !laneLevelText) fail(`Trait ${index + 1} needs both a hash and a level.`)
    const traitHash = parseHashInput(laneHashText, `Trait ${index + 1} hash`)
    const traitLevel = Number(laneLevelText)
    if (!Number.isInteger(traitLevel) || traitLevel < 1 || traitLevel > 50) {
      fail(`Trait ${index + 1} level must be from 1 to 50.`)
    }
    return { hash: traitHash, level: traitLevel }
  })
  return { kind, hash, level, lanes, custom: true }
}

function validateQueuedAddition(addition, kind) {
  if (!addition || addition.kind !== kind) fail('An inventory addition has the wrong item type.')
  const hash = Number(addition.hash)
  if (!Number.isInteger(hash) || hash <= 0 || hash > 0xffffffff || (hash >>> 0) === EMPTY_HASH) fail('An inventory item has an invalid hash.')
  const level = kind === 'sigil' ? Number(addition.level) : null
  if (kind === 'sigil' && (!Number.isInteger(level) || level < 1 || level > 0x7fffffff)) fail('An inventory item has an invalid level.')
  const laneCount = kind === 'sigil' ? SIGIL.traitLanes : WRIGHTSTONE.traitLanes
  if (!Array.isArray(addition.lanes) || addition.lanes.length !== laneCount) fail('An inventory item has incomplete trait lanes.')
  const lanes = addition.lanes.map((lane, index) => {
    const laneHash = Number(lane?.hash)
    const laneLevel = Number(lane?.level)
    if (!Number.isInteger(laneHash) || laneHash < 0 || laneHash > 0xffffffff) fail(`Trait ${index + 1} has an invalid hash.`)
    if (!Number.isInteger(laneLevel) || laneLevel < 0 || laneLevel > 0x7fffffff) fail(`Trait ${index + 1} has an invalid level.`)
    if ((laneHash === 0 || (laneHash >>> 0) === EMPTY_HASH) !== (laneLevel === 0)) fail(`Trait ${index + 1} has a mismatched empty hash and level.`)
    if (index === 0 && (laneHash === 0 || (laneHash >>> 0) === EMPTY_HASH)) fail('Trait 1 cannot be empty.')
    return { hash: laneHash >>> 0, level: laneLevel }
  })
  return { kind, hash: hash >>> 0, level, lanes }
}

function planInventoryChanges(parsed, additions, removals) {
  const patches = []
  const expected = []
  const cleared = []
  if (!Array.isArray(additions)) fail('Bag additions are malformed.')
  if (!Array.isArray(removals)) fail('Bag removals are malformed.')
  if (additions.some((addition) => !['sigil', 'wrightstone'].includes(addition?.kind))) fail('A bag addition has an unknown item type.')
  if (removals.some((removal) => !['sigil', 'wrightstone'].includes(removal?.kind))) fail('A bag removal has an unknown item type.')
  const removalKeys = new Set()
  for (const removal of removals) {
    if (!Number.isInteger(removal.unitId) || removal.unitId < 0) fail('A bag removal has an invalid slot ID.')
    const key = `${removal.kind}:${removal.unitId}`
    if (removalKeys.has(key)) fail('A bag item was queued for removal more than once.')
    removalKeys.add(key)
  }
  for (const kind of ['sigil', 'wrightstone']) {
    const list = additions.filter((addition) => addition.kind === kind).map((addition) => validateQueuedAddition(addition, kind))
    const bucket = parsed.inventory[kind === 'sigil' ? 'sigils' : 'wrightstones']
    const kindRemovals = removals.filter((removal) => removal.kind === kind)
    const removedRows = kindRemovals.map((removal) => {
      const row = bucket.rows.find((entry) => entry.unitId === removal.unitId)
      const canDelete = kind === 'sigil'
        ? row?.ownerHash === 0 || row?.ownerHash === EMPTY_HASH
        : row?.active === 0
      if (!row || row.empty || !row.editable || !canDelete) fail('This item cannot be safely removed.')
      return row
    })
    const put = (offset, value, type = 'uint32', label = `${kind} slot`) => {
      if (offset === null || offset === undefined) fail(`${label} is incomplete.`)
      patches.push({ offset, value, type })
    }
    for (const row of removedRows) {
      put(row.offsets.hash, EMPTY_HASH, 'uint32', `${kind} slot ${row.unitId}`)
      if (kind === 'sigil') {
        put(row.offsets.level, 0, 'int32', `${kind} slot ${row.unitId}`)
        put(row.offsets.owner, EMPTY_HASH, 'uint32', `${kind} slot ${row.unitId}`)
      } else {
        put(row.offsets.active, 0, 'uint8', `${kind} slot ${row.unitId}`)
      }
      put(row.offsets.flags, 0, 'uint32', `${kind} slot ${row.unitId}`)
      row.lanes.forEach((lane, laneIndex) => {
        put(lane.hashOffset, EMPTY_HASH, 'uint32', `${kind} slot ${row.unitId}, trait ${laneIndex + 1}`)
        put(lane.levelOffset, 0, 'int32', `${kind} slot ${row.unitId}, trait ${laneIndex + 1}`)
      })
      cleared.push({ kind, unitId: row.unitId, serial: row.serial })
    }

    if (!list.length) continue
    const eligible = bucket.rows.filter((row) => (row.empty || removalKeys.has(`${kind}:${row.unitId}`)) && row.editable)
    if (list.length > eligible.length) fail(`Not enough empty ${kind === 'sigil' ? 'sigil' : 'Wrightstone'} slots: need ${list.length}, have ${eligible.length}.`)
    if (bucket.maxCount.ambiguous) fail(`The ${kind} slot counter has duplicate or incomplete records; this save cannot be edited safely.`)
    if (bucket.serialAmbiguous) fail(`The ${kind} slot serials have duplicate or incomplete records; this save cannot be edited safely.`)

    const firstSerial = Math.max(bucket.maxSerial, bucket.maxCount.value ?? 0) + 1
    if (firstSerial + list.length - 1 > 0xffffffff) fail(`${kind} slot IDs exceed the supported uint32 range.`)
    if (bucket.maxCount.offset !== null) {
      patches.push({ offset: bucket.maxCount.offset, value: firstSerial + list.length - 1, type: 'uint32' })
    }

    list.forEach((item, index) => {
      const target = eligible[index]
      const serial = firstSerial + index
      put(target.offsets.hash, item.hash, 'uint32', `${kind} slot ${target.unitId}`)
      put(target.offsets.serial, serial, 'uint32', `${kind} slot ${target.unitId}`)
      if (kind === 'sigil') {
        put(target.offsets.level, item.level, 'int32', `${kind} slot ${target.unitId}`)
        put(target.offsets.owner, EMPTY_HASH, 'uint32', `${kind} slot ${target.unitId}`)
        put(target.offsets.flags, 2, 'uint32', `${kind} slot ${target.unitId}`)
      } else {
        put(target.offsets.active, 0, 'uint8', `${kind} slot ${target.unitId}`)
        put(target.offsets.flags, 2, 'uint32', `${kind} slot ${target.unitId}`)
      }
      item.lanes.forEach((lane, laneIndex) => {
        const targetLane = target.lanes[laneIndex]
        put(targetLane.hashOffset, lane.hash, 'uint32', `${kind} slot ${target.unitId}, trait ${laneIndex + 1}`)
        put(targetLane.levelOffset, lane.level, 'int32', `${kind} slot ${target.unitId}, trait ${laneIndex + 1}`)
      })
      expected.push({ kind, unitId: target.unitId, serial, ...item, ownerHash: kind === 'sigil' ? EMPTY_HASH : undefined, flags: 2, active: kind === 'wrightstone' ? 0 : undefined })
    })
  }
  const overwrittenSlots = new Set(expected.map((item) => `${item.kind}:${item.unitId}`))
  return { patches, expected, cleared: cleared.filter((item) => !overwrittenSlots.has(`${item.kind}:${item.unitId}`)) }
}

function verifyInventoryPlan(inventory, expected, cleared) {
  for (const item of expected) {
    const rows = inventory[item.kind === 'sigil' ? 'sigils' : 'wrightstones'].rows
    const row = rows.find((entry) => entry.unitId === item.unitId)
    if (!row || row.empty || row.hash !== item.hash || row.serial !== item.serial || row.level !== item.level || row.flags !== item.flags) {
      fail(`Read-back verification failed for ${item.kind} slot ${item.unitId}.`)
    }
    if (item.kind === 'sigil' && row.ownerHash !== item.ownerHash) fail(`Read-back verification failed for sigil assignment in slot ${item.unitId}.`)
    if (item.kind === 'wrightstone' && row.active !== item.active) fail(`Read-back verification failed for Wrightstone state in slot ${item.unitId}.`)
    for (let lane = 0; lane < item.lanes.length; lane += 1) {
      if (row.lanes[lane]?.hash !== item.lanes[lane].hash || row.lanes[lane]?.level !== item.lanes[lane].level) {
        fail(`Read-back verification failed for ${item.kind} slot ${item.unitId}, trait ${lane + 1}.`)
      }
    }
  }
  for (const item of cleared) {
    const rows = inventory[item.kind === 'sigil' ? 'sigils' : 'wrightstones'].rows
    const row = rows.find((entry) => entry.unitId === item.unitId)
    if (!row || !row.empty || row.serial !== item.serial || row.flags !== 0) {
      fail(`Read-back verification failed for removal of ${item.kind} slot ${item.unitId}.`)
    }
    if (item.kind === 'sigil' && (row.level !== 0 || row.ownerHash !== EMPTY_HASH)) {
      fail(`Read-back verification failed for removal of sigil slot ${item.unitId}.`)
    }
    if (item.kind === 'wrightstone' && row.active !== 0) {
      fail(`Read-back verification failed for removal of Wrightstone slot ${item.unitId}.`)
    }
    if (row.lanes.some((lane) => lane.hash !== EMPTY_HASH || lane.level !== 0)) {
      fail(`Read-back verification failed for cleared traits in ${item.kind} slot ${item.unitId}.`)
    }
  }
}

export function createEditedSave(bytes, parsed, changes, inventoryAdds = [], inventoryRemovals = [], masterPointsValue = null) {
  if (!parsed.checksumValid) fail('The input save checksum is invalid; editing is disabled for safety.')
  if (!changes.length && !inventoryAdds.length && !inventoryRemovals.length && masterPointsValue === null) fail('There are no changes to download.')
  if (masterPointsValue !== null) {
    if (!parsed.masterPoints?.editable || parsed.masterPoints.offset === null) fail('The Mastery Points field is missing or ambiguous in this save.')
    if (!Number.isInteger(masterPointsValue) || masterPointsValue < 0 || masterPointsValue > MAX_MASTER_POINTS) {
      fail(`Mastery Points must be a whole number from 0 to ${MAX_MASTER_POINTS.toLocaleString('en-US')}.`)
    }
  }
  const inventoryPlan = planInventoryChanges(parsed, inventoryAdds, inventoryRemovals)
  const output = new Uint8Array(bytes)
  const view = new DataView(output.buffer, output.byteOffset, output.byteLength)

  for (const change of changes) {
    view.setUint32(change.slot.attributeOffset, change.hash, true)
    view.setInt32(change.slot.levelOffset, change.levelBit, true)
  }
  if (masterPointsValue !== null && masterPointsValue !== parsed.masterPoints.value) {
    view.setInt32(parsed.masterPoints.offset, masterPointsValue, true)
  }
  for (const patch of inventoryPlan.patches) {
    if (patch.type === 'int32') view.setInt32(patch.offset, patch.value, true)
    else if (patch.type === 'uint8') view.setUint8(patch.offset, patch.value)
    else view.setUint32(patch.offset, patch.value, true)
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
  if (masterPointsValue !== null && reparsed.masterPoints.value !== masterPointsValue) {
    fail('Read-back verification failed for Mastery Points.')
  }
  verifyInventoryPlan(reparsed.inventory, inventoryPlan.expected, inventoryPlan.cleared)
  return output
}

export function checksumDisplay(view, parsed) {
  return view.getBigUint64(parsed.checksumOffset, true).toString(16).toUpperCase().padStart(16, '0')
}

export function hashToText(value) {
  return hex32(value)
}

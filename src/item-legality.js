import { INVENTORY_CATALOG } from './inventory-catalog.js'
import { SUMMON_CATALOG } from './summon-catalog.js'

const EMPTY_HASH = 0x887ae0b0
const WRIGHTSTONE_LEVEL_CAPS = [20, 15, 10]

const sigilsByHash = new Map(INVENTORY_CATALOG.sigils.map((item) => [Number(item.hash) >>> 0, item]))
const wrightstonesByHash = new Map(INVENTORY_CATALOG.wrightstones.map((item) => [Number(item.hash) >>> 0, item]))
const traitsByHash = new Set(INVENTORY_CATALOG.traits.map((trait) => Number(trait.hash) >>> 0))
const summonsByHash = new Map(SUMMON_CATALOG.summons.map((summon) => [Number(summon.hash) >>> 0, summon]))
const summonBonusesByHash = new Map(SUMMON_CATALOG.bonuses.map((bonus) => [Number(bonus.hash) >>> 0, bonus]))

function result(status, message) {
  return { status, message }
}

function isEmptyHash(hash) {
  return hash === 0 || hash === EMPTY_HASH
}

function inspectLanes(addition, count, levelCaps) {
  if (!Array.isArray(addition?.lanes) || addition.lanes.length !== count) {
    return { error: 'The item has incomplete trait lanes.' }
  }

  const lanes = addition.lanes.map((lane, index) => {
    const rawHash = Number(lane?.hash)
    const hash = rawHash >>> 0
    const level = Number(lane?.level)
    const missingValue = lane?.hash === null || lane?.hash === undefined || lane?.level === null || lane?.level === undefined
    return { hash, rawHash, level, index, missingValue, empty: isEmptyHash(hash) }
  })

  for (const lane of lanes) {
    if (lane.missingValue
      || !Number.isInteger(lane.rawHash)
      || lane.rawHash < 0
      || lane.rawHash > 0xffffffff
      || !Number.isInteger(lane.level)
      || lane.level < 0
      || (lane.empty ? lane.level !== 0 : lane.level < 1)) {
      return { error: 'A trait hash and level do not form a valid saved lane.' }
    }
    if (levelCaps && !lane.empty && lane.level > levelCaps[lane.index]) {
      return { error: 'A Wrightstone trait level exceeds its 20/15/10 lane cap.' }
    }
  }

  if (lanes[0].empty) return { error: 'The primary trait lane is empty.' }
  return { lanes }
}

export function checkInventoryAdditionProducibility(addition) {
  if (addition?.kind !== 'sigil' && addition?.kind !== 'wrightstone') {
    return result('conflict', 'The item type is not a Sigil or Wrightstone.')
  }

  const rawItemHash = Number(addition.hash)
  if (!Number.isInteger(rawItemHash) || rawItemHash < 0 || rawItemHash > 0xffffffff) {
    return result('conflict', 'The item hash is outside the save field’s unsigned 32-bit range.')
  }
  const itemHash = rawItemHash >>> 0
  const item = (addition.kind === 'sigil' ? sigilsByHash : wrightstonesByHash).get(itemHash)
  if (!item) return result('review', 'The item hash is not in the current catalog.')

  const laneCount = addition.kind === 'sigil' ? 2 : 3
  const inspected = inspectLanes(
    addition,
    laneCount,
    addition.kind === 'wrightstone' ? WRIGHTSTONE_LEVEL_CAPS : null,
  )
  if (inspected.error) return result('conflict', inspected.error)

  const primaryHash = Number(item.primaryTraitHash) >>> 0
  if (inspected.lanes[0].hash !== primaryHash) {
    return result('conflict', 'The primary trait does not match the selected item type.')
  }

  if (addition.kind === 'wrightstone') {
    if (inspected.lanes.some((lane) => !lane.empty && !traitsByHash.has(lane.hash))) {
      return result('review', 'A Wrightstone trait is not in the current trait catalog.')
    }
    return result('review', 'The primary trait and 20/15/10 lane caps match; Wrightstone bonus-trait roll pools are not fully cataloged.')
  }

  const level = Number(addition.level)
  if (!Number.isInteger(level) || level < 1 || level > 15) {
    return result('conflict', 'The Sigil level is outside the supported 1–15 range.')
  }
  if (item.name.endsWith('+') && level < 11) {
    return result('conflict', 'A + Sigil cannot be below level 11; synthesis starts at 11.')
  }
  if (inspected.lanes.some((lane) => !lane.empty && lane.level > 15)) {
    return result('conflict', 'A Sigil trait level is outside the supported 1–15 range.')
  }
  if (!traitsByHash.has(primaryHash)) {
    return result('review', 'A Sigil trait is not in the current trait catalog.')
  }
  if (inspected.lanes.some((lane) => !lane.empty && !traitsByHash.has(lane.hash))) {
    return result('review', 'A Sigil trait is not in the current trait catalog.')
  }

  if (inspected.lanes.some((lane) => !lane.empty && lane.level !== level)) {
    return result('review', 'The Sigil level and trait levels differ; this combination is not covered by the current rules.')
  }

  const secondary = inspected.lanes[1]
  const secondaryHashes = (item.secondaryTraitHashes ?? []).map((hash) => Number(hash) >>> 0)
  if (item.fixedSecondary) {
    if (secondary.empty || secondary.hash !== secondaryHashes[0]) {
      return result('conflict', 'This Sigil requires its cataloged fixed secondary trait.')
    }
    return result('match', 'The Sigil matches a cataloged fixed-trait pattern.')
  }

  if (secondaryHashes.length > 0) {
    if (secondary.empty) return result('conflict', 'This Sigil requires a secondary trait.')
    if (secondaryHashes.includes(secondary.hash)) {
      return result('match', 'The trait pair matches a cataloged natural Sigil roll pool.')
    }
    return result('review', 'This secondary trait is outside the natural roll pool; a Sigil Synthesis route is not confirmed.')
  }

  if (!secondary.empty) return result('conflict', 'This Sigil type has no secondary trait slot.')
  return result('match', 'The Sigil matches a cataloged single-trait pattern.')
}

export function checkSummonAdditionProducibility(addition) {
  const rawTypeHash = Number(addition?.typeHash)
  if (!Number.isInteger(rawTypeHash) || rawTypeHash < 0 || rawTypeHash > 0xffffffff) {
    return result('conflict', 'The summon type hash is outside the save field’s unsigned 32-bit range.')
  }
  const typeHash = rawTypeHash >>> 0
  const definition = summonsByHash.get(typeHash)
  if (!definition) return result('review', 'The summon type is not in the current natural-roll catalog.')

  const rawMainHash = Number(addition.mainTraitHash)
  const rawBonusHash = Number(addition.bonusHash)
  if (![rawMainHash, rawBonusHash].every((hash) => Number.isInteger(hash) && hash >= 0 && hash <= 0xffffffff)) {
    return result('conflict', 'A summon trait hash is outside the save field’s unsigned 32-bit range.')
  }
  const mainHash = rawMainHash >>> 0
  const mainLevel = Number(addition.mainLevel)
  const bonusHash = rawBonusHash >>> 0
  const bonusLevel = Number(addition.bonusLevel)
  const mainRule = definition.mainTraits.find((entry) => (Number(entry.hash) >>> 0) === mainHash)
  const bonusRule = definition.bonuses.find((entry) => (Number(entry.hash) >>> 0) === bonusHash)
  const bonusDefinition = summonBonusesByHash.get(bonusHash)

  if (!mainRule || !mainRule.levels.includes(mainLevel)) {
    return result('conflict', 'The summon main trait or level is outside its cataloged natural roll pool.')
  }
  if (!bonusRule || !bonusRule.levels.includes(bonusLevel) || !bonusDefinition) {
    return result('conflict', 'The summon equip bonus or level is outside its cataloged natural roll pool.')
  }

  const field1460 = Number(addition.field1460)
  if (!Number.isInteger(field1460) || field1460 < 0 || field1460 > 0xffffffff) {
    return result('conflict', 'Field 1460 is outside the save field’s unsigned 32-bit range.')
  }

  return result('review', 'The summon traits match cataloged natural rolls; its reward route and field 1460 are not fully verified.')
}

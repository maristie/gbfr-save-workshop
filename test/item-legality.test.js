import test from 'node:test'
import assert from 'node:assert/strict'

import { INVENTORY_CATALOG } from '../src/inventory-catalog.js'
import { SUMMON_CATALOG } from '../src/summon-catalog.js'
import {
  checkInventoryAdditionProducibility,
  checkSummonAdditionProducibility,
} from '../src/item-legality.js'

const EMPTY_HASH = 0x887ae0b0

function sigilAddition(item, { level = 15, secondaryHash = null, primaryLevel = level } = {}) {
  return {
    kind: 'sigil',
    hash: Number(item.hash),
    level,
    lanes: [
      { hash: Number(item.primaryTraitHash), level: primaryLevel },
      secondaryHash === null
        ? { hash: EMPTY_HASH, level: 0 }
        : { hash: Number(secondaryHash), level },
    ],
  }
}

function summonAddition(summon, { mainLevel, field1460 = 0 } = {}) {
  const mainRule = summon.mainTraits[0]
  const bonusRule = summon.bonuses[0]
  return {
    typeHash: Number(summon.hash),
    mainTraitHash: Number(mainRule.hash),
    mainLevel: mainLevel ?? mainRule.levels[0],
    bonusHash: Number(bonusRule.hash),
    bonusLevel: bonusRule.levels[0],
    field1460,
  }
}

test('cataloged single-trait Sigil patterns match', () => {
  const item = INVENTORY_CATALOG.sigils.find((entry) => !entry.name.endsWith('+')
    && !entry.fixedSecondary
    && entry.secondaryTraitHashes.length === 0)

  assert.ok(item, 'expected a cataloged single-trait Sigil')
  assert.deepEqual(checkInventoryAdditionProducibility(sigilAddition(item)), {
    status: 'match',
    message: 'The Sigil matches a cataloged single-trait pattern.',
  })
  const otherTrait = INVENTORY_CATALOG.traits.find((trait) => Number(trait.hash) !== Number(item.primaryTraitHash))
  assert.ok(otherTrait, 'expected a trait different from the Sigil primary trait')
  assert.equal(checkInventoryAdditionProducibility({
    ...sigilAddition(item),
    lanes: [
      { hash: Number(otherTrait.hash), level: 15 },
      { hash: EMPTY_HASH, level: 0 },
    ],
  }).status, 'conflict')
})

test('fixed-secondary Sigils match only with their required secondary trait', () => {
  const item = INVENTORY_CATALOG.sigils.find((entry) => entry.fixedSecondary)

  assert.ok(item, 'expected a cataloged fixed-secondary Sigil')
  assert.equal(
    checkInventoryAdditionProducibility(sigilAddition(item, { secondaryHash: item.secondaryTraitHashes[0] })).status,
    'match',
  )
  assert.equal(checkInventoryAdditionProducibility(sigilAddition(item)).status, 'conflict')
})

test('a selectable + Sigil below level 11 is a known conflict', () => {
  const item = INVENTORY_CATALOG.sigils.find((entry) => entry.name.endsWith('+')
    && !entry.fixedSecondary
    && entry.secondaryTraitHashes.length > 0)

  assert.ok(item, 'expected a selectable-secondary + Sigil')
  assert.equal(checkInventoryAdditionProducibility(sigilAddition(item, {
    level: 10,
    secondaryHash: item.secondaryTraitHashes[0],
  })).status, 'conflict')
})

test('secondary traits outside a selectable Sigil’s natural pool need review', () => {
  const item = INVENTORY_CATALOG.sigils.find((entry) => !entry.fixedSecondary
    && entry.secondaryTraitHashes.length > 0
    && INVENTORY_CATALOG.traits.some((trait) => Number(trait.hash) !== Number(entry.primaryTraitHash)
      && !entry.secondaryTraitHashes.includes(trait.hash)))
  assert.ok(item, 'expected a Sigil with an incomplete natural pool')
  const secondary = INVENTORY_CATALOG.traits.find((trait) => Number(trait.hash) !== Number(item.primaryTraitHash)
    && !item.secondaryTraitHashes.includes(trait.hash))

  assert.ok(secondary, 'expected a cataloged trait outside the natural pool')
  assert.equal(checkInventoryAdditionProducibility(sigilAddition(item, {
    secondaryHash: secondary.hash,
  })).status, 'review')
})

test('Sigil and trait level mismatches need review', () => {
  const item = INVENTORY_CATALOG.sigils.find((entry) => !entry.name.endsWith('+')
    && !entry.fixedSecondary
    && entry.secondaryTraitHashes.length === 0)

  assert.ok(item, 'expected a cataloged single-trait Sigil')
  assert.equal(checkInventoryAdditionProducibility(sigilAddition(item, { primaryLevel: 14 })).status, 'review')
})

test('Wrightstone level caps are enforced and otherwise incomplete bonus pools need review', () => {
  const item = INVENTORY_CATALOG.wrightstones[0]
  assert.ok(item, 'expected a cataloged Wrightstone')
  const bonusTraits = INVENTORY_CATALOG.traits.slice(0, 2).map((trait) => Number(trait.hash))
  const levels = [20, 15, 10]
  const addition = {
    kind: 'wrightstone',
    hash: Number(item.hash),
    lanes: [
      { hash: Number(item.primaryTraitHash), level: levels[0] },
      { hash: bonusTraits[0], level: levels[1] },
      { hash: bonusTraits[1], level: levels[2] },
    ],
  }

  assert.equal(checkInventoryAdditionProducibility(addition).status, 'review')
  for (const [index, cap] of [20, 15, 10].entries()) {
    const overCap = {
      ...addition,
      lanes: addition.lanes.map((lane, laneIndex) => ({
        ...lane,
        level: laneIndex === index ? cap + 1 : lane.level,
      })),
    }
    assert.equal(checkInventoryAdditionProducibility(overCap).status, 'conflict')
  }
})

test('cataloged summon rolls need review until their reward route and field 1460 are verified', () => {
  const summon = SUMMON_CATALOG.summons[0]
  assert.ok(summon, 'expected a cataloged summon')
  assert.equal(checkSummonAdditionProducibility(summonAddition(summon)).status, 'review')
})

test('summon rolls outside their cataloged pool and invalid field 1460 values conflict', () => {
  const summon = SUMMON_CATALOG.summons.find((entry) => entry.mainTraits[0]?.levels.length)
  assert.ok(summon, 'expected a cataloged summon with a main trait level')
  const maximumMainLevel = Math.max(...summon.mainTraits[0].levels)

  assert.equal(checkSummonAdditionProducibility(summonAddition(summon, {
    mainLevel: maximumMainLevel + 1,
  })).status, 'conflict')
  assert.equal(checkSummonAdditionProducibility(summonAddition(summon, {
    field1460: -1,
  })).status, 'conflict')
})

test('hashes outside uint32 are rejected before catalog lookup', () => {
  const item = INVENTORY_CATALOG.sigils[0]
  assert.ok(item, 'expected a cataloged Sigil')
  assert.equal(checkInventoryAdditionProducibility({
    ...sigilAddition(item),
    hash: Number(item.hash) + 0x1_0000_0000,
  }).status, 'conflict')

  const summon = SUMMON_CATALOG.summons[0]
  assert.ok(summon, 'expected a cataloged summon')
  assert.equal(checkSummonAdditionProducibility({
    ...summonAddition(summon),
    typeHash: Number(summon.hash) + 0x1_0000_0000,
  }).status, 'conflict')
})

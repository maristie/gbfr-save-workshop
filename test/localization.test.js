import test from 'node:test'
import assert from 'node:assert/strict'

import { INVENTORY_TERMS } from '../src/inventory-terms.js'
import {
  LANGUAGE_OPTIONS,
  allInventoryTermNames,
  localizeCharacter,
  localizeInventoryTerm,
  localizeText,
  normalizeLanguage,
} from '../src/localization.js'

test('the supported language choices include English, Japanese, and both Chinese variants', () => {
  assert.deepEqual(
    LANGUAGE_OPTIONS.map(({ value }) => value),
    ['en', 'ja', 'zh-CN', 'zh-TW'],
  )
})

test('unsupported language values fall back to English', () => {
  for (const language of ['en', 'ja', 'zh-CN', 'zh-TW']) {
    assert.equal(normalizeLanguage(language), language)
  }
  for (const language of [undefined, null, '', 'zh', 'fr']) {
    assert.equal(normalizeLanguage(language), 'en')
  }
})

test('character names are localized and unknown names are preserved', () => {
  assert.equal(localizeCharacter('Gran', 'ja'), 'グラン')
  assert.equal(localizeCharacter('Gran', 'zh-CN'), '格兰')
  assert.equal(localizeCharacter('Gran', 'zh-TW'), '格蘭')
  assert.equal(localizeCharacter('Unmapped Unit', 'ja'), 'Unmapped Unit')
  assert.equal(localizeCharacter('Gran', 'en'), 'Gran')
})

test('inventory term mappings cover all three translations and preserve English fallbacks', () => {
  for (const [kind, terms] of Object.entries(INVENTORY_TERMS)) {
    const localizedKind = kind === 'traits' ? 'trait' : 'sigil'
    for (const [name, translations] of Object.entries(terms)) {
      for (const language of ['ja', 'zh-CN', 'zh-TW']) {
        assert.ok(translations[language], `${kind} mapping for ${name} is missing ${language}`)
        assert.equal(localizeInventoryTerm(name, localizedKind, language), translations[language])
      }
      assert.equal(localizeInventoryTerm(name, localizedKind, 'en'), name)
      assert.equal(localizeInventoryTerm(`Unknown ${name}`, localizedKind, 'ja'), `Unknown ${name}`)
    }
  }
})

test('item search terms include English and localized variants', () => {
  assert.deepEqual(allInventoryTermNames('Aegis I', 'sigil'), ['Aegis I', '守護', '守护', '守護'])
  assert.deepEqual(allInventoryTermNames('Quick Cooldown', 'trait'), [
    'Quick Cooldown',
    'クイックアビリティ',
    '迅捷能力',
    '技能加速',
  ])
  assert.ok(allInventoryTermNames('Dread Wrightstone', 'wrightstone').includes('Dread Wrightstone'))
})

test('static and dynamic interface text is localized', () => {
  assert.equal(localizeText('Open save', 'ja'), 'セーブを開く')
  assert.equal(localizeText('Open save', 'zh-CN'), '打开存档')
  assert.equal(localizeText('Open save', 'zh-TW'), '開啟存檔')
  assert.equal(localizeText('Sigil Lv 15', 'ja'), 'ジーン Lv 15')
  assert.equal(localizeText('2/4 filled', 'zh-CN'), '已填入 2/4')
  assert.equal(localizeText('Level 1', 'zh-TW'), '等級 1')
  assert.equal(localizeText('Unmapped label', 'zh-TW'), 'Unmapped label')
  assert.equal(localizeText('Open save', 'en'), 'Open save')
})

test('producibility check labels and guidance are translated in every supported language', () => {
  const labels = [
    'Check producibility',
    'Optional check against known game data. Incomplete rules show Needs review; edits and downloads remain available.',
    'Matches catalog rules',
    'Known conflict',
    'Needs review',
    'Checks run',
    'Catalog matches',
    'Known conflicts',
    'The trait pair and Sigil type match a cataloged Sigil Synthesis route.',
  ]

  for (const language of ['ja', 'zh-CN', 'zh-TW']) {
    for (const label of labels) {
      assert.notEqual(localizeText(label, language), label, `${label} is missing a ${language} translation`)
    }
  }
})

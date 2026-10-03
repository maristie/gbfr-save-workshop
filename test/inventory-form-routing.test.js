import test from 'node:test'
import assert from 'node:assert/strict'

import { isInventoryCatalogForm } from '../src/inventory-form-routing.js'

test('summon forms do not receive the inventory catalog submit handler', () => {
  assert.equal(isInventoryCatalogForm({ dataset: {} }), false)
  assert.equal(isInventoryCatalogForm({ dataset: { kind: 'summon' } }), false)
})

test('Sigil and Wrightstone catalog forms receive the inventory submit handler', () => {
  assert.equal(isInventoryCatalogForm({ dataset: { kind: 'sigil' } }), true)
  assert.equal(isInventoryCatalogForm({ dataset: { kind: 'wrightstone' } }), true)
})

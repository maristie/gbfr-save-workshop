const INVENTORY_CATALOG_KINDS = new Set(['sigil', 'wrightstone'])

export function isInventoryCatalogForm(form) {
  return INVENTORY_CATALOG_KINDS.has(form?.dataset?.kind)
}

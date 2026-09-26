export function getSectorFromResult(result = {}, fallback = 'finance') {
  return (
    result?.governance_decision?.sector ||
    result?.sector ||
    fallback
  )
}

export function getSectorRoute(sector = 'finance') {
  const routes = {
    finance: 'finance',
    retail: 'retail',
    hospitality: 'hospitality',
    entertainment: 'entertainment',
  }

  return routes[sector] || 'overview'
}

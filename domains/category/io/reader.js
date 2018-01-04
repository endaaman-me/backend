async function readAll() {

  const baseFilenames = await fs.readdir(BASE_DIR)

  const categortSlugs = (await Promise.all(baseFilenames.map(slug => {
    return fs.stat(J(BASE_DIR, slug)).then((stat) => ({stat, slug}))
  })))
    .filter((v) => v.stat.isDirectory())
    .map((v) => v.slug)

  const wg = []
  for (const categorySlug of categortSlugs) {
    wg.push(loadCategory(J(categorySlug)))
  }
  const results = await Promise.all(wg)

  const categories = []
  const warnings = []
  results.forEach((result) => {
    if (result.warning) {
      warnings.push({
        slug: result.category.slug,
        warning: result.warning,
      })
    }
    categories.push(result.category)
  })

  return { categories, warnings }
}

module.exports = {
  readAll,
}

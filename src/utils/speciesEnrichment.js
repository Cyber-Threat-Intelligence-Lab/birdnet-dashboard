const CACHE_PREFIX = "bowerbird-species-enrichment-v2"
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

const CLASS_TO_INAT_ICONIC = {
  Bird: "Aves",
  Mammal: "Mammalia",
  Amphibian: "Amphibia",
  Insect: "Insecta",
  Reptile: "Reptilia",
  Fish: "Actinopterygii",
  Arachnid: "Arachnida",
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
}

function humanizeStatus(value) {
  if (!value) return ""

  const known = {
    lc: "Least Concern",
    nt: "Near Threatened",
    vu: "Vulnerable",
    en: "Endangered",
    cr: "Critically Endangered",
    ew: "Extinct in the Wild",
    ex: "Extinct",
    dd: "Data Deficient",
    ne: "Not Evaluated",
  }

  const key = normalize(value)

  if (known[key]) return known[key]

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function readCache(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw)

    if (!parsed?.savedAt || Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      localStorage.removeItem(key)
      return null
    }

    return parsed.value || null
  } catch {
    return null
  }
}

function writeCache(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        savedAt: Date.now(),
        value,
      })
    )
  } catch {
    // Cache failures should never block the page.
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`External species request failed (${response.status})`)
  }

  return response.json()
}

function scoreTaxon(
  taxon,
  {
    speciesName,
    scientificName,
    animalClass,
  }
) {
  let score = 0

  const wantedScientific = normalize(scientificName)
  const wantedCommon = normalize(speciesName)

  const taxonScientific = normalize(taxon?.name)
  const taxonCommon = normalize(
    taxon?.preferred_common_name
  )

  if (
    wantedScientific &&
    taxonScientific === wantedScientific
  ) {
    score += 120
  }

  if (
    wantedCommon &&
    taxonCommon === wantedCommon
  ) {
    score += 100
  }

  if (
    wantedScientific &&
    taxonScientific.includes(wantedScientific)
  ) {
    score += 25
  }

  if (
    wantedCommon &&
    taxonCommon.includes(wantedCommon)
  ) {
    score += 20
  }

  if (taxon?.rank === "species") {
    score += 10
  }

  const expectedIconic =
    CLASS_TO_INAT_ICONIC[animalClass]

  if (
    expectedIconic &&
    taxon?.iconic_taxon_name === expectedIconic
  ) {
    score += 15
  }

  return score
}

async function fetchInaturalistTaxon({
  speciesName,
  scientificName,
  inaturalistTaxonId,
  animalClass,
}) {
  if (inaturalistTaxonId) {
    const data = await fetchJson(
      `https://api.inaturalist.org/v1/taxa/${encodeURIComponent(
        inaturalistTaxonId
      )}`
    )

    return data?.results?.[0] || null
  }

  const query =
    scientificName || speciesName

  if (!query) return null

  const url = new URL(
    "https://api.inaturalist.org/v1/taxa"
  )

  url.searchParams.set("q", query)
  url.searchParams.set("rank", "species")
  url.searchParams.set("per_page", "10")
  url.searchParams.set("locale", "en")

  const data = await fetchJson(url.toString())

  const results = Array.isArray(data?.results)
    ? data.results
    : []

  if (!results.length) return null

  const ranked = results
    .map((taxon) => ({
      taxon,
      score: scoreTaxon(taxon, {
        speciesName,
        scientificName,
        animalClass,
      }),
    }))
    .sort((a, b) => b.score - a.score)

  const best = ranked[0]

  // Avoid silently attaching information
  // to a weak common-name match.
  if (best.score < 70) {
    return null
  }

  return best.taxon
}

function wikipediaTitleFromUrl(url) {
  if (!url) return ""

  try {
    const parsed = new URL(url)

    const marker = "/wiki/"
    const index =
      parsed.pathname.indexOf(marker)

    if (index === -1) return ""

    return decodeURIComponent(
      parsed.pathname.slice(
        index + marker.length
      )
    ).replace(/_/g, " ")
  } catch {
    return ""
  }
}

async function fetchWikipediaSummary(title) {
  if (!title) return null

  const url = new URL(
    "https://en.wikipedia.org/w/api.php"
  )

  url.searchParams.set("action", "query")
  url.searchParams.set("format", "json")
  url.searchParams.set("origin", "*")
  url.searchParams.set("redirects", "1")
  url.searchParams.set(
    "prop",
    "extracts|info"
  )
  url.searchParams.set("inprop", "url")
  url.searchParams.set("exintro", "1")
  url.searchParams.set(
    "explaintext",
    "1"
  )
  url.searchParams.set("titles", title)

  const data = await fetchJson(
    url.toString()
  )

  const pages = Object.values(
    data?.query?.pages || {}
  )

  const page = pages[0]

  if (
    !page ||
    page.missing !== undefined
  ) {
    return null
  }

  return {
    title: page.title || title,
    description: page.extract || "",
    url: page.fullurl || "",
  }
}

function photoFromTaxon(taxon) {
  const photo = taxon?.default_photo

  if (!photo) return null

  return {
    url:
      photo.medium_url ||
      photo.large_url ||
      photo.original_url ||
      photo.url ||
      "",

    attribution:
      photo.attribution || "",

    license:
      photo.license_code
        ? photo.license_code.toUpperCase()
        : "",
  }
}

export async function fetchSpeciesEnrichment({
  speciesName,
  scientificName = "",
  inaturalistTaxonId = "",
  wikipediaTitle = "",
  animalClass = "",
}) {
  const cacheIdentity =
    inaturalistTaxonId ||
    scientificName ||
    `${speciesName}-${animalClass}`

  const cacheKey =
    `${CACHE_PREFIX}:${normalize(
      cacheIdentity
    )}`

  const cached = readCache(cacheKey)

  if (cached) {
    return cached
  }

  let taxon = null
  let inatError = ""

  try {
    taxon =
      await fetchInaturalistTaxon({
        speciesName,
        scientificName,
        inaturalistTaxonId,
        animalClass,
      })
  } catch (error) {
    inatError =
      error?.message ||
      "iNaturalist lookup failed"
  }

  const photo =
    photoFromTaxon(taxon)

  const resolvedScientificName =
    taxon?.name ||
    scientificName ||
    ""

  const resolvedCommonName =
    taxon?.preferred_common_name ||
    speciesName ||
    ""

  const conservationRaw =
    taxon?.conservation_status
      ?.status_name ||
    taxon?.conservation_status
      ?.status ||
    ""

  const resolvedWikipediaTitle =
    wikipediaTitle ||
    wikipediaTitleFromUrl(
      taxon?.wikipedia_url
    ) ||
    resolvedScientificName ||
    speciesName

  let wikipedia = null
  let wikipediaError = ""

  try {
    wikipedia =
      await fetchWikipediaSummary(
        resolvedWikipediaTitle
      )
  } catch (error) {
    wikipediaError =
      error?.message ||
      "Wikipedia lookup failed"
  }

  const value = {
    commonName:
      resolvedCommonName,

    scientificName:
      resolvedScientificName,

    description:
      wikipedia?.description || "",

    imageUrl:
      photo?.url || "",

    imageAttribution:
      photo?.attribution || "",

    imageLicense:
      photo?.license || "",

    taxonGroup:
      taxon?.iconic_taxon_name || "",

    taxonRank:
      taxon?.rank || "",

    observationsCount:
      Number.isFinite(
        Number(
          taxon?.observations_count
        )
      )
        ? Number(
            taxon.observations_count
          )
        : null,

    conservationStatus:
      humanizeStatus(
        conservationRaw
      ),

    inaturalistUrl:
      taxon?.id
        ? `https://www.inaturalist.org/taxa/${taxon.id}`
        : "",

    wikipediaUrl:
      wikipedia?.url ||
      taxon?.wikipedia_url ||
      "",

    externalLookupMatched:
      Boolean(taxon),

    warnings: [
      inatError,
      wikipediaError,
    ].filter(Boolean),
  }

  writeCache(cacheKey, value)

  return value
}
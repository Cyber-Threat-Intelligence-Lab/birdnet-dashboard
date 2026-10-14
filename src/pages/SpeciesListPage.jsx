import { useMemo, useState } from "react"
import { ArrowLeft, Bird, ChevronRight, Search } from "lucide-react"

function metadataForSpecies(metadata, species) {
  const defaults = metadata?.__default || {}
  const specific = metadata?.[species] || {}

  return {
    ...defaults,
    ...specific,
    audio:
      Array.isArray(specific.audio) && specific.audio.length
        ? specific.audio
        : defaults.audio || [],
  }
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function SpeciesListPage({
  speciesStats,
  metadata,
  onSelectSpecies,
  onBack,
}) {
  const [search, setSearch] = useState("")

  const visibleSpecies = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return speciesStats

    return speciesStats.filter((item) => {
      const meta = metadataForSpecies(metadata, item.species)
      return (
        item.species.toLowerCase().includes(query) ||
        item.animalClass.toLowerCase().includes(query) ||
        String(meta.scientificName || "").toLowerCase().includes(query)
      )
    })
  }, [metadata, search, speciesStats])

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-7">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Back to dashboard
      </button>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-yellow-700">
                <Bird size={17} />
                Detected wildlife
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Species
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Browse all species detected by the BowerBird nodes. Select a species to view occurrence statistics, recordings, and species information.
              </p>
            </div>

            <div className="relative w-full lg:w-[360px]">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search species or scientific name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100"
              />
            </div>
          </div>
        </div>

        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-sm text-slate-500 sm:px-6">
          Showing <span className="font-bold text-slate-800">{visibleSpecies.length}</span> detected species
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white">
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 sm:px-6">Species</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Occurrences</th>
                <th className="px-5 py-3">Last detected</th>
                <th className="px-5 py-3">Avg. confidence</th>
                <th className="px-5 py-3">Nodes</th>
                <th className="w-12 px-5 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visibleSpecies.map((item) => {
                const meta = metadataForSpecies(metadata, item.species)

                return (
                  <tr
                    key={item.species}
                    onClick={() => onSelectSpecies(item.species)}
                    className="cursor-pointer transition hover:bg-yellow-50/50"
                  >
                    <td className="px-5 py-4 sm:px-6">
                      <div className="font-bold text-slate-900">{item.species}</div>
                      <div className="mt-1 text-xs italic text-slate-500">
                        {meta.scientificName || "Scientific name to be provided"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                        {item.animalClass}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-extrabold text-slate-900">
                      {item.count.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {formatDate(item.lastDetected)}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {Math.round(item.avgConfidence * 100)}%
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.nodeCount}
                    </td>
                    <td className="px-5 py-4 text-right text-slate-400">
                      <ChevronRight size={18} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {!visibleSpecies.length && (
            <div className="p-12 text-center text-sm text-slate-500">
              No species match your search.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

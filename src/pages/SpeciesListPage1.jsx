import { useMemo, useState } from "react"
import {
  ArrowLeft,
  Bird,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Search,
} from "lucide-react"

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

function compareValues(a, b, key, metadata) {
  if (key === "species") {
    return a.species.localeCompare(b.species, undefined, {
      sensitivity: "base",
    })
  }

  if (key === "animalClass") {
    return a.animalClass.localeCompare(b.animalClass, undefined, {
      sensitivity: "base",
    })
  }

  if (key === "scientificName") {
    const aName = metadataForSpecies(metadata, a.species).scientificName || ""
    const bName = metadataForSpecies(metadata, b.species).scientificName || ""

    return aName.localeCompare(bName, undefined, {
      sensitivity: "base",
    })
  }

  if (key === "lastDetected") {
    return new Date(a.lastDetected || 0).getTime() - new Date(b.lastDetected || 0).getTime()
  }

  return Number(a[key] || 0) - Number(b[key] || 0)
}

function SortIcon({ active, direction }) {
  if (!active) {
    return <ChevronsUpDown size={14} className="text-slate-300" />
  }

  return direction === "asc" ? (
    <ChevronUp size={14} className="text-slate-700" />
  ) : (
    <ChevronDown size={14} className="text-slate-700" />
  )
}

function SortableHeader({ label, sortKey, sortConfig, onSort, className = "" }) {
  const active = sortConfig.key === sortKey

  return (
    <th
      className={`px-5 py-3 ${className}`}
      aria-sort={
        active
          ? sortConfig.direction === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1.5 text-left transition hover:text-slate-900"
      >
        {label}
        <SortIcon active={active} direction={sortConfig.direction} />
      </button>
    </th>
  )
}

export default function SpeciesListPage({
  speciesStats,
  metadata,
  onSelectSpecies,
  onBack,
}) {
  const [search, setSearch] = useState("")
  const [sortConfig, setSortConfig] = useState({
    key: "count",
    direction: "desc",
  })

  const handleSort = (key) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        }
      }

      return {
        key,
        direction:
          key === "species" || key === "animalClass" || key === "scientificName"
            ? "asc"
            : "desc",
      }
    })
  }

  const visibleSpecies = useMemo(() => {
    const query = search.trim().toLowerCase()

    const filtered = !query
      ? [...speciesStats]
      : speciesStats.filter((item) => {
          const meta = metadataForSpecies(metadata, item.species)

          return (
            item.species.toLowerCase().includes(query) ||
            item.animalClass.toLowerCase().includes(query) ||
            String(meta.scientificName || "").toLowerCase().includes(query)
          )
        })

    return filtered.sort((a, b) => {
      const result = compareValues(a, b, sortConfig.key, metadata)
      return sortConfig.direction === "asc" ? result : -result
    })
  }, [metadata, search, sortConfig, speciesStats])

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
                Browse all species detected by the BowerBird nodes. Select any
                column heading to sort the table, then select a species to view
                occurrence statistics, recordings, and species information.
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
          Showing{" "}
          <span className="font-bold text-slate-800">{visibleSpecies.length}</span>{" "}
          detected species
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white">
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <SortableHeader
                  label="Species"
                  sortKey="species"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  className="sm:px-6"
                />

                <SortableHeader
                  label="Type"
                  sortKey="animalClass"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />

                <SortableHeader
                  label="Occurrences"
                  sortKey="count"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />

                <SortableHeader
                  label="Last detected"
                  sortKey="lastDetected"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />

                <SortableHeader
                  label="Avg. confidence"
                  sortKey="avgConfidence"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />

                <SortableHeader
                  label="Nodes"
                  sortKey="nodeCount"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />

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
                        {meta.scientificName ||
                          ""}
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

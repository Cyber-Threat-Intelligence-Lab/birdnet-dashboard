import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  Bird,
  CalendarDays,
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Database,
  ExternalLink,
  Gauge,
  Headphones,
  Image as ImageIcon,
  Info,
  MapPin,
  Music2,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { fetchSpeciesEnrichment } from "../utils/speciesEnrichment"

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

function resolveAsset(path) {
  if (!path) return ""
  if (/^https?:\/\//i.test(path)) return path

  const cleanPath = path.replace(/^\/+/, "")
  return `${import.meta.env.BASE_URL}${cleanPath}`
}

function formatDateTime(value) {
  if (!value) return "—"

  return new Date(value).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatExternalNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—"
  }

  return Number(value).toLocaleString()
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        <Icon size={16} />
        {label}
      </div>
      <div className="mt-3 text-2xl font-extrabold text-slate-900">{value}</div>
    </div>
  )
}

function DetailField({ title, value, fallback }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </div>
      <p className="mt-1 text-sm leading-6 text-slate-700">
        {value || fallback || "Not available."}
      </p>
    </div>
  )
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

function SortableHeader({ label, sortKey, sortConfig, onSort }) {
  const active = sortConfig.key === sortKey

  return (
    <th
      className="px-5 py-3"
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
        className="inline-flex items-center gap-1.5 transition hover:text-slate-900"
      >
        {label}
        <SortIcon active={active} direction={sortConfig.direction} />
      </button>
    </th>
  )
}

export default function SpeciesDetailPage({
  species,
  rows,
  speciesStat,
  metadata,
  onBackToSpecies,
  onBackToDashboard,
}) {
  const localDetails = metadataForSpecies(metadata, species)

  const [external, setExternal] = useState(null)
  const [externalLoading, setExternalLoading] = useState(true)
  const [externalError, setExternalError] = useState("")

  const [recentSort, setRecentSort] = useState({
    key: "ts",
    direction: "desc",
  })

  useEffect(() => {
    let cancelled = false

    const loadExternalSpeciesInfo = async () => {
      try {
        setExternalLoading(true)
        setExternalError("")

        const data = await fetchSpeciesEnrichment({
          speciesName: species,
          scientificName: localDetails.scientificName || "",
          inaturalistTaxonId: localDetails.inaturalistTaxonId || "",
          wikipediaTitle: localDetails.wikipediaTitle || "",
          animalClass: speciesStat?.animalClass || "",
        })

        if (!cancelled) {
          setExternal(data)
        }
      } catch (error) {
        if (!cancelled) {
          setExternal(null)
          setExternalError(
            error?.message || "External species information could not be loaded."
          )
        }
      } finally {
        if (!cancelled) {
          setExternalLoading(false)
        }
      }
    }

    loadExternalSpeciesInfo()

    return () => {
      cancelled = true
    }
  }, [
    species,
    speciesStat?.animalClass,
    localDetails.scientificName,
    localDetails.inaturalistTaxonId,
    localDetails.wikipediaTitle,
  ])

  const speciesRows = useMemo(
    () =>
      rows
        .filter((row) => row.species === species)
        .sort((a, b) => b.ts - a.ts),
    [rows, species]
  )

  const sortedRecentRows = useMemo(() => {
    const copied = [...speciesRows]

    copied.sort((a, b) => {
      let result = 0

      if (recentSort.key === "ts") {
        result = a.ts.getTime() - b.ts.getTime()
      } else if (recentSort.key === "device") {
        result = a.device.localeCompare(b.device, undefined, {
          sensitivity: "base",
        })
      } else if (recentSort.key === "confidence") {
        result = a.confidence - b.confidence
      }

      return recentSort.direction === "asc" ? result : -result
    })

    return copied
  }, [recentSort, speciesRows])

  const occurrenceData = useMemo(() => {
    const counts = new Map()

    speciesRows.forEach((row) => {
      const key = row.ts.toLocaleDateString("en-CA")
      counts.set(key, (counts.get(key) || 0) + 1)
    })

    return [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, count]) => ({
        date: new Date(`${date}T00:00:00`).toLocaleDateString([], {
          month: "short",
          day: "numeric",
        }),
        count,
      }))
  }, [speciesRows])

  const handleRecentSort = (key) => {
    setRecentSort((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        }
      }

      return {
        key,
        direction: key === "device" ? "asc" : "desc",
      }
    })
  }

  if (!speciesStat) {
    return (
      <div className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-7">
        <button
          type="button"
          onClick={onBackToSpecies}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to species
        </button>

        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-extrabold text-slate-900">Species not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            This species is not present in the current detection data.
          </p>
        </div>
      </div>
    )
  }

  const scientificName =
    localDetails.scientificName || external?.scientificName || ""

  const description = localDetails.description || external?.description || ""

  const conservationStatus =
    localDetails.conservationStatus || external?.conservationStatus || ""

  const imageUrl = localDetails.image
    ? resolveAsset(localDetails.image)
    : external?.imageUrl || ""

  const imageIsExternal = !localDetails.image && Boolean(external?.imageUrl)

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-7">
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onBackToSpecies}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to species
        </button>

        <button
          type="button"
          onClick={onBackToDashboard}
          className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          Dashboard
        </button>
      </div>

      <section className="mb-5 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="flex min-h-[290px] items-center justify-center bg-slate-100">
            {imageUrl ? (
              <div className="relative h-full min-h-[290px] w-full">
                <img
                  src={imageUrl}
                  alt={species}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {imageIsExternal &&
                  (external?.imageAttribution || external?.imageLicense) && (
                    <div className="absolute inset-x-0 bottom-0 bg-slate-950/70 px-3 py-2 text-[10px] leading-4 text-white">
                      {external.imageAttribution || "iNaturalist photo"}
                      {external.imageLicense ? ` · ${external.imageLicense}` : ""}
                    </div>
                  )}
              </div>
            ) : externalLoading ? (
              <div className="text-center text-slate-400">
                <ImageIcon size={56} className="mx-auto animate-pulse" />
                <div className="mt-3 text-sm font-semibold">
                  Loading species image...
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <Bird size={64} className="mx-auto" />
                <div className="mt-3 text-sm font-semibold">
                  No species image available
                </div>
              </div>
            )}
          </div>

          <div className="p-6 lg:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                {speciesStat.animalClass}
              </span>

              {externalLoading && (
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  Loading external species information...
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 lg:text-4xl">
              {species}
            </h1>

            <p className="mt-1 text-base italic text-slate-500">
              {scientificName || "Scientific name unavailable"}
            </p>

            <p className="mt-5 max-w-4xl text-sm leading-7 text-slate-600">
              {description ||
                (externalLoading
                  ? "Looking up species information from public biodiversity sources..."
                  : "No public species description was found. Detection statistics below are generated from BowerBird data.")}
            </p>

            {externalError && (
              <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
                {externalError}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={Bird}
          label="Occurrences"
          value={speciesStat.count.toLocaleString()}
        />

        <StatCard
          icon={CalendarDays}
          label="First detected"
          value={formatDateTime(speciesStat.firstDetected)}
        />

        <StatCard
          icon={CalendarDays}
          label="Last detected"
          value={formatDateTime(speciesStat.lastDetected)}
        />

        <StatCard
          icon={Gauge}
          label="Avg. confidence"
          value={`${Math.round(speciesStat.avgConfidence * 100)}%`}
        />

        <StatCard
          icon={Database}
          label="Nodes"
          value={speciesStat.nodeCount}
        />
      </section>

      <section className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-extrabold text-slate-900">
              Occurrence activity
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Detection count across the most recent 14 active days for this species.
            </p>
          </div>

          {occurrenceData.length ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occurrenceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FFD400" radius={[7, 7, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-20 text-center text-sm text-slate-500">
              No occurrence data available.
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Headphones size={19} className="text-yellow-700" />
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Sample audio
              </h2>
              <p className="text-sm text-slate-500">
                Temporary placeholder recordings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {(localDetails.audio || []).map((audio, index) => (
              <div
                key={`${audio.url}-${index}`}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Music2 size={16} />
                  {audio.title || `Sample recording ${index + 1}`}
                </div>

                <audio controls preload="none" className="w-full">
                  <source
                    src={resolveAsset(audio.url)}
                    type={audio.type || "audio/mpeg"}
                  />
                  Your browser does not support audio playback.
                </audio>
              </div>
            ))}

            {!localDetails.audio?.length && (
              <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                No audio samples are configured for this species.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Info size={18} className="text-slate-500" />
            <h2 className="text-lg font-extrabold text-slate-900">
              Species information
            </h2>
          </div>

          <div className="space-y-5">
            <DetailField
              title="Habitat"
              value={localDetails.habitat}
              fallback="No structured habitat information is configured yet."
            />

            <DetailField
              title="Behavior"
              value={localDetails.behavior}
              fallback="No structured behavior information is configured yet."
            />

            <DetailField
              title="Call description"
              value={localDetails.callDescription}
              fallback="No structured call description is configured yet."
            />

            <DetailField
              title="Conservation status"
              value={conservationStatus}
              fallback="No conservation status was returned by the available sources."
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <ExternalLink size={18} className="text-slate-500" />
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Public biodiversity information
              </h2>
              <p className="text-sm text-slate-500">
                Automatically loaded when a public match is available
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <span className="text-slate-500">Scientific name</span>
              <span className="text-right font-bold italic text-slate-900">
                {scientificName || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <span className="text-slate-500">Taxonomic group</span>
              <span className="text-right font-bold text-slate-900">
                {external?.taxonGroup || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <span className="text-slate-500">Taxon rank</span>
              <span className="text-right font-bold capitalize text-slate-900">
                {external?.taxonRank || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <span className="text-slate-500">iNaturalist observations</span>
              <span className="text-right font-bold text-slate-900">
                {formatExternalNumber(external?.observationsCount)}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              {external?.inaturalistUrl && (
                <a
                  href={external.inaturalistUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  iNaturalist
                  <ExternalLink size={13} />
                </a>
              )}

              {external?.wikipediaUrl && (
                <a
                  href={external.wikipediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Wikipedia
                  <ExternalLink size={13} />
                </a>
              )}
            </div>

            {!externalLoading && !external?.externalLookupMatched && (
              <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                No confident iNaturalist match was found. Add a scientific name or
                iNaturalist taxon ID to species_details.json to resolve ambiguous names.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <MapPin size={18} className="text-slate-500" />
          <h2 className="text-lg font-extrabold text-slate-900">
            BowerBird detection summary
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Detection class
            </div>
            <div className="mt-2 font-extrabold text-slate-900">
              {speciesStat.animalClass}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Total occurrences
            </div>
            <div className="mt-2 font-extrabold text-slate-900">
              {speciesStat.count.toLocaleString()}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Active nodes
            </div>
            <div className="mt-2 font-extrabold text-slate-900">
              {speciesStat.nodeCount}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Highest confidence
            </div>
            <div className="mt-2 font-extrabold text-slate-900">
              {Math.round(speciesStat.highestConfidence * 100)}%
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-extrabold text-slate-900">
            Recent detections
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest detection records for {species}. Select a column heading to sort.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <SortableHeader
                  label="Time"
                  sortKey="ts"
                  sortConfig={recentSort}
                  onSort={handleRecentSort}
                />

                <SortableHeader
                  label="Node"
                  sortKey="device"
                  sortConfig={recentSort}
                  onSort={handleRecentSort}
                />

                <SortableHeader
                  label="Confidence"
                  sortKey="confidence"
                  sortConfig={recentSort}
                  onSort={handleRecentSort}
                />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {sortedRecentRows.slice(0, 50).map((row, index) => (
                <tr key={`${row.ts.toISOString()}-${row.device}-${index}`}>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {formatDateTime(row.ts)}
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                    {row.device}
                  </td>

                  <td className="px-5 py-4 text-sm font-bold text-slate-700">
                    {Math.round(row.confidence * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!sortedRecentRows.length && (
            <div className="p-12 text-center text-sm text-slate-500">
              No detections are available for this species.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

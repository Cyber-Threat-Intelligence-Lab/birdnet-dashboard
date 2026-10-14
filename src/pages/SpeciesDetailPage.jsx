import { useMemo } from "react"
import {
  ArrowLeft,
  Bird,
  CalendarDays,
  Database,
  Gauge,
  Headphones,
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

function DetailField({ title, value }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </div>
      <p className="mt-1 text-sm leading-6 text-slate-700">
        {value || "Details will be provided by the client."}
      </p>
    </div>
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
  const details = metadataForSpecies(metadata, species)

  const speciesRows = useMemo(
    () => rows.filter((row) => row.species === species).sort((a, b) => b.ts - a.ts),
    [rows, species]
  )

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
          className="text-sm font-semibold text-slate-400 transition hover:text-slate-700"
        >
          Dashboard
        </button>
      </div>

      <section className="mb-5 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="flex min-h-[250px] items-center justify-center bg-slate-100">
            {details.image ? (
              <img
                src={resolveAsset(details.image)}
                alt={species}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center text-slate-400">
                <Bird size={64} className="mx-auto" />
                <div className="mt-3 text-sm font-semibold">Image placeholder</div>
              </div>
            )}
          </div>

          <div className="p-6 lg:p-8">
            <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
              {speciesStat.animalClass}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 lg:text-4xl">
              {species}
            </h1>
            <p className="mt-1 text-base italic text-slate-500">
              {details.scientificName || "Scientific name to be provided"}
            </p>
            <p className="mt-5 max-w-4xl text-sm leading-7 text-slate-600">
              {details.description ||
                "Species description will be provided by the client. The detection statistics below are generated from the BowerBird detection data."}
            </p>
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
            <h2 className="text-lg font-extrabold text-slate-900">Occurrence activity</h2>
            <p className="mt-1 text-sm text-slate-500">
              Detection count across the most recent 14 active days for this species.
            </p>
          </div>

          {occurrenceData.length ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occurrenceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
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
              <h2 className="text-lg font-extrabold text-slate-900">Sample audio</h2>
              <p className="text-sm text-slate-500">Temporary placeholder recordings</p>
            </div>
          </div>

          <div className="space-y-4">
            {(details.audio || []).map((audio, index) => (
              <div
                key={`${audio.url}-${index}`}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Music2 size={16} />
                  {audio.title || `Sample recording ${index + 1}`}
                </div>
                <audio controls preload="none" className="w-full">
                  <source src={resolveAsset(audio.url)} type={audio.type || "audio/mpeg"} />
                  Your browser does not support audio playback.
                </audio>
              </div>
            ))}

            {!details.audio?.length && (
              <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                Audio samples will be provided by the client.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-extrabold text-slate-900">Species information</h2>
          <div className="space-y-5">
            <DetailField title="Habitat" value={details.habitat} />
            <DetailField title="Behavior" value={details.behavior} />
            <DetailField title="Call description" value={details.callDescription} />
            <DetailField title="Conservation status" value={details.conservationStatus} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <MapPin size={18} className="text-slate-500" />
            <h2 className="text-lg font-extrabold text-slate-900">Detection summary</h2>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Detection class</span>
              <span className="font-bold text-slate-900">{speciesStat.animalClass}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Total occurrences</span>
              <span className="font-bold text-slate-900">{speciesStat.count.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Active nodes</span>
              <span className="font-bold text-slate-900">{speciesStat.nodeCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Highest confidence</span>
              <span className="font-bold text-slate-900">
                {Math.round(speciesStat.highestConfidence * 100)}%
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-extrabold text-slate-900">Recent detections</h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest detection records for {species}.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Node</th>
                <th className="px-5 py-3">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {speciesRows.slice(0, 12).map((row, index) => (
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
        </div>
      </section>
    </div>
  )
}

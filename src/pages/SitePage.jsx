import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  Bird,
  Cpu,
  MapPin,
  Radio,
  RefreshCw,
} from "lucide-react"

const DEFAULT_SITE = {
  name: "Smithfield Lake, UNSW",
  latitude: null,
  longitude: null,
  description:
    "A network of Raspberry Pi-based acoustic monitoring devices running BirdNET has been deployed around Smithfield Lake, UNSW, to support passive acoustic biodiversity monitoring.",
}

function buildMapUrl(latitude, longitude) {
  const lat = Number(latitude)
  const lon = Number(longitude)

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return ""

  const latDelta = 0.006
  const lonDelta = 0.009
  const bbox = [
    lon - lonDelta,
    lat - latDelta,
    lon + lonDelta,
    lat + latDelta,
  ].join(",")

  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lon}`)}`
}

export default function SitePage({ onBackToDashboard }) {
  const [site, setSite] = useState(DEFAULT_SITE)

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/site_details.json?t=${Date.now()}`

    fetch(url, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Site details unavailable")
        return response.json()
      })
      .then((data) => setSite({ ...DEFAULT_SITE, ...(data || {}) }))
      .catch(() => setSite(DEFAULT_SITE))
  }, [])

  const mapUrl = useMemo(
    () => buildMapUrl(site.latitude, site.longitude),
    [site.latitude, site.longitude]
  )

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-7">
      <button
        type="button"
        onClick={onBackToDashboard}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Back to dashboard
      </button>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-800">
            <MapPin size={23} />
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-wide text-yellow-700">
              Monitoring testbed
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              {site.name}
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
              {site.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-extrabold text-slate-900">Testbed map</h2>
            <p className="mt-1 text-sm text-slate-500">
              Public map view of the acoustic monitoring location.
            </p>
          </div>

          {mapUrl ? (
            <iframe
              title={`${site.name} map`}
              src={mapUrl}
              className="h-[480px] w-full border-0"
              loading="lazy"
            />
          ) : (
            <div className="flex h-[420px] flex-col items-center justify-center bg-slate-50 px-6 text-center">
              <MapPin size={36} className="text-slate-300" />
              <div className="mt-4 font-bold text-slate-700">
                Map coordinates are ready to be configured
              </div>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                Add the latitude and longitude from the testbed documentation to
                public/data/site_details.json. The OpenStreetMap view will then
                appear here automatically.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <Radio size={21} className="text-blue-600" />
            <h3 className="mt-3 font-extrabold text-slate-900">
              Passive acoustic sensing
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Acoustic devices continuously monitor the local soundscape and
              BirdNET is used to identify species from vocalisations and other
              detectable sounds.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <Cpu size={21} className="text-violet-600" />
            <h3 className="mt-3 font-extrabold text-slate-900">
              Edge monitoring nodes
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              The testbed uses Raspberry Pi-based devices as distributed
              acoustic monitoring nodes around the deployment site.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <RefreshCw size={21} className="text-emerald-600" />
            <h3 className="mt-3 font-extrabold text-slate-900">
              Daily dashboard updates
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Processed observations are incorporated into the public dashboard
              on a 24-hour refresh cycle.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Bird size={19} className="text-yellow-700" />
          <h2 className="font-extrabold text-slate-900">What the site observes</h2>
        </div>
        <p className="mt-3 max-w-5xl text-sm leading-7 text-slate-600">
          The monitoring system is designed to support observation of Australian
          biodiversity around the testbed, including birds, mammals, insects and
          other acoustically identifiable fauna. Dashboard views focus on the
          temporal patterns and frequency of detected wildlife activity.
        </p>
      </section>
    </div>
  )
}

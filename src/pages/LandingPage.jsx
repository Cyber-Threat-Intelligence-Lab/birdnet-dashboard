import { useEffect, useMemo, useState } from "react"
import Lottie from "lottie-react"
import {
  ArrowRight,
  Bird,
  Clock3,
  Cpu,
  Database,
  ExternalLink,
  MapPin,
  Microscope,
  Radio,
  RefreshCw,
  Users,
} from "lucide-react"
import animationData from "../assets/logo.json"
import PublicFooter from "../components/PublicFooter"
import { PORTAL_TITLE } from "../constants/branding"

const DEFAULT_SITE = {
  name: "Smithfield Lake, UNSW",
  latitude: null,
  longitude: null,
  description:
    "A network of Raspberry Pi-based acoustic monitoring devices running BirdNET has been deployed around Smithfield Lake, UNSW, to support passive acoustic biodiversity monitoring.",
}

const DEFAULT_TEAM = {
  projectLead: {
    name: "Professor Will Cornwell",
    role: "Project Lead CI",
    affiliation:
      "School of Biological, Earth & Environmental Sciences (BEES), UNSW Sydney",
    profileUrl: "https://www.unsw.edu.au/staff/will-cornwell",
    bio: "Professor Will Cornwell is an ecologist in UNSW Sydney's School of Biological, Earth & Environmental Sciences. His research spans plant eco-physiology, community ecology and ecosystem ecology, with a strong focus on biodiversity, conservation and quantitative approaches to understanding ecological change.",
  },
  chiefInvestigator: {
    name: "Associate Professor Arash Shaghaghi",
    role: "Chief Investigator",
    affiliation:
      "Cyber Threat Intelligence Lab, School of Computer Science and Engineering (CSE), UNSW Sydney",
    profileUrl: "https://www.unsw.edu.au/staff/arash-shaghaghi",
    bio: "Associate Professor Arash Shaghaghi is a cybersecurity researcher and founder of the Cyber Threat Intelligence Lab at UNSW Sydney. His research includes cybersecurity and privacy, system and network security, and data security and protection.",
  },
  developers: [],
}

function resolvePublicAsset(value) {
  if (!value) return ""
  if (/^https?:\/\//i.test(value)) return value
  return `${import.meta.env.BASE_URL}${String(value).replace(/^\/+/, "")}`
}

function UNSWMark({ dark = true, className = "h-14" }) {
  const [failed, setFailed] = useState(false)
  const configuredLogo = import.meta.env.VITE_UNSW_LOGO || "UNSW-logo.png"
  const logoUrl = resolvePublicAsset(configuredLogo)

  if (failed) {
    return (
      <div
        className={`font-extrabold tracking-tight ${
          dark ? "text-white" : "text-slate-900"
        }`}
      >
        UNSW Sydney
      </div>
    )
  }

  return (
    <img
      src={logoUrl}
      alt="UNSW Sydney"
      className={`${className} w-auto object-contain`}
      onError={() => setFailed(true)}
    />
  )
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

function PersonCard({ person }) {
  if (!person) return null

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-lg font-black text-yellow-900">
        {person.name
          .split(" ")
          .filter(Boolean)
          .slice(-2)
          .map((part) => part[0])
          .join("")}
      </div>

      <h3 className="mt-4 text-xl font-extrabold text-slate-900">
        {person.name}
      </h3>
      <div className="mt-1 text-sm font-bold text-yellow-700">
        {person.role}
      </div>
      <div className="mt-2 text-sm leading-6 text-slate-500">
        {person.affiliation}
      </div>

      {person.bio && (
        <p className="mt-4 text-sm leading-7 text-slate-600">{person.bio}</p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {person.profileUrl && (
          <a
            href={person.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Profile
            <ExternalLink size={15} />
          </a>
        )}
      </div>
    </article>
  )
}

export default function LandingPage({ onEnter }) {
  const [site, setSite] = useState(DEFAULT_SITE)
  const [team, setTeam] = useState(DEFAULT_TEAM)

  const fundingAgency = import.meta.env.VITE_FUNDING_AGENCY || ""
  const fundingLogo = import.meta.env.VITE_FUNDING_LOGO || ""

  useEffect(() => {
    const siteUrl = `${import.meta.env.BASE_URL}data/site_details.json?t=${Date.now()}`
    const teamUrl = `${import.meta.env.BASE_URL}data/team_details.json?t=${Date.now()}`

    fetch(siteUrl, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Site details unavailable")
        return response.json()
      })
      .then((data) => setSite({ ...DEFAULT_SITE, ...(data || {}) }))
      .catch(() => setSite(DEFAULT_SITE))

    fetch(teamUrl, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Team details unavailable")
        return response.json()
      })
      .then((data) =>
        setTeam({
          ...DEFAULT_TEAM,
          ...(data || {}),
          projectLead: {
            ...DEFAULT_TEAM.projectLead,
            ...(data?.projectLead || {}),
          },
          chiefInvestigator: {
            ...DEFAULT_TEAM.chiefInvestigator,
            ...(data?.chiefInvestigator || {}),
          },
          developers: Array.isArray(data?.developers) ? data.developers : [],
        })
      )
      .catch(() => setTeam(DEFAULT_TEAM))
  }, [])

  const mapUrl = useMemo(
    () => buildMapUrl(site.latitude, site.longitude),
    [site.latitude, site.longitude]
  )

  return (
    <div className="min-h-screen bg-[#E9EDF1] text-slate-900">
      <section className="relative overflow-hidden bg-[#111827] text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-yellow-400 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-blue-500 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-[1450px] gap-10 px-6 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-10 lg:py-16">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <UNSWMark />
              <div className="h-9 w-px bg-slate-600" />
              <div>
                <div className="text-sm font-semibold text-slate-300">
                  UNSW Sydney research project
                </div>
                <div className="text-xs text-slate-500">
                  BEES × Cyber Threat Intelligence Lab, CSE
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-yellow-300 ring-1 ring-yellow-400/25">
              <Microscope size={14} />
              Passive acoustic biodiversity monitoring
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              {PORTAL_TITLE}
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              This UNSW Sydney research portal explores biodiversity detected
              through a network of Raspberry Pi-based acoustic monitoring
              devices running BirdNET around Smithfield Lake. It brings together
              processed wildlife detections, temporal activity patterns and
              contextual species information in one public dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onEnter}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FFD400] px-5 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-yellow-500/10 transition hover:bg-yellow-300"
              >
                Explore dashboard
                <ArrowRight size={17} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative flex h-[340px] w-[340px] items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 sm:h-[390px] sm:w-[390px]">
              <div className="absolute inset-8 rounded-full bg-yellow-400/10 blur-2xl" />
              <Lottie
                animationData={animationData}
                loop
                autoplay
                className="relative h-[300px] w-[300px] sm:h-[350px] sm:w-[350px]"
                style={{ background: "transparent" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1450px] px-6 py-10 lg:px-10">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <Bird className="text-yellow-600" size={22} />
            <div className="mt-4 text-sm font-extrabold text-slate-900">
              Biodiversity observations
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Explore automated detections of birds, mammals, insects and other
              identifiable fauna captured by the acoustic monitoring system.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <Clock3 className="text-blue-600" size={22} />
            <div className="mt-4 text-sm font-extrabold text-slate-900">
              Daily data refresh
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Detection data are refreshed every 24 hours. This portal is not a
              live feed, so newly processed observations are incorporated on the
              next scheduled refresh.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <MapPin className="text-emerald-600" size={22} />
            <div className="mt-4 text-sm font-extrabold text-slate-900">
              Smithfield Lake testbed
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Raspberry Pi-based acoustic monitoring devices are deployed around
              the Smithfield Lake testbed to observe wildlife activity over time.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <Database className="text-violet-600" size={22} />
            <div className="mt-4 text-sm font-extrabold text-slate-900">
              Research portal
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              The portal supports research exploration of temporal biodiversity
              patterns and is not intended to replace validated ecological
              survey records.
            </p>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-yellow-700">
              <MapPin size={17} />
              Monitoring testbed
            </div>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
              {site.name}
            </h2>
            <p className="mt-3 max-w-5xl text-sm leading-7 text-slate-600">
              {site.description}
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
            <div className="min-h-[430px] bg-slate-50">
              {mapUrl ? (
                <iframe
                  title={`${site.name} map`}
                  src={mapUrl}
                  className="h-[430px] w-full border-0"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-[430px] flex-col items-center justify-center px-6 text-center">
                  <MapPin size={38} className="text-slate-300" />
                  <div className="mt-4 font-bold text-slate-700">
                    Testbed map
                  </div>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    The map will appear here once the project testbed coordinates
                    are added to the site configuration.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <Radio size={20} className="text-blue-600" />
                <h3 className="mt-3 font-extrabold text-slate-900">
                  Passive acoustic sensing
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Monitoring devices collect the local soundscape and BirdNET is
                  used to identify species from vocalisations and other
                  detectable sounds.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <Cpu size={20} className="text-violet-600" />
                <h3 className="mt-3 font-extrabold text-slate-900">
                  Edge monitoring nodes
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Raspberry Pi-based nodes provide distributed acoustic sensing
                  around the monitoring site.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <RefreshCw size={20} className="text-emerald-600" />
                <h3 className="mt-3 font-extrabold text-slate-900">
                  24-hour data refresh
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Processed observations are incorporated into the public portal
                  once every 24 hours rather than being streamed live.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center gap-2">
            <Users size={20} className="text-yellow-700" />
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Project team
              </h2>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <PersonCard person={team.projectLead} />
            <PersonCard person={team.chiefInvestigator} />
          </div>

          <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-extrabold text-slate-900">
              Development team
            </h3>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-600">
              Researchers and developers from the CTI Lab and collaborating UNSW
              teams maintain the sensing, processing and dashboard infrastructure
              used by the project.
            </p>

            {team.developers.length > 0 && (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {team.developers.map((developer) => (
                  <PersonCard key={developer.name} person={developer} />
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900">
              Project collaboration
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The project brings together the School of Biological, Earth &amp;
              Environmental Sciences and the Cyber Threat Intelligence Lab in
              the School of Computer Science and Engineering at UNSW Sydney.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900">
              Funding acknowledgement
            </h2>
            {fundingAgency ? (
              <div className="mt-4">
                {fundingLogo && (
                  <img
                    src={resolvePublicAsset(fundingLogo)}
                    alt={fundingAgency}
                    className="mb-3 h-12 w-auto object-contain"
                  />
                )}
                <p className="text-sm leading-6 text-slate-600">
                  This research acknowledges support from {fundingAgency}.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Funding acknowledgement will be added when the project funding
                details are confirmed.
              </p>
            )}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

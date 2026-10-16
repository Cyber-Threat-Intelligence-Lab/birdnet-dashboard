import { useEffect, useState } from "react"
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  Users,
} from "lucide-react"

const DEFAULT_TEAM = {
  projectLead: {
    name: "Professor Will Cornwell",
    role: "Project Lead CI",
    affiliation: "School of Biological, Earth & Environmental Sciences (BEES), UNSW Sydney",
    email: "w.cornwell@unsw.edu.au",
    profileUrl: "https://www.unsw.edu.au/staff/will-cornwell",
    bio: "Professor Will Cornwell is an ecologist in UNSW Sydney's School of Biological, Earth & Environmental Sciences. His research spans plant eco-physiology, community ecology and ecosystem ecology, with a strong focus on biodiversity, conservation and quantitative approaches to understanding ecological change.",
  },
  chiefInvestigator: {
    name: "Associate Professor Arash Shaghaghi",
    role: "Chief Investigator",
    affiliation: "Cyber Threat Intelligence Lab, School of Computer Science and Engineering (CSE), UNSW Sydney",
    email: "a.shaghaghi@unsw.edu.au",
    profileUrl: "https://www.unsw.edu.au/staff/arash-shaghaghi",
    bio: "Associate Professor Arash Shaghaghi is a cybersecurity researcher and founder of the Cyber Threat Intelligence Lab at UNSW Sydney. His research includes cybersecurity and privacy, system and network security, and data security and protection.",
  },
  developers: [],
}

function PersonCard({ person }) {
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

      <h2 className="mt-4 text-xl font-extrabold text-slate-900">
        {person.name}
      </h2>
      <div className="mt-1 text-sm font-bold text-yellow-700">{person.role}</div>
      <div className="mt-2 text-sm leading-6 text-slate-500">
        {person.affiliation}
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-600">{person.bio}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        {person.email && (
          <a
            href={`mailto:${person.email}`}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            <Mail size={16} />
            {person.email}
          </a>
        )}

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

export default function TeamPage({ onBackToDashboard }) {
  const [team, setTeam] = useState(DEFAULT_TEAM)

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/team_details.json?t=${Date.now()}`

    fetch(url, { cache: "no-store" })
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

  const fundingAgency = import.meta.env.VITE_FUNDING_AGENCY || ""
  const unswLogo = import.meta.env.VITE_UNSW_LOGO || ""
  const unswLogoUrl = unswLogo
    ? unswLogo.startsWith("http")
      ? unswLogo
      : `${import.meta.env.BASE_URL}${unswLogo.replace(/^\/+/, "")}`
    : ""

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
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-yellow-700">
              <Users size={17} />
              Research team
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Project team and contacts
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
              BowerBird is a collaboration between the School of Biological,
              Earth &amp; Environmental Sciences and the Cyber Threat Intelligence
              Lab in the School of Computer Science and Engineering at UNSW
              Sydney. For project enquiries, contact the investigators below.
            </p>
          </div>

          <div className="shrink-0">
            {unswLogoUrl ? (
              <img
                src={unswLogoUrl}
                alt="UNSW Sydney"
                className="h-16 w-auto object-contain"
              />
            ) : (
              <div className="text-lg font-extrabold tracking-tight text-slate-900">
                UNSW Sydney
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <PersonCard person={team.projectLead} />
        <PersonCard person={team.chiefInvestigator} />
      </section>

      <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900">
          Development team
        </h2>
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
      </section>

      <section className="mt-5 rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
        <h2 className="text-xl font-extrabold">Acknowledgements</h2>
        <p className="mt-3 max-w-5xl text-sm leading-7 text-slate-300">
          We acknowledge BirdNET for the acoustic species identification
          technology used by the monitoring system. We also thank iNaturalist
          and its community of observers, photographers and contributors for
          species imagery and supporting information used to enrich the public
          portal.
        </p>
        {fundingAgency && (
          <p className="mt-3 text-sm leading-7 text-slate-300">
            This research acknowledges support from {fundingAgency}.
          </p>
        )}
      </section>
    </div>
  )
}

import { useState } from "react"
import { PORTAL_TITLE } from "../constants/branding"

function resolvePublicAsset(value) {
  if (!value) return ""
  if (/^https?:\/\//i.test(value)) return value
  return `${import.meta.env.BASE_URL}${String(value).replace(/^\/+/, "")}`
}

function UNSWMark({ className = "h-10" }) {
  const [failed, setFailed] = useState(false)
  const configuredLogo = import.meta.env.VITE_UNSW_LOGO || "UNSW-logo.png"

  if (failed) {
    return (
      <div className="text-sm font-extrabold tracking-tight text-white">
        UNSW Sydney
      </div>
    )
  }

  return (
    <img
      src={resolvePublicAsset(configuredLogo)}
      alt="UNSW Sydney"
      className={`${className} w-auto object-contain`}
      onError={() => setFailed(true)}
    />
  )
}

export default function PublicFooter() {
  const fundingAgency = import.meta.env.VITE_FUNDING_AGENCY || ""
  const fundingLogo = import.meta.env.VITE_FUNDING_LOGO || ""

  return (
    <footer className="border-t border-slate-700 bg-[#111827] text-slate-300">
      <div className="mx-auto max-w-[1650px] px-5 py-8 sm:px-7">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-4">
              <UNSWMark />
              <div>
                <div className="font-extrabold text-white">{PORTAL_TITLE}</div>
                <div className="mt-1 text-xs text-slate-400">
                  UNSW Sydney biodiversity research portal
                </div>
              </div>
            </div>

            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
              {PORTAL_TITLE} is a UNSW Sydney research project. The dashboard presents
              automated acoustic detections for research and exploratory use.
              Automated classifications may contain errors and should not be
              treated as authoritative biodiversity records.
            </p>
          </div>

          <div>
            <div className="text-sm font-extrabold text-white">
              Project collaboration
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              School of Biological, Earth &amp; Environmental Sciences (BEES)
              and the Cyber Threat Intelligence Lab, School of Computer Science
              and Engineering (CSE), UNSW Sydney.
            </p>
          </div>

          <div>
            <div className="text-sm font-extrabold text-white">
              Acknowledgements
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              We acknowledge BirdNET for acoustic species identification and
              iNaturalist and its community for species imagery and supporting
              information used to enrich the portal.
            </p>

            {fundingAgency && (
              <div className="mt-4">
                {fundingLogo && (
                  <img
                    src={resolvePublicAsset(fundingLogo)}
                    alt={fundingAgency}
                    className="mb-2 h-9 w-auto object-contain"
                  />
                )}
                <p className="text-sm leading-6 text-slate-400">
                  This research acknowledges support from {fundingAgency}.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-7 border-t border-slate-700 pt-5 text-xs leading-5 text-slate-500">
          © {new Date().getFullYear()} UNSW Sydney. Research project website.
          Data and automated species detections are provided for research and
          informational purposes.
        </div>
      </div>
    </footer>
  )
}

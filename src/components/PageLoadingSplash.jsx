import Lottie from "lottie-react"
import animationData from "../assets/logo.json"
import { PORTAL_TITLE } from "../constants/branding"

export default function PageLoadingSplash({ visible }) {
  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#111827] px-6 text-white"
      role="status"
      aria-live="polite"
      aria-label={`Loading ${PORTAL_TITLE}`}
    >
      <div className="flex flex-col items-center text-center">
        <Lottie
          animationData={animationData}
          loop
          autoplay
          className="h-56 w-56 sm:h-64 sm:w-64"
          style={{ background: "transparent" }}
        />

        <div className="mt-4 max-w-2xl">
          <h1 className="text-xl font-extrabold leading-tight tracking-tight text-[#FFD400] sm:text-2xl">
            {PORTAL_TITLE}
          </h1>

          <p className="mt-3 text-sm text-slate-300">
            Loading biodiversity monitoring data...
          </p>
        </div>
      </div>
    </div>
  )
}
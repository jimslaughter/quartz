import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Comments: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const slug = fileData.slug ?? ""
  if (slug === "index") return null
  if (fileData.frontmatter?.comments === false) return null

  const identifier = slug
  const reference = (fileData.frontmatter?.title as string) ?? slug

  return (
    <div
      id="comments-wrapper"
      data-cmtx-identifier={identifier}
      data-cmtx-reference={reference}
      style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--lightgray);"
    >
      <div id="commentics"></div>
    </div>
  )
}
Comments.displayName = "Comments"

Comments.afterDOMLoaded = `
(function () {
  // Guards against the reentrancy loop: embed.js only builds the comments
  // iframe inside a window "load" listener, so we dispatch a synthetic
  // "load" after injecting it via SPA nav. But that synthetic "load" can
  // itself cause another "nav"-like cycle to fire (from Quartz's router or
  // from embed.js reacting to "load"), which re-runs this handler, which
  // re-dispatches "load" again -- an infinite loop. This flag lets the
  // handler recognize "this nav event was caused by our own synthetic
  // dispatch" and skip re-processing it.
  let awaitingOwnLoadEcho = false
  let echoResetTimer = null

  document.addEventListener("nav", () => {
    if (awaitingOwnLoadEcho) {
      console.log("[commentics] ignoring nav event triggered by our own synthetic load dispatch")
      awaitingOwnLoadEcho = false
      if (echoResetTimer) {
        clearTimeout(echoResetTimer)
        echoResetTimer = null
      }
      return
    }

    console.log("[commentics] nav fired, path:", window.location.pathname)

    const wrapper = document.getElementById("comments-wrapper")
    if (!wrapper) {
      console.log("[commentics] no wrapper found, bailing")
      return
    }
    console.log("[commentics] wrapper found:", wrapper.dataset.cmtxIdentifier)

    const target = document.getElementById("commentics")
    if (target) target.innerHTML = ""

    window.commentics_config = {
      identifier: wrapper.dataset.cmtxIdentifier,
      reference: wrapper.dataset.cmtxReference,
    }
    console.log("[commentics] config set:", window.commentics_config)

    const oldScript = document.getElementById("cmtx-embed-script")
    if (oldScript) oldScript.remove()

    const script = document.createElement("script")
    script.id = "cmtx-embed-script"
    script.src = "https://jimslaughter.net/commentics/embed.js"
    script.onload = () => {
      console.log("[commentics] embed.js loaded successfully, dispatching synthetic load event")
      // Arm the guard right before dispatching, so the very next "nav"
      // this triggers gets recognized as our own echo and ignored.
      awaitingOwnLoadEcho = true
      // Safety net: if nothing follows within 2s, disarm so a real future
      // nav isn't accidentally swallowed.
      echoResetTimer = setTimeout(() => {
        awaitingOwnLoadEcho = false
        echoResetTimer = null
      }, 2000)
      window.dispatchEvent(new Event("load"))
    }
    script.onerror = (err) => console.log("[commentics] embed.js FAILED to load", err)
    document.body.appendChild(script)
    console.log("[commentics] script tag appended")
  })
})()
`
export default (() => Comments) satisfies QuartzComponentConstructor

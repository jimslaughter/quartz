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
document.addEventListener("nav", () => {
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
    // embed.js only builds the comments iframe inside a window "load" listener.
    // That event already fired for the real page load, long before this script
    // was injected via SPA navigation, so we fire a synthetic one to trigger it.
    window.dispatchEvent(new Event("load"))
  }
  script.onerror = (err) => console.log("[commentics] embed.js FAILED to load", err)
  document.body.appendChild(script)
  console.log("[commentics] script tag appended")
})
`
export default (() => Comments) satisfies QuartzComponentConstructor

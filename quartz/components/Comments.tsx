import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Comments: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const slug = fileData.slug ?? ""
  if (slug === "index") return null

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
  const wrapper = document.getElementById("comments-wrapper")
  if (!wrapper) return

  // clear out whatever was rendered for the previous page
  const target = document.getElementById("commentics")
  if (target) target.innerHTML = ""

  window.commentics_config = {
    identifier: wrapper.dataset.cmtxIdentifier,
    reference: wrapper.dataset.cmtxReference,
  }

  // remove the old script so a fresh one actually re-executes
  const oldScript = document.getElementById("cmtx-embed-script")
  if (oldScript) oldScript.remove()

  const script = document.createElement("script")
  script.id = "cmtx-embed-script"
  script.src = "https://jimslaughter.net/commentics/embed.js"
  document.body.appendChild(script)
})
`

export default (() => Comments) satisfies QuartzComponentConstructor
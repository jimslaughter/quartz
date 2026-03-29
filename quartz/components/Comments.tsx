import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Comments: QuartzComponent = ({ fileData, cfg }: QuartzComponentProps) => {
  const slug = fileData.slug ?? ""
  if (slug === "index") return null

  const identifier = slug
  const reference = (fileData.frontmatter?.title as string) ?? slug

  // Escape single quotes in case the title contains one
  const safeReference = reference.replace(/'/g, "\\'")

  return (
    <div class="comments-wrapper" style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--lightgray);">
      <script
        dangerouslySetInnerHTML={{
          __html: `
            var commentics_config = {
              'identifier': '${identifier}',
              'reference' : '${safeReference}'
            };
          `,
        }}
      />
      <script src="//jimslaughter.net/commentics/embed.js" />
      <div id="commentics"></div>
    </div>
  )
}

Comments.displayName = "Comments"
export default (() => Comments) satisfies QuartzComponentConstructor
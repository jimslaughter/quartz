import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { Options as ExplorerOptions } from "./quartz/components/ExplorerNode"
// Uses classic Quartz v4's FileNode API (a.file / a.file.dates),
// not the newer community-plugin FileTrieNode API (a.isFolder / a.data)

const sortByDate: ExplorerOptions["sortFn"] = (a, b) => {
  // both are files or both are folders
  if ((!a.file && !b.file) || (a.file && b.file)) {
    if (a.file && b.file) {
      const aCreated = a.file.dates?.created
      const bCreated = b.file.dates?.created
      const aModified = a.file.dates?.modified
      const bModified = b.file.dates?.modified

      const aDate = aCreated ?? aModified
      const bDate = bCreated ?? bModified

      if (aDate && bDate) {
        const diff = bDate.getTime() - aDate.getTime()
        if (diff !== 0) return diff
        // tied on created date (likely same calendar day, no time set) —
        // use the git-derived modified timestamp as a tiebreaker, since
        // it has full time-of-day precision reflecting publish order
        if (aModified && bModified) {
          const modDiff = bModified.getTime() - aModified.getTime()
          if (modDiff !== 0) return modDiff
        }
        // still tied: fall through to alphabetical below
      } else if (aDate && !bDate) {
        return -1 // dated files always sort before undated ones
      } else if (!aDate && bDate) {
        return 1
      }
      // neither has a date: fall through to alphabetical
    }
    // both folders (or files with no date, or tied dates): alphabetical
    return a.displayName.localeCompare(b.displayName, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  }
  // folders before files
  if (a.file && !b.file) return 1
  else return -1
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.Comments(),
  ],
  footer: Component.Footer({
    links: {},
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer({ title: "Posts", sortFn: sortByDate }),
  ],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({ title: "Posts", sortFn: sortByDate }),
  ],
  right: [],
}

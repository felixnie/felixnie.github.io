import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.Comments({
      provider: 'giscus',
      options: {
        // from data-repo
        repo: 'felixnie/draftz',
        // from data-repo-id
        repoId: 'R_kgDON9S7xw',
        // from data-category
        category: 'Announcements',
        // from data-category-id
        categoryId: 'DIC_kwDON9S7x84CnPzm',
        // how to map pages -> discussions
        // defaults to 'url'
        mapping: 'pathname',
      }
    }),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/felixnie/draftz",
      Quartz: "https://github.com/jackyzha0/quartz",
      Homepage: "https://felixnie.com",
      "Control Panel": "https://home.felixnie.com",
      Status: "https://status.felixnie.com",
      CV: "https://url.felixnie.com/cv",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.Explorer({
      // mod: omit pages
      filterFn: (node) => {
        const omit = new Set(["tags", "clippings", "being-mortal"])
        console.log("[debug - single page - filterFn]", node.name)
        return !omit.has(node.name.toLowerCase())
      },
    }),
  ],
  right: [
    Component.Graph(),
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
    Component.Search(),
    Component.Darkmode(),
    Component.Explorer({
      // mod: omit pages
      filterFn: (node) => {
        const omit = new Set(["tags", "clippings", "being-mortal"])
        console.log("[debug - list of pages - filterFn]", node.name)
        return !omit.has(node.name.toLowerCase())
      },
    }),
  ],
  right: [],
}

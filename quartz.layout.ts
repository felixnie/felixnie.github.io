import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// mod: define Explorer functions
import { Options } from "./quartz/components/Explorer"
 
export const mapFn: Options["mapFn"] = (node) => {
  return node
}
export const filterFn: Options["filterFn"] = (node) => {
  // mod: debug
  // console.log(node.data?.title)
  // console.log(node.slugSegment)
  // console.log(node.slug)
  // console.log(node.data?.frontmatter?.order)

  // mod: items filtered out at indexing stage won't appear now
  //      edit rules in contentIndex
  //      fall back to default filter
  return node.slugSegment !== "tags"

  // mod: old way of filtering, based on:
  //      node.data?.title - "being mortal"
  //      node.slugSegment - "being-mortal"
  //      seems it cannot filter out folder, e.g., "Clippings"
  const omit = new Set(["tags", "clippings", "being mortal"])
  return !omit.has((node.data?.title ?? "").toLowerCase())
}
export const sortFn: Options["sortFn"] = (a, b) => {
  // mod: find ways to retrieve order from frontmatter
  //      need to include frontmatter in ContentDetails and linkIndex.set()
  const orderA = a.data?.frontmatter?.order as number | undefined;
  const orderB = b.data?.frontmatter?.order as number | undefined;

  if (orderA !== undefined && orderB !== undefined) {
    return orderA - orderB;
  } else if (orderA !== undefined) {
    return -1;
  } else if (orderB !== undefined) {
    return 1;
  } else {
    return a.displayName.localeCompare(b.displayName);
  }
}

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
      "FelixNie.com": "https://felixnie.com",
      Services: "https://home.felixnie.com",
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
      folderDefaultState: "open",
      folderClickBehavior: "collapse",
      useSavedState: false,
      mapFn,
      filterFn,
      sortFn,
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
      folderDefaultState: "open",
      folderClickBehavior: "collapse",
      useSavedState: false,
      mapFn,
      filterFn,
      sortFn,
    }),
  ],
  right: [],
}

import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// mod: define Explorer functions
import { Options } from "./quartz/components/Explorer"

export const mapFn: Options["mapFn"] = (node) => {
  return node
}
export const filterFn: Options["filterFn"] = (node) => {
  // mod: items filtered out at indexing stage won't appear now
  //      edit filter in contentIndex if you want to change rules
  return node.slugSegment !== "tags"
}
export const sortFn: Options["sortFn"] = (a, b) => {
  // mod: sort folders and files based on folder_order and order
  //      to find ways to retrieve folder_order and order from frontmatter
  //      we now have to include frontmatter in ContentDetails and linkIndex.set()

  // extract order from frontmatter
  const orderA = a.isFolder
    ? a.data?.frontmatter?.folder_order as number | undefined
    : a.data?.frontmatter?.order as number | undefined
  const orderB = b.isFolder
    ? b.data?.frontmatter?.folder_order as number | undefined
    : b.data?.frontmatter?.order as number | undefined

  // // method I: folders first, then files
  // // compare orderA and orderB, those undefined will be placed at the end
  // if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
  //   if (orderA !== undefined && orderB !== undefined) {
  //     return orderA - orderB;
  //   } else if (orderA !== undefined) {
  //     return -1;
  //   } else if (orderB !== undefined) {
  //     return 1;
  //   } else {
  //     // fall back to alphabetical order
  //     return a.displayName.localeCompare(b.displayName);
  //   }
  // }
  // if (!a.isFolder && b.isFolder) {
  //   return 1
  // } else {
  //   return -1
  // }

  // method II: sort folders together with files, treat folders as files
  // compare orderA and orderB, those undefined will be placed at the end
  if (orderA !== undefined && orderB !== undefined) {
    return orderA - orderB
  } else if (orderA !== undefined) {
    return -1
  } else if (orderB !== undefined) {
    return 1
  } else {
    // fall back to alphabetical order, treat folders as files
    return a.displayName.localeCompare(b.displayName)
  }
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.Comments({
      provider: "giscus",
      options: {
        // from data-repo
        repo: "felixnie/draftz",
        // from data-repo-id
        repoId: "R_kgDON9S7xw",
        // from data-category
        category: "Announcements",
        // from data-category-id
        categoryId: "DIC_kwDON9S7x84CnPzm",
        // how to map pages -> discussions
        // defaults to 'url'
        mapping: "pathname",
      },
    }),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/felixnie",
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

import { QuartzTransformerPlugin } from "../types"
import { rehypeImageLinks } from "@bradgarropy/rehype-image-links"

export const ImageLinks: QuartzTransformerPlugin = () => {
  return {
    name: "ImageLinks",
    htmlPlugins() {
      return [
        [
          rehypeImageLinks,
          {
            target: "_blank",
            rel: "noopener noreferrer",
            className: "image-link",
          },
        ],
      ]
    },
  }
}

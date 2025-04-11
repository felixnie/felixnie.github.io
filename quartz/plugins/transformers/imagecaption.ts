import rehypeImageCaption from "rehype-image-caption"
import { QuartzTransformerPlugin } from "../types"

export const ImageCaptions: QuartzTransformerPlugin = () => {
  return {
    name: "FigureCaptions",
    htmlPlugins() {
      return [[rehypeImageCaption]]
    },
  }
}

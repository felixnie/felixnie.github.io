import { QuartzTransformerPlugin } from "../types"
import rehypeImageResize from "rehype-image-resize"
import type { TransformerArgs, TransformerResult } from "rehype-image-resize"

const transformer = ({ src, alt }: TransformerArgs): TransformerResult => {
  const sizeMatch = alt?.match(/\{([^}]+)\}/)
  if (sizeMatch) {
    const sizeStr = sizeMatch[1]
    const result: TransformerResult = {}

    const widthMatch = sizeStr.match(/width:(\d+%?)/)
    const heightMatch = sizeStr.match(/height:(\d+%?)/)

    if (widthMatch) {
      result.width = widthMatch[1]
    }
    if (heightMatch) {
      result.height = heightMatch[1]
    }

    return result
  }

  return {}
}

export const ImageResize: QuartzTransformerPlugin = () => {
  return {
    name: "ImageResize",
    htmlPlugins() {
      return [
        [
          rehypeImageResize,
          {
            transformer,
            width: "auto",
            height: "auto",
            formats: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
            preserveAspectRatio: true,
            allowPercentage: true,
          },
        ],
      ]
    },
  }
}

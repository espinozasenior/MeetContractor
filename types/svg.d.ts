declare module "*.svg" {
  // eslint-disable-next-line no-restricted-imports
  import React from "react"
  import { SvgProps } from "react-native-svg"
  const content: React.FC<SvgProps>
  export default content
}

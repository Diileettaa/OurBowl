import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      // 告诉 TS 这些标签是合法的，别报错
      effectComposer: any
      bloom: any
      vignette: any
    }
  }
}
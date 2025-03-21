import React from 'react'
import markdownit from 'markdown-it'
import Shiki from '@shikijs/markdown-it'
import 'github-markdown-css'

const mdParser = new markdownit()

mdParser.use(
  await Shiki({
    themes: {
      light: 'material-theme-lighter',
      dark: 'material-theme-palenight',
    },
  })
)

const MarkdownRender = ({ md }: { md: string }) => {
  const htmlContent = mdParser.render(md)

  return (
    <div
      className="markdown-body h-full w-full overflow-auto rounded-xl bg-[#ffffff] px-4 py-2"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    ></div>
  )
}

export default MarkdownRender

import { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import { renderAsync } from 'docx-preview'
import MarkdownRenderComponent from './MarkdownRender'
import { currentItem, basicStates, type FType } from '@/store/fileStore'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

const UnknownRender = () => {
  return (
    <div
      className="flex aspect-[5/2] flex-col items-center justify-center gap-[4px] rounded-xl bg-[#f1f5f9] max-md:w-[300px] md:max-xl:w-[350px] xl:w-[500px]"
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <div className="font-semibold">抱歉，此文件格式暂时不支持线上预览</div>
      <div className="font-sm text-[#475569]">Sorry but not supported</div>
      <div className="h-[20%]"></div>
    </div>
  )
}

const TxtRender = observer(() => {
  const [textContent, setTextContent] = useState('')
  currentItem.resourceBlob?.text().then((text) => setTextContent(text))
  console.log(textContent)
  return (
    <div className="h-4/5 w-3/5 min-w-[300px] rounded-xl bg-[#f1f5f9] p-4">
      <div className="h-full w-full overflow-auto rounded-lg bg-[#cbd5e1] p-2">
        <pre>{textContent}</pre>
      </div>
    </div>
  )
})

const MarkdownRender = observer(() => {
  const [markdownContent, setMarkdownContent] = useState('')
  currentItem.resourceBlob?.text().then((text) => setMarkdownContent(text))
  console.log(markdownContent)
  return (
    <div className="h-4/5 w-3/5 min-w-[300px] rounded-xl bg-[#f5f5f5] p-4">
      <MarkdownRenderComponent md={markdownContent}></MarkdownRenderComponent>
    </div>
  )
})

// const MusicRender = (item: FType) => {
//   return <div></div>
// }

const VideoRender = observer(() => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  videoRef.current?.addEventListener('ended', () => {
    videoRef.current?.pause()
  })
  if (videoRef.current && currentItem.mediaSource && basicStates.renderFile) {
    const mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
    if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {
      videoRef.current.src = URL.createObjectURL(
        currentItem.mediaSource as MediaSource
      )
      currentItem.mediaSource?.addEventListener('sourceopen', () => {
        const sourceBuffer = currentItem.mediaSource?.addSourceBuffer(mimeCodec)
        const chunkSize = 1 * 1024 * 1024
        let index = 0
        const send = () => {
          if (index * chunkSize >= (currentItem.item?.size as number)) {
            return
          }
          const start = index * chunkSize
          const end =
            start + chunkSize - 1 <= (currentItem.item?.size as number) - 1
              ? start + chunkSize - 1
              : null
          const url =
            `${baseUrl}/api/file/preview` +
            `?filePath=${encodeURIComponent((currentItem.item as FType).path)}`
          fetch(url, {
            headers: {
              Range: `bytes=${start}-${end}`,
              responseType: 'arraybuffer',
            },
          }).then(async (res) => {
            const response = await res.arrayBuffer()
            index++
            if (index === 1 && chunkSize < (currentItem.item?.size as number)) {
              sourceBuffer?.appendBuffer(response)
              sourceBuffer?.addEventListener('updateend', send)
            } else if (
              index === 1 &&
              chunkSize >= (currentItem.item?.size as number)
            ) {
              sourceBuffer?.appendBuffer(response)
              sourceBuffer?.addEventListener('updateend', () => {
                if (
                  currentItem.mediaSource?.readyState === 'open' &&
                  !sourceBuffer.updating
                ) {
                  currentItem.mediaSource?.endOfStream()
                  console.log(sourceBuffer.updating)
                }
                send()
              })
            } else if (
              index * chunkSize >=
              (currentItem.item?.size as number)
            ) {
              sourceBuffer?.removeEventListener('updateend', send)
              sourceBuffer?.appendBuffer(response)
              sourceBuffer?.addEventListener('updateend', () => {
                if (
                  currentItem.mediaSource?.readyState === 'open' &&
                  !sourceBuffer.updating
                ) {
                  console.log(sourceBuffer.updating)
                  currentItem.mediaSource?.endOfStream()
                }
                send()
              })
            } else {
              sourceBuffer?.appendBuffer(response)
            }
            videoRef.current?.play()
          })
        }
        send()
      })
    } else {
      console.error('Unsupported MIME type or codec: ', mimeCodec)
    }
  }

  if (!basicStates.renderFile) {
    if (currentItem.mediaSource?.readyState === 'open') {
      currentItem.mediaSource?.endOfStream()
    }
    videoRef.current?.pause()
    if (currentItem.mediaSource) {
      console.log('clear')
      currentItem.setMediaSource(null)
    }
    URL.revokeObjectURL(videoRef.current?.src as string)
  }

  return (
    <div
      className="aspect-auto w-1/2 rounded-xl bg-[#ffffff] p-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="h-full w-full">
        <video ref={videoRef} controls width="100%" height="100%"></video>
      </div>
    </div>
  )
})

const PdfRender = observer(() => {
  return (
    <div className="h-4/5 w-4/5 overflow-auto rounded-xl">
      <iframe
        src={currentItem.resourceLink as string}
        className="h-full w-full rounded-xl"
      ></iframe>
    </div>
  )
})

const PhotoRender = observer(() => {
  return (
    <div
      className="max-w-3/5 max-h-3/5 rounded-xl bg-[#ffffff] p-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="h-full w-full">
        <img
          className="h-full w-full object-contain"
          src={currentItem.resourceLink as string}
          alt={currentItem.item?.name}
        />
      </div>
    </div>
  )
})

const DocxRender = observer(() => {
  if (currentItem.resourceBlob) {
    renderAsync(
      currentItem.resourceBlob as Blob,
      document.getElementById('docx') as HTMLElement
    )
  }
  return (
    <div
      className="h-4/5 w-3/5 min-w-[300px] rounded-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="h-full w-full overflow-auto rounded-xl bg-[#e5e7eb]"
        id="docx"
      ></div>
    </div>
  )
})

const FileOnlineRender = observer(() => {
  const item = currentItem.item
  const extension = item?.name.split('.').slice(-1)[0]
  switch (extension) {
    case 'txt':
      return <TxtRender />
    case 'md':
      return <MarkdownRender />
    case 'mp4':
      return <VideoRender />
    case 'pdf':
      return <PdfRender />
    case 'docx':
      return <DocxRender />
    case 'jpg':
      return <PhotoRender />
    default:
      return <UnknownRender />
  }
})

const FileOnlinePreview = observer(() => {
  useEffect(() => {
    if (basicStates.renderFile) {
      currentItem.fetchResource()
      if (currentItem.item?.name.split('.').slice(-1)[0] === 'mp4')
        currentItem.setMediaSource(new MediaSource())
    } else {
      currentItem.clearResource()
    }
  }, [basicStates.renderFile])

  return (
    <div
      className="fixed z-10 h-screen w-screen items-center justify-center bg-[rgba(0,0,0,0.4)]"
      style={{
        display: basicStates.renderFile ? 'flex' : 'none',
        backdropFilter:
          basicStates.moveFile || basicStates.renderFile
            ? 'blur(2px)'
            : 'blur(0)',
      }}
      onClick={() => {
        basicStates.setRenderFile(false)
        console.log('test3')
      }}
    >
      <FileOnlineRender />
    </div>
  )
})
export default FileOnlinePreview

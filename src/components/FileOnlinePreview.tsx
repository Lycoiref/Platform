import { useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import { renderAsync } from 'docx-preview'
import { currentItem, basicStates } from '@/store/fileStore'

const UnknownRender = () => {
  return (
    <div
      className="flex aspect-[5/2] flex-col items-center justify-center gap-[4px] rounded-xl bg-[#f1f5f9] max-md:w-[200px] md:max-xl:w-[350px] xl:w-[500px]"
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <div className="font-semibold">
        抱歉，此文件格式暂时不支持线上预览,请下载后本地查看
      </div>
      <div className="font-sm text-[#475569]">Sorry but not supported</div>
      <div className="h-[20%]"></div>
    </div>
  )
}

// const txtRender = (item: FType) => {
//   return <div></div>
// }

// const markdownRender = (item: FType) => {
//   return <div></div>
// }

// const videoRender = (item: FType) => {
//   return <div></div>
// }

// const musicRender = (item: FType) => {
//   return <div></div>
// }

// const pdfRender = (item: FType) => {
//   return <div></div>
// }
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
      className="h-4/5 w-4/5 rounded-xl"
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
      }}
    >
      <FileOnlineRender />
    </div>
  )
})
export default FileOnlinePreview

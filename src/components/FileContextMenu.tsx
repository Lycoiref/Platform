import {
  filesAndFolders,
  basicStates,
  currentItem,
  FType,
  filesReader,
  pasteFileOrFolder,
  cutFileOrFolder,
} from '@/store/fileStore'

import {
  ContextMenuCopy,
  ContextMenuCut,
  ContextMenuDelete,
  ContextMenuDownload,
  ContextMenuMove,
  ContextMenuPaste,
  ContextMenuRename,
} from '@/components/static'
import { observer } from 'mobx-react'

const baseURL = process.env.NEXT_PUBLIC_BASE_URL

const deleteFileOrFolder = async (fname: string, fSize: number | null) => {
  let url = `${baseURL}/api/file/delete`
  url +=
    '?' +
    `pathQuery=${encodeURIComponent(filesAndFolders.totalPath + '/' + fname)}`
  if (fSize != null) {
    url += '&type=file'
  } else url += '&type=folder'
  await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  console.log('delete')
  filesReader()
}

const downloadFileOrFolder = async (file: FType) => {
  let url = `${baseURL}/api/file/downloadOne`
  url += `?filePath=${encodeURIComponent(file.path)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  const blob = await res.blob()
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = file.name
  if (file.size == null) link.download += '.zip'
  link.style.display = 'none'
  link.click()
  URL.revokeObjectURL(link.href)
  basicStates.setShowMenu(false)
}

const FileContextMenu = observer(() => {
  const item = currentItem.item as FType
  const mousePosition = basicStates.mousePosition
  return (
    <div
      style={{
        left: mousePosition.x,
        top: mousePosition.y,
        display: basicStates.showMenu ? 'flex' : 'none',
      }}
      className="fixed z-10 h-[240px] w-[150px] flex-col rounded-lg bg-[#ffffff] py-4 text-xs shadow-[0_0_1px_2px_rgba(0,0,0,0.05)]"
    >
      <div
        className="flex flex-1 cursor-pointer items-center gap-[12px] px-5 hover:bg-[#f4f4f5]"
        onClick={(e) => {
          if (item.size === null)
            filesAndFolders.setTotalPath(
              `${filesAndFolders.totalPath}/${item.name}`
            )
          else {
            e.stopPropagation()
            basicStates.setShowMenu(false)
            console.log('test1')
            basicStates.setRenderFile(true)
          }
        }}
      >
        打开
      </div>
      <div
        className="flex flex-1 cursor-pointer items-center gap-[13px] px-4 hover:bg-[#f4f4f5]"
        onClick={() => {
          basicStates.setShowMenu(false)
          downloadFileOrFolder(item)
        }}
      >
        <ContextMenuDownload />
        <div>下载</div>
      </div>
      <div
        className="flex flex-1 cursor-pointer items-center gap-[12px] px-4 hover:bg-[#f4f4f5]"
        onClick={() => {
          if (basicStates.cutItem !== null) {
            basicStates.setCutItem(null)
            console.log('download')
            filesReader()
          }
          basicStates.setCopyItem(item)
          basicStates.setShowMenu(false)
        }}
      >
        <ContextMenuCopy />
        <div>复制</div>
      </div>
      <div
        className="flex flex-1 cursor-pointer items-center gap-[14px] px-4 hover:bg-[#f4f4f5]"
        onClick={() => {
          if (basicStates.cutItem != null) {
            pasteFileOrFolder(
              basicStates.cutItem.path,
              filesAndFolders.totalPath +
                '/' +
                item.name +
                '/' +
                basicStates.cutItem.name,
              1
            )
            basicStates.setCutItem(null)
          } else if (basicStates.copyItem != null) {
            pasteFileOrFolder(
              basicStates.copyItem.path,
              filesAndFolders.totalPath +
                '/' +
                item.name +
                '/' +
                basicStates.copyItem.name,
              0
            )
          }
        }}
      >
        <ContextMenuPaste />
        <div>粘贴</div>
      </div>
      <div
        className="flex flex-1 cursor-pointer items-center gap-[12px] px-4 hover:bg-[#f4f4f5]"
        onClick={() => {
          if (basicStates.copyItem !== null) basicStates.setCopyItem(null)
          basicStates.setCutItem(item)
          cutFileOrFolder(item)
          basicStates.setShowMenu(false)
        }}
      >
        <ContextMenuCut />
        <div>剪切</div>
      </div>
      <div
        className="flex flex-1 cursor-pointer items-center gap-[12px] px-4 hover:bg-[#f4f4f5]"
        onClick={(e) => {
          e.stopPropagation()
          basicStates.setShowMenu(false)
          filesAndFolders.setFolderPath('')
          basicStates.setMoveFile(true)
        }}
      >
        <ContextMenuMove />
        <div>移动</div>
      </div>
      <div
        className="flex flex-1 cursor-pointer items-center gap-[13px] px-4 hover:bg-[#f4f4f5]"
        onClick={(e) => {
          basicStates.setRenameInput(item.name)
          item.isBeingRenamed = true
          e.stopPropagation()
          basicStates.setShowMenu(false)
        }}
      >
        <ContextMenuRename />
        <div>重命名</div>
      </div>
      <div
        className="flex flex-1 cursor-pointer items-center gap-[12px] px-4 hover:bg-[#f4f4f5]"
        onClick={() => deleteFileOrFolder(item.name, item.size)}
      >
        <ContextMenuDelete />
        <div>删除</div>
      </div>
    </div>
  )
})
export default FileContextMenu

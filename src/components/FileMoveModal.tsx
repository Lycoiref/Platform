import { observer } from 'mobx-react'
import {
  filesAndFolders,
  basicStates,
  currentItem,
  pasteFileOrFolder,
} from '@/store/fileStore'
import { TypesFolder } from './static'

const FileMoveModal = observer(() => {
  return (
    <div
      className="fixed z-10 h-screen w-screen items-center justify-center bg-[rgba(0,0,0,0.5)]"
      style={{ display: basicStates.moveFile ? 'flex' : 'none' }}
    >
      <div className="flex h-[65%] max-h-[600px] w-3/5 max-w-[700px] flex-col rounded-2xl bg-white">
        <div className="flex h-[50px] items-center px-6 text-sm font-semibold">
          移动到
        </div>
        <div className="flex h-[40px] items-center bg-[#FAFAFC] px-7 text-sm">
          <div
            className="text-[#CAC3CC]"
            style={{ display: filesAndFolders.folderPath ? 'none' : 'flex' }}
          >
            全部文件
          </div>
          <div
            className="flex gap-[6px] font-medium text-[#06A7FF]"
            style={{ display: filesAndFolders.folderPath ? 'flex' : 'none' }}
          >
            <span
              className="cursor-pointer"
              onClick={() => {
                filesAndFolders.setFolderPath(
                  filesAndFolders.folderPath.split('/').slice(0, -1).join('/')
                )
              }}
            >
              返回上一级
            </span>
            <span>|</span>
            <span
              className="cursor-pointer"
              onClick={() => filesAndFolders.setFolderPath('')}
            >
              全部文件
            </span>
            {filesAndFolders.folderPath &&
              filesAndFolders.folderPath
                .split('/')
                .slice(1)
                .map((value, index) => {
                  index += 1
                  return (
                    <>
                      <span>{`${'>'}`}</span>
                      <span
                        className="cursor-pointer"
                        style={{
                          color:
                            filesAndFolders.folderPath
                              .split('/')
                              .slice(-1)[0] == value
                              ? 'black'
                              : '',
                        }}
                        onClick={() => {
                          if (
                            filesAndFolders.folderPath
                              .split('/')
                              .slice(-1)[0] != value
                          )
                            filesAndFolders.setFolderPath(
                              '/' +
                                filesAndFolders.folderPath
                                  .split('/')
                                  .slice(1, index + 1)
                                  .join('/')
                            )
                        }}
                      >
                        {value}
                      </span>
                    </>
                  )
                })}
          </div>
        </div>
        <div className="grid-col-1 grid flex-1 grid-rows-[repeat(auto-fit,50px)] overflow-auto shadow-[0px_1px_5px_rgba(0,0,0,0.05)]">
          {filesAndFolders.folders.map((value) => {
            return (
              <div
                className="flex h-[50px] w-full items-center gap-[20px] px-8 text-sm hover:bg-[#FAFAFC]"
                onClick={() => {
                  filesAndFolders.setFolderPath(
                    `${filesAndFolders.folderPath}/${value.name}`
                  )
                }}
              >
                <div>
                  <TypesFolder width={35} height={35} />
                </div>
                <div>{value.name}</div>
              </div>
            )
          })}
        </div>
        <div className="flex h-[80px] items-center justify-end gap-[24px] px-8">
          <div
            className="flex h-[35px] w-[80px] cursor-pointer items-center justify-center rounded-full bg-[#E2E8F0] font-semibold text-[#64748B]"
            onClick={() => {
              basicStates.setMoveFile(false)
              filesAndFolders.setFolderPath('')
              filesAndFolders.resetFolders([])
            }}
          >
            取消
          </div>
          <div
            className="flex h-[35px] w-[120px] cursor-pointer items-center justify-center rounded-full bg-[#64748B] font-semibold text-white"
            onClick={() => {
              pasteFileOrFolder(
                currentItem.item?.path as string,
                `${filesAndFolders.folderPath}/${currentItem.item?.name}`,
                1
              )
              basicStates.setMoveFile(false)
              filesAndFolders.setFolderPath('')
              filesAndFolders.resetFolders([])
            }}
          >
            移动到此
          </div>
        </div>
      </div>
    </div>
  )
})
export default FileMoveModal

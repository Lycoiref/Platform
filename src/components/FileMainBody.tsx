import { observer } from 'mobx-react'
import { Input, Notification } from '@douyinfe/semi-ui'
import {
  filesAndFolders,
  currentItem,
  basicStates,
  FType,
  filesReader,
  cutFileOrFolder,
  pasteFileOrFolder,
  renameFileOrFolder,
} from '@/store/fileStore'
import {
  TypesFolder,
  TypesMarkDown,
  TypesOthers,
  TypesDocx,
  TypesExcel,
  TypesMusic,
  TypesPDF,
  TypesVideo,
  TypesTxt,
  TypesPhoto,
  LoadingState,
} from '@/components/static'

const baseURL = process.env.NEXT_PUBLIC_BASE_URL

const typesIcon = {
  '.jpg': <TypesPhoto />,
  '.folder': <TypesFolder />,
  '.default': <TypesOthers />,
  '.md': <TypesMarkDown />,
  '.pdf': <TypesPDF />,
  '.xlsx': <TypesExcel />,
  '.mp3': <TypesMusic />,
  '.mp4': <TypesVideo />,
  '.doc': <TypesDocx />,
  '.docx': <TypesDocx />,
  '.txt': <TypesTxt />,
}

type TypeOfFile =
  | '.jpg'
  | '.docx'
  | '.md'
  | '.pdf'
  | '.xlsx'
  | '.folder'
  | '.mp4'
  | '.mp3'
  | '.doc'
  | '.txt'

const getIcon = (f: FType) => {
  if (f.size != null) {
    const extension = f.name.split('.').slice(-1)[0]
    return typesIcon[('.' + extension) as TypeOfFile] || typesIcon['.default']
  } else return typesIcon['.folder']
}

const onContextMenu = (e: React.MouseEvent) => {
  e.preventDefault()
  // const ww = window.innerWidth
  // const wh = window.innerHeight
  // const x = e.clientX + 150 > ww ? 2 * ww - e.clientX - 150 : e.clientX
  // const y = e.clientY + 240 > wh ? 2 * wh - e.clientY - 240 : e.clientY
  const x = e.clientX
  const y = e.clientY
  basicStates.setMousePosition({ x, y })
  basicStates.setShowMenu(true)
  // 全局状态管理 state zustand mobx
  // 最好别用 redux
}

const createAction = async (name: string | undefined) => {
  if (!name) {
    const temp = filesAndFolders.files.slice(1)
    filesAndFolders.resetAll(temp)
    return
  }
  let url = `${baseURL}/api/file/create?`
  if (filesAndFolders.totalPath)
    url += `folderPath=${encodeURIComponent(filesAndFolders.totalPath)}&`
  url += `folderName=${encodeURIComponent(name)}`
  await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  console.log('newFolder')
  filesReader()
}

// const changeName = async () => {}

const FilesRender = observer(() => {
  return basicStates.isLoading ? (
    <>
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        <LoadingState width={100} height={100} />
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
      <div className="h-[25%]"></div>
    </>
  ) : (
    <>
      <div
        className="h-[1.8rem] w-full items-center px-[3%] text-xs font-semibold"
        style={{ display: basicStates.isSorting ? 'none' : 'flex' }}
      >
        <div
          style={{
            display: filesAndFolders.totalPath ? 'none' : 'block',
          }}
        >
          全部文件
        </div>
        <div
          className="flex gap-[6px] font-medium text-[#06A7FF]"
          style={{
            display: filesAndFolders.totalPath ? 'flex' : 'none',
          }}
        >
          <span
            className="cursor-pointer"
            onClick={() => {
              filesAndFolders.setTotalPath(
                filesAndFolders.totalPath.split('/').slice(0, -1).join('/')
              )
            }}
          >
            返回上一级
          </span>
          <span>|</span>
          <span
            className="cursor-pointer"
            onClick={() => filesAndFolders.setTotalPath('')}
          >
            全部文件
          </span>
          {filesAndFolders.totalPath &&
            filesAndFolders.totalPath
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
                          filesAndFolders.totalPath.split('/').slice(-1)[0] ==
                          value
                            ? 'black'
                            : '',
                      }}
                      onClick={() => {
                        if (
                          filesAndFolders.totalPath.split('/').slice(-1)[0] !=
                          value
                        )
                          filesAndFolders.setTotalPath(
                            '/' +
                              filesAndFolders.totalPath
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
      <div
        className="grid w-full flex-1 grid-cols-[repeat(auto-fit,140px)] grid-rows-[repeat(auto-fit,170px)] overflow-auto"
        style={{
          display: filesAndFolders.files.length ? 'grid' : 'block',
        }}
      >
        {filesAndFolders.files.map((item, index) => {
          return (
            <div className="flex h-[170px] w-[140px] flex-col items-center justify-center pb-[20px] pl-[30px]">
              <div
                className="flex h-full w-full cursor-pointer flex-col items-center rounded-lg px-3 hover:bg-[#f4f4f5]"
                onContextMenu={(e) => {
                  basicStates.setRenameInput(undefined)
                  currentItem.reset(item, index)
                  onContextMenu(e)
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  currentItem.reset(item, index)
                  basicStates.setShowMenu(false)
                  basicStates.setRenameInput(undefined)
                }}
                onDoubleClick={() => {
                  if (item.size === null)
                    filesAndFolders.setTotalPath(
                      `${filesAndFolders.totalPath}/${item.name}`
                    )
                  else {
                    basicStates.setRenderFile(true)
                    console.log('test2')
                  }
                }}
                onCut={() => {
                  basicStates.setCutItem(item)
                  cutFileOrFolder(item)
                  basicStates.setShowMenu(false)
                }}
                onPaste={() => {
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
                style={{
                  backgroundColor: item === currentItem.item ? '#F2FAFF' : '',
                }}
              >
                <div className="h-[20px]"></div>
                <div className="flex h-[50px] items-center justify-center">
                  {getIcon(item)}
                </div>
                <div className="h-[10px]"></div>
                <div className="flex h-[50px] flex-col items-center gap-[5px]">
                  <div className="w-full text-center text-xs">
                    {item.isBeingRenamed ? (
                      <Input
                        autoFocus={true}
                        ref={filesAndFolders.refs[index]}
                        size="small"
                        value={basicStates.renameInput}
                        style={{
                          height: '24px',
                        }}
                        onChange={(value) => basicStates.setRenameInput(value)}
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        onBlurCapture={() => {
                          if (basicStates.renameInput !== '') {
                            if (item.name == '') {
                              createAction(basicStates.renameInput)
                            } else if (item.name == basicStates.renameInput) {
                              item.isBeingRenamed = false
                              return
                            } else {
                              renameFileOrFolder(
                                item,
                                basicStates.renameInput as string
                              )
                            }
                          } else {
                            Notification.error({
                              title:
                                item.size !== null
                                  ? '文件名字不能为空！'
                                  : '文件夹名字不能为空！',
                              content: 'Sorry but failed.',
                              duration: 2,
                              position: 'top',
                            })
                            filesReader()
                          }
                          basicStates.setRenameInput(undefined)
                        }}
                        onEnterPress={() => {
                          if (basicStates.renameInput !== '') {
                            if (item.name == '') {
                              createAction(basicStates.renameInput)
                            } else if (item.name == basicStates.renameInput) {
                              item.isBeingRenamed = false
                              return
                            } else {
                              renameFileOrFolder(
                                item,
                                basicStates.renameInput as string
                              )
                            }
                          } else {
                            Notification.error({
                              title:
                                item.size !== null
                                  ? '文件名字不能为空！'
                                  : '文件夹名字不能为空！',
                              content: 'Sorry but failed.',
                              duration: 2,
                              position: 'top',
                            })
                            filesReader()
                          }
                          basicStates.setRenameInput(undefined)
                        }}
                      ></Input>
                    ) : (
                      <div>
                        <div
                          style={{
                            display: item.size != null ? 'block' : 'none',
                          }}
                        >
                          {item.name
                            .split('.')
                            .slice(0, -1)
                            .reduce((sum, part) => sum + part.length, 0) >= 12
                            ? item.name.slice(0, 12) + '...'
                            : item.name.split('.').slice(0, -1).join('.')}
                        </div>
                        <div
                          style={{
                            display: item.size == null ? 'block' : 'none',
                          }}
                        >
                          {item.size == null && item.name.length >= 15
                            ? item.name.slice(0, 12) + '...'
                            : item.name}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="w-full text-center text-xs text-[#737373]">
                    {`${item.lastModified.getMonth() + 1}-${
                      item.lastModified.getDate() + 1
                    } ${
                      item.lastModified.getHours() >= 10 ? '' : 0
                    }${item.lastModified.getHours()}:${
                      item.lastModified.getMinutes() >= 10 ? '' : 0
                    }${item.lastModified.getMinutes()}`}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div
          className="h-full w-full items-center justify-center"
          style={{
            display: filesAndFolders.files.length ? 'none' : 'flex',
          }}
        >
          <img
            src="/no_Files.png"
            alt="nth"
            style={{
              height: '60%',
              width: '50%',
            }}
          ></img>
        </div>
      </div>
    </>
  )
})

export default FilesRender

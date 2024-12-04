'use client'
import { useLayoutEffect, useEffect, useRef, useState} from 'react'
import { Input } from '@douyinfe/semi-ui'
import {
  ContextMenuCopy,
  ContextMenuCut,
  ContextMenuDelete,
  ContextMenuDownload,
  ContextMenuMove,
  ContextMenuPaste,
  ContextMenuRename,
  LeftBarSet,
  LeftBarDocument,
  LeftBarMusic,
  LeftBarOthers,
  LeftBarPhoto,
  LeftBarVideo,
  TypesFolder,
  TypesMarkDown,
  TypesOthers,
  TypesDocx,
  TypesExcel,
  TypesMusic,
  TypesPDF,
  TypesVideo,
  ExpandIconA,
  ExpandIconB,
  UserIcon,
  UploadIcon,
} from '@/components/static/'

interface FType {
  name: string
  size: number | null
  path: string
  lastModefined: Date
}

type TypeOfFile = '.md' | '.pdf' | '.xlsx' | '.folder' | '.mp4' | '.mp3' | '.doc'

export default function FilePage() {
  const categorise = [
    {
      id: 1,
      name: '文档',
      component: <LeftBarDocument />,
    },
    {
      id: 2,
      name: '音乐',
      component: <LeftBarMusic />,
    },
    {
      id: 3,
      name: '视频',
      component: <LeftBarVideo />,
    },
    {
      id: 4,
      name: '图片',
      component: <LeftBarPhoto />,
    },
    {
      id: 5,
      name: '其他',
      component: <LeftBarOthers />,
    },
  ]
  const typesIcon = {
    '.folder': <TypesFolder />,
    '.default': <TypesOthers />,
    '.md': <TypesMarkDown />,
    '.pdf': <TypesPDF />,
    '.xlsx': <TypesExcel />,
    '.mp3': <TypesMusic />,
    '.mp4': <TypesVideo />,
    '.doc': <TypesDocx />,
  }

  const uploadRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<(HTMLInputElement | null)[]>([])
  const [expandCategories, setExpandCategories] = useState(true)
  const [filesAndFolders, setFilesAndFolders] = useState<FType[]>([])
  const [folders, setFolders] = useState<FType[]>([])
  const [targetPath, setTargetPath] = useState('')
  const [folderPath, setFolderPath] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [moveFile, setMoveFile] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [currentItem, setCurrentItem] = useState<FType | null>()
  const [cutItem, setCutItem] = useState<FType | null>()
  const [copyItem, setCopyItem] = useState<FType | null>()
  const [renameInput, setRenameInput] = useState<string | undefined>(undefined)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [showLeftBar, setShowLeftBar] = useState(false)

  const getIcon = (f: FType) => {
    if (f.size != null) {
      const extension = f.name.split('.').slice(-1)[0]
      return typesIcon[('.' + extension) as TypeOfFile] || typesIcon['.default']
    } else return typesIcon['.folder']
  }

  const filesReader = async () => {
    try {
      let url = 'http://localhost:6677/api/file/reader'
      url += '?' + `pathQuery=${encodeURIComponent(targetPath)}`
      const response = await fetch(url, {
        method: 'GET',
      })
      const result = await response.json()
      const temp: FType[] = []
      for (const folder of result.folders) {
        temp.push({
          path: folder.folderPath.replace(/\\/g, '/'),
          name: folder.folderName,
          size: null,
          lastModefined: new Date(folder.lastModefined),
        })
      }
      for (const file of result.files) {
        temp.push({
          name: file.fileName,
          path: file.filePath.replace(/\\/g, '/'),
          size: file.fileSize,
          lastModefined: new Date(file.lastModefined),
        })
      }
      setFilesAndFolders(temp)
    } catch (error) {
      console.log('文件读取错误 ):',error)
      setTargetPath('')
      return
    }
  }

  const folderReader = async (currentPath: string) => {
    let url = 'http://localhost:6677/api/file/reader'
    url += '?' + `pathQuery=${encodeURIComponent(currentPath)}`
    const response = await fetch(url, {
      method: 'GET',
    })
    const result = await response.json()
    const temp: FType[] = []
    for (const folder of result.folders) {
      temp.push({
        path: folder.folderPath,
        name: folder.folderName,
        size: null,
        lastModefined: new Date(folder.lastModefined),
      })
    }
    setFolders(temp)
  }

  const uploadClick = () => {
    if (uploadRef.current) {
      uploadRef.current.click()
    }
  }

  const deleteFileOrFolder = async (fname: string, fsize: number | null) => {
    let url = 'http://localhost:6677/api/file/delete'
    url += '?' + `pathQuery=${encodeURIComponent(targetPath + '/' + fname)}`
    if (fsize != null) {
      url += '&type=file'
    } else url += '&type=folder'
    await fetch(url)
    filesReader()
  }

  const createFolder = () => {
    setFilesAndFolders([{
      name: '',
      path: targetPath,
      size: null,
      lastModefined: new Date(),
    },...filesAndFolders])
    console.log(filesAndFolders)
    setCurrentItem(filesAndFolders[0])
    setCurrentIndex(0)
    setRenameInput('')
  }

  const createAction = async (name: string | undefined) => {
    if (!name) {
      filesReader()
      return
    }
    let url = 'http://localhost:6677/api/file/create?'
    if (targetPath) url += `folderPath=${encodeURIComponent(targetPath)}&`
    url += `folderName=${encodeURIComponent(name)}`
    await fetch(url)
    filesReader()
  }

  const renameFileOrFolder = async (f: FType, newName: string) => {
    let url = 'http://localhost:6677/api/file/rename?'
    if (targetPath)
      url +=
        `fpath=${encodeURIComponent(targetPath)}&` +
        `originalName=${encodeURIComponent(f.name)}&` +
        `newName=${encodeURIComponent(newName)}`
    else
      url +=
        'fpath=0&' +
        `originalName=${encodeURIComponent(f.name)}&` +
        `newName=${encodeURIComponent(newName)}`
    await fetch(url)
    filesReader()
  }

  const cutFileOrFolder = async (cutF: FType) => {
    const temp = []
    for (const f of filesAndFolders) {
      if (cutF != f) temp.push(f)
    }
    setFilesAndFolders(temp)
  }

  const pasteFileOrFolder = async (
    oldPath: string,
    newPath: string,
    operation: number
  ) => {
    let url = 'http://localhost:6677/api/file/paste'
    url += `?oldPath=${encodeURIComponent(
      oldPath
    )}&newPath=${encodeURIComponent(newPath)}&operationType=${
      operation ? 'cut' : 'copy'
    }`
    await fetch(url)
    filesReader()
  }

  const downloadFileOrFolder = async (file: FType) => {
    let url = 'http://localhost:6677/api/file/downloadOne'
    url += `?filePath=${encodeURIComponent(file.path)}`
    const res = await fetch(url, {
      method: 'GET',
    })
    const blob = await res.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = file.name
    if (file.size == null) link.download += '.zip'
    link.style.display = 'none'
    link.click()
    URL.revokeObjectURL(link.href)
    setShowMenu(false)
  }

  const uploadFile = async (files: FileList) => {
    if (
      Array.from(files).reduce((sum, f) => sum + f.size, 0) >
      10 * 1024 * 1024 * 1024
    ) {
      alert('单次上传总量不可超过10GB哦,本次操作已取消 ):')
      return
    }
    let url = 'http://localhost:6677/api/file/upload'

    url += `?pathQuery=${encodeURIComponent(targetPath)}`

    for (const file of files) {
      const chunkSize = 1024 * 1024 *5
      let index = 0
      const [fname, fext] = file.name.split('.')
      const promises: Promise<Response>[] = []
      while (index * chunkSize < file.size) {
        const blob = file.slice(index * chunkSize, (index + 1) * chunkSize)
        const chunkFile = new File([blob], `${fname}.${index}.${fext}`)
        const formData = new FormData()
        formData.append('file', chunkFile)
        index++
        const res = fetch(url, {
          method: 'POST',
          body: formData
        })
        promises.push(res)
      }
      await Promise.all(promises)
        .then(async () => {
          await fetch(
            `http://localhost:6677/api/file/merge` +
              `?pathQuery=${encodeURIComponent(targetPath)}` +
              `&name=${encodeURIComponent(file.name)}`
          )
        })
        .catch((error) => {
          console.log('传送出错啦！本次传输暂停！！',error)
          return
        })
      filesReader()
    }
  }

  const uploadAction = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await uploadFile(e.target.files)
      if (uploadRef.current) {
        uploadRef.current.value = ''
      }
    }
  }

  const onContextMenu = (e: React.MouseEvent, item: FType, index: number) => {
    e.preventDefault()
    const x = e.clientX
    const y = e.clientY
    setMousePosition({ x, y })
    setShowMenu(true)
    setCurrentItem(item) 
    setCurrentIndex(index)
    // 全局状态管理 state zustand mobx
    // 最好别用 redux
  }

  const ContextMenu = ({ item, mousePosition }: {item:FType , mousePosition:{x:number,y:number}}) => {
    return (
      <div
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          display: showMenu ? 'flex' : 'none',
        }}
        className="fixed z-10 h-[240px] w-[150px] flex-col rounded-lg bg-[#ffffff] py-4 text-xs shadow-[0_0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <div
          className="flex flex-1 cursor-pointer items-center gap-[12px] px-5 hover:bg-[#f4f4f5]"
          onClick={() => {
            if (item.size != null) return
            setTargetPath(`${targetPath}/${item.name}`)
          }}
        >
          打开
        </div>
        <div
          className="flex flex-1 cursor-pointer items-center gap-[13px] px-4 hover:bg-[#f4f4f5]"
          onClick={() => {
            setShowMenu(false)
            downloadFileOrFolder(item)
          }}
        >
          <ContextMenuDownload />
          <div>下载</div>
        </div>
        <div
          className="flex flex-1 cursor-pointer items-center gap-[12px] px-4 hover:bg-[#f4f4f5]"
          onClick={() => {
            if (cutItem !== null) {
              setCutItem(null)
              filesReader()
            }
            setCopyItem(item)
            setShowMenu(false)
          }}
        >
          <ContextMenuCopy />
          <div>复制</div>
        </div>
        <div
          className="flex flex-1 cursor-pointer items-center gap-[14px] px-4 hover:bg-[#f4f4f5]"
          onClick={() => {
            if (cutItem != null) {
              console.log(cutItem)
              pasteFileOrFolder(
                cutItem.path,
                targetPath + '/' + item.name + '/' + cutItem.name,
                1
              )
              setCutItem(null)
            } else if (copyItem != null) {
              pasteFileOrFolder(
                copyItem.path,
                targetPath + '/' + item.name + '/' + copyItem.name,
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
            if (copyItem !== null) setCopyItem(null)
            setCutItem(item)
            cutFileOrFolder(item)
            setShowMenu(false)
          }}
        >
          <ContextMenuCut />
          <div>剪切</div>
        </div>
        <div
          className="flex flex-1 cursor-pointer items-center gap-[12px] px-4 hover:bg-[#f4f4f5]"
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(false)
            setFolderPath('')
            folderReader(folderPath)
            setMoveFile(true)
          }}
        >
          <ContextMenuMove />
          <div>移动</div>
        </div>
        <div
          className="flex flex-1 cursor-pointer items-center gap-[13px] px-4 hover:bg-[#f4f4f5]"
          onClick={(e) => {
            setRenameInput(item.name)
            e.stopPropagation()
            setShowMenu(false)
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
  }

  useLayoutEffect(() => {
    filesReader()
  }, [])

  useEffect(() => {
    filesReader()
  }, [targetPath])

  useEffect(() => {
    if (currentItem && renameInput != undefined && nameRef.current[currentIndex])
      nameRef.current[currentIndex].focus()
  }, [currentItem, renameInput])

  useEffect(() => {
    folderReader(folderPath)
  }, [folderPath])

  return (
    <>
      <div
        className="absolute z-10 h-screen w-screen items-center justify-center bg-[rgba(0,0,0,0.5)]"
        style={{ display: moveFile ? 'flex' : 'none' }}
      >
        <div className="flex h-[65%] max-h-[600px] w-3/5 max-w-[700px] flex-col rounded-2xl bg-white">
          <div className="flex h-[50px] items-center px-6 text-sm font-semibold">
            移动到
          </div>
          <div className="flex h-[40px] items-center bg-[#FAFAFC] px-7 text-sm">
            <div
              className="text-[#CAC3CC]"
              style={{ display: folderPath ? 'none' : 'flex' }}
            >
              全部文件
            </div>
            <div
              className="flex gap-[6px] font-medium text-[#06A7FF]"
              style={{ display: folderPath ? 'flex' : 'none' }}
            >
              <span
                className="cursor-pointer"
                onClick={() => {
                  setFolderPath(folderPath.split('/').slice(0, -1).join('/'))
                }}
              >
                返回上一级
              </span>
              <span>|</span>
              <span
                className="cursor-pointer"
                onClick={() => setFolderPath('')}
              >
                全部文件
              </span>
              {folderPath &&
                folderPath
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
                              folderPath.split('/').slice(-1)[0] == value
                                ? 'black'
                                : '',
                          }}
                          onClick={() => {
                            if(folderPath.split('/').slice(-1)[0] != value) 
                              setFolderPath(
                                '/' +
                                  folderPath
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
            {folders?.map((value) => {
              return (
                <div
                  className="flex h-[50px] w-full items-center gap-[20px] px-8 text-sm hover:bg-[#FAFAFC]"
                  onClick={() => {
                    setFolderPath(`${folderPath}/${value.name}`)
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
                setMoveFile(false)
                setFolderPath('')
                setFolders([])
              }}
            >
              取消
            </div>
            <div
              className="flex h-[35px] w-[120px] cursor-pointer items-center justify-center rounded-full bg-[#64748B] font-semibold text-white"
              onClick={() => {
                pasteFileOrFolder(
                  currentItem?.path as string,
                  `${folderPath}/${currentItem?.name}`,
                  1
                )
                setMoveFile(false)
                setFolderPath('')
                setFolders([])
              }}
            >
              移动到此
            </div>
          </div>
        </div>
      </div>
      <div
        className="flex h-screen w-screen"
        onClick={() => {
          if (showMenu) {
            setShowMenu(false)
          }
          if (renameInput != undefined) {
            setRenameInput(undefined)
          }
          if (currentItem) {
            setCurrentIndex(-1)
            setCurrentItem(null)
          }
        }}
      >
        <ContextMenu
          item={currentItem as FType}
          mousePosition={mousePosition}
          // index={currentIndex}
        />
        <div className="hidden w-[18%] bg-[#f9fafb] p-6 md:block">
          <div className="flex h-full w-full flex-col items-center">
            <div
              onClick={() => {
                setTargetPath('')
              }}
              className="md:max-xl:text:lg flex h-[2.5rem] w-full cursor-pointer items-center justify-around text-base font-bold text-[#707070] xl:text-xl"
            >
              <div
                onClick={() => {
                  setExpandCategories(!expandCategories)
                }}
                style={{
                  transform: expandCategories
                    ? 'rotate(90deg)'
                    : 'rotate(0deg)',
                  transition: 'all 0.3s ease-in-out',
                }}
                className="flex h-1/2 w-[8%] cursor-pointer items-center justify-center"
              >
               
              <ExpandIconA />
              </div>
              <div className="hidden xl:block">我的文件</div>
              <div className="hidden md:max-xl:block">Files</div>
              <LeftBarSet />
            </div>
            <div
              style={{
                overflow: 'hidden',
                transform: expandCategories ? 'scaleY(1)' : 'scaleY(0)',
                transformOrigin: 'top',
                opacity: expandCategories ? 1 : 0,
                transition: 'all 0.35s ease',
              }}
              className="flex w-full flex-col items-center"
            >
              {expandCategories &&
                categorise.map((value) => {
                  return (
                    <div className="flex h-[2.5rem] w-full cursor-pointer items-center justify-center gap-4 rounded-lg text-xs font-semibold text-[#707070] hover:bg-[#f3f4f6] md:text-sm">
                      {value.component}
                      <div className="hidden xl:block">{value.name}</div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
        <div className="absolute z-10 block h-full bg-[#f9fafb] md:hidden">
          <div className="relative">
            <div
              style={{
                opacity: showLeftBar ? 1 : 0,
                width: showLeftBar ? '70vw' : '0vw',
                transition: 'all 0.3s ease',
              }}
            >
              <div className="flex h-full w-full flex-col items-center p-8">
                <div
                  onClick={() => {
                    setTargetPath('')
                  }}
                  className="md:max-xl:text:lg flex h-[2.5rem] w-full cursor-pointer items-center justify-around text-base font-bold text-[#707070] xl:text-xl"
                >
                  <div
                    onClick={() => {
                      setExpandCategories(!expandCategories)
                    }}
                    style={{
                      transform: expandCategories
                        ? 'rotate(90deg)'
                        : 'rotate(0deg)',
                      transition: 'all 0.3s ease-in-out',
                    }}
                    className="flex h-1/2 w-[8%] cursor-pointer items-center justify-center"
                  >
                    <ExpandIconA />
                  </div>
                  <div>我的文件</div>
                  <div>
                    <LeftBarSet />
                  </div>
                </div>
                <div
                  style={{
                    overflow: 'hidden',
                    transform: expandCategories ? 'scaleY(1)' : 'scaleY(0)',
                    transformOrigin: 'top',
                    opacity: expandCategories ? 1 : 0,
                    transition: 'all 0.35s ease',
                  }}
                  className="flex w-full flex-col items-center"
                >
                  {expandCategories &&
                    categorise.map((value) => {
                      return (
                        <div className="flex h-[2.5rem] w-full cursor-pointer items-center justify-center gap-4 rounded-lg text-xs font-semibold text-[#707070] hover:bg-[#f3f4f6] md:text-sm">
                          {value.component}
                          <div>{value.name}</div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
            <div
              className="absolute top-[15vw] flex h-[6vw] w-[6vw] cursor-pointer items-center justify-center rounded-full bg-[#f9fafb]"
              style={{
                left: showLeftBar ? '68vw' : '2vw',
                transform: showLeftBar ? 'rotate(90deg)' : 'rotate(-90deg)',
                transition: 'all 0.3s ease-in-out',
              }}
              onClick={() => {
                setShowLeftBar(!showLeftBar)
              }}
            >
              <ExpandIconB />
            </div>
          </div>
        </div>
        <div className="z-0 flex h-full w-full flex-col md:w-[82%]">
          <div className="flex h-[8%] items-center justify-between px-8 py-6 font-bold text-[#64748b] shadow-[0px_1px_4px_rgba(0,0,0,0.1)] md:text-xl">
            <div>File Management</div>
            <div className="cursor-pointer">
              <UserIcon />
            </div>
          </div>
          <div className="flex h-[92%] p-[3%]">
            <div className="flex w-full flex-col rounded-lg py-2 shadow-[0_0_1px_2px_rgba(0,0,0,0.05)] md:w-[71%]">
              <div className="flex h-[3.2rem] w-full items-center gap-[2.5%] px-[4%] text-xs font-semibold md:text-sm">
                <div
                  className="flex h-[2rem] w-[15%] cursor-pointer items-center justify-center gap-x-2 rounded-full bg-[#64748b] text-[#ffffff]"
                  onClick={uploadClick}
                >
                  <input
                    type="file"
                    name="file"
                    multiple
                    onChange={uploadAction}
                    hidden
                    ref={uploadRef}
                  />
                  <div>
                    <UploadIcon />
                  </div>
                  <div className="hidden xl:block">上传</div>
                </div>
                <div
                  className="flex h-[2rem] w-[20%] min-w-[6rem] cursor-pointer items-center justify-center rounded-full bg-[#e2e8f0] text-[#64748b]"
                  onClick={() => createFolder()}
                >
                  新建文件夹
                </div>
              </div>
              <div className="flex h-[1.8rem] w-full items-center px-[3%] text-xs font-semibold">
                <div style={{ display: targetPath ? 'none' : 'block' }}>
                  全部文件
                </div>
                <div
                  className="flex gap-[6px] font-medium text-[#06A7FF]"
                  style={{ display: targetPath ? 'flex' : 'none' }}
                >
                  <span
                    className="cursor-pointer"
                    onClick={() => {
                        setTargetPath(
                          targetPath.split('/').slice(0, -1).join('/')
                        )
                    }}
                  >
                    返回上一级
                  </span>
                  <span>|</span>
                  <span
                    className="cursor-pointer"
                    onClick={() => setTargetPath('')}
                  >
                    全部文件
                  </span>
                  {targetPath &&
                    targetPath
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
                                  targetPath.split('/').slice(-1)[0] == value
                                    ? 'black'
                                    : '',
                              }}
                              onClick={() => {
                                if(targetPath.split('/').slice(-1)[0] != value)
                                  setTargetPath(
                                    '/' +
                                      targetPath
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
                  display:
                    filesAndFolders.length ? 'grid' : 'block',
                }}
              >
                {filesAndFolders.map((item, index) => {
                  return (
                    <div className="flex h-[150px] w-[140px] flex-col items-center justify-center pb-[20px] pl-[30px]">
                      <div
                        key={index}
                        className="flex h-full w-full flex-col items-center rounded-lg px-2 hover:bg-[#f4f4f5]"
                        onContextMenu={(e) => {
                          setRenameInput(undefined)
                          onContextMenu(e, item, index)
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentItem(item)
                          setCurrentIndex(index)
                          setShowMenu(false)
                          setRenameInput(undefined)
                        }}
                        onDoubleClick={() => {
                          if (item.size != null) return
                          setTargetPath(`${targetPath}/${item.name}`)
                        }}
                        onCut={() => {
                          setCutItem(item)
                          cutFileOrFolder(item)
                          setShowMenu(false)
                        }}
                        onPaste={() => {
                          if (cutItem != null) {
                            pasteFileOrFolder(
                              cutItem.path,
                              targetPath + '/' + item.name + '/' + cutItem.name,
                              1
                            )
                            setCutItem(null)
                          } else if (copyItem != null) {
                            pasteFileOrFolder(
                              copyItem.path,
                              targetPath +
                                '/' +
                                item.name +
                                '/' +
                                copyItem.name,
                              0
                            )
                          }
                        }}
                        style={{
                          backgroundColor: item == currentItem ? '#F2FAFF' : '',
                        }}
                      >
                        <div className="h-[20px]"></div>
                        <div className="h-[50px]">{getIcon(item)}</div>
                        <div className="h-[10px]"></div>
                        <div className="flex h-[50px] flex-col items-center gap-[5px]">
                          <div className="w-full text-center text-xs">
                            <Input
                              key={index}
                              ref={(e) => {
                                nameRef.current[index] = e
                              }}
                              size="small"
                              defaultValue={item.name}
                              value={renameInput}
                              style={{
                                height: '24px',
                                display:
                                  currentItem == item &&
                                  renameInput !== undefined
                                    ? ''
                                    : 'none',
                              }}
                              onChange={(value) => setRenameInput(value)}
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                              onEnterPress={() => {
                                if (item.name == '') createAction(renameInput)
                                else if (renameInput)
                                  renameFileOrFolder(item, renameInput)
                                setRenameInput(undefined)
                              }}
                            ></Input>
                            <div
                              style={{
                                display:
                                  currentItem == item &&
                                  renameInput != undefined
                                    ? 'none'
                                    : '',
                              }}
                            >
                              <div
                                style={{
                                  display: item.size != null ? 'block' : 'none',
                                }}
                              >
                                {item.name
                                  .split('.')
                                  .slice(0, -1)
                                  .reduce(
                                    (sum, part) => sum + part.length,
                                    0
                                  ) >= 12
                                  ? item.name.slice(0, 12) + '...'
                                  : item.name}
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
                          </div>
                          <div className="w-full text-center text-xs text-[#737373]">
                            {`${item.lastModefined.getMonth() + 1}-${
                              item.lastModefined.getDate() + 1
                            } ${
                              item.lastModefined.getHours() > 10 ? '' : 0
                            }${item.lastModefined.getHours()}:${
                              item.lastModefined.getMinutes() > 10 ? '' : 0
                            }${item.lastModefined.getMinutes()}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                <div
                  className="h-full w-full items-center justify-center"
                  style={{
                    display:
                      filesAndFolders.length ? 'none' : 'flex',
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
            </div>
            <div className="hidden h-full w-[3%] min-w-8 md:block"></div>
            <div className="hidden h-full w-[26%] flex-col md:flex">
              <div className="flex-1 rounded-lg shadow-[0_0_1px_2px_rgba(0,0,0,0.05)]"></div>
              <div className="h-[2rem]"></div>
              <div className="flex-1 rounded-lg shadow-[0_0_1px_2px_rgba(0,0,0,0.05)]"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

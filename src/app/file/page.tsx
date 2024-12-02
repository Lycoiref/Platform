'use client'
import { useLayoutEffect, useEffect, useRef, useState, ReactNode } from 'react'
import { Input } from '@douyinfe/semi-ui'
import {
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

export default function FilePage() {
  const categorise: any[] = [
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
  const typesIcon: any = {
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
  const [loading, setLoading] = useState(false)
  const [renameInput, setRenameInput] = useState<string | undefined>(undefined)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [showLeftBar, setShowLeftBar] = useState(false)

  const getIcon = (f: FType) => {
    if (f.size != null) {
      const extension = f.name.split('.').slice(-1)[0]
      return typesIcon['.' + extension] || typesIcon['.default']
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
      console.log('文件读取错误 ):')
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
    const response = await fetch(url)
    filesReader()
  }

  const createFolder = async () => {
    const temp = filesAndFolders
    temp.unshift({
      name: '',
      path: targetPath,
      size: null,
      lastModefined: new Date(),
    })
    setFilesAndFolders(temp)
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
    const res = await fetch(url)
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
    const res = await fetch(url)
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
      const chunkSize = 1024 * 1024 * 5
      let index = 0
      const [fname, fext] = file.name.split('.')
      const promises: Promise<any>[] = []
      while (index * chunkSize < file.size) {
        const blob = file.slice(index * chunkSize, (index + 1) * chunkSize)
        const chunkFile = new File([blob], `${fname}.${index}.${fext}`)
        const formData = new FormData()
        formData.append('file', chunkFile)
        index++
        const res = fetch(url, {
          method: 'POST',
          body: formData,
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
          console.log('传送出错啦！本次传输暂停！！')
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

  const ContextMenu = ({ item, mousePosition, index }: any) => {
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
          <div>
            <svg viewBox="0 0 1024 1024" width="13px" height="13px">
              <path
                d="M511.985404 988.20397L354.645856 830.863205l31.692198-31.692197 125.64735 125.646134 125.647351-125.646134 31.693414 31.692197z"
                fill="#2c2c2c"
              ></path>
              <path
                d="M489.574876 549.16438h44.821057v390.984362h-44.821057z"
                fill="#2c2c2c"
              ></path>
              <path
                d="M802.862512 498.506247a292.347627 292.347627 0 0 0 3.606362-45.781943c0-160.264776-129.920251-290.18381-290.183811-290.183811-156.325145 0-283.755607 123.617328-289.927168 278.428166-98.420231 18.360213-172.926572 104.690313-172.926573 208.435553 0 117.112497 94.937933 212.051646 212.051646 212.051646l0.254209-0.002433v0.002433h50.690974v-44.821058H265.760287v-0.003649c-0.09244 0-0.184879 0.003649-0.278535 0.003649-44.669019 0-86.664586-17.394462-118.249748-48.98084-31.585162-31.585162-48.980841-73.580729-48.980841-118.249748s17.394462-86.664586 48.980841-118.249748c22.566216-22.566216 50.447712-37.88322 80.820212-44.794298a168.56853 168.56853 0 0 1 37.429536-4.186542c2.410728 0 4.811726 0.060816 7.205426 0.161769a249.539565 249.539565 0 0 1-1.764867-29.609873c0-5.121885 0.173932-10.217012 0.484091-15.286596 3.651365-59.787763 28.659934-115.491154 71.381639-158.211643 46.342662-46.342662 107.959757-71.865731 173.498239-71.86573 65.539698 0 127.155576 25.521852 173.498238 71.86573 46.342662 46.342662 71.865731 107.959757 71.865731 173.498239 0 16.313162-1.583637 32.383062-4.674283 48.035767a242.757415 242.757415 0 0 1-12.339474 42.018677h43.569473v0.029192c0.211638-0.001216 0.420844-0.013379 0.632482-0.01338 1.11779 0 2.233147 0.014596 3.346071 0.041355 35.320453 0.841687 68.400461 14.992248 93.471062 40.062849 25.861203 25.861203 40.102987 60.24388 40.102987 96.817133 0 36.573253-14.241785 70.95593-40.102987 96.817133-25.861203 25.861203-60.245096 40.102987-96.817133 40.102987l-0.063248-0.001216v0.001216h-72.483617v44.821057h76.492577v-0.049868c98.550376-2.099353 177.796681-82.63738 177.796682-181.691309-0.002433-95.656772-73.899403-174.050444-167.718329-181.210866z"
                fill="#2c2c2c"
              ></path>
            </svg>
          </div>
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
          <div>
            <svg viewBox="0 0 1024 1024" width="14px" height="14px">
              <path
                d="M394.666667 106.666667h448a74.666667 74.666667 0 0 1 74.666666 74.666666v448a74.666667 74.666667 0 0 1-74.666666 74.666667H394.666667a74.666667 74.666667 0 0 1-74.666667-74.666667V181.333333a74.666667 74.666667 0 0 1 74.666667-74.666666z m0 64a10.666667 10.666667 0 0 0-10.666667 10.666666v448a10.666667 10.666667 0 0 0 10.666667 10.666667h448a10.666667 10.666667 0 0 0 10.666666-10.666667V181.333333a10.666667 10.666667 0 0 0-10.666666-10.666666H394.666667z m245.333333 597.333333a32 32 0 0 1 64 0v74.666667a74.666667 74.666667 0 0 1-74.666667 74.666666H181.333333a74.666667 74.666667 0 0 1-74.666666-74.666666V394.666667a74.666667 74.666667 0 0 1 74.666666-74.666667h74.666667a32 32 0 0 1 0 64h-74.666667a10.666667 10.666667 0 0 0-10.666666 10.666667v448a10.666667 10.666667 0 0 0 10.666666 10.666666h448a10.666667 10.666667 0 0 0 10.666667-10.666666v-74.666667z"
                fill="#000000"
                p-id="4220"
              ></path>
            </svg>
          </div>
          <div>复制</div>
        </div>
        <div
          className="flex flex-1 cursor-pointer items-center gap-[14px] px-4 hover:bg-[#f4f4f5]"
          onClick={() => {
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
                targetPath + '/' + item.name + '/' + copyItem.name,
                0
              )
            }
          }}
        >
          <div>
            <svg viewBox="0 0 1024 1024" width="12px" height="12px">
              <path
                d="M640 1024a42.666667 42.666667 0 0 0 42.666667-42.666667V384a42.666667 42.666667 0 0 0-42.666667-42.666667H42.666667a42.666667 42.666667 0 0 0-42.666667 42.666667v597.333333a42.666667 42.666667 0 0 0 42.666667 42.666667h597.333333z m-42.666667-85.333333H85.333333V426.666667h512v512z"
                p-id="5257"
              ></path>
              <path
                d="M512 682.666667a42.666667 42.666667 0 0 1-42.666667 42.666666H213.333333a42.666667 42.666667 0 1 1 0-85.333333h256a42.666667 42.666667 0 0 1 42.666667 42.666667z"
                p-id="5258"
              ></path>
              <path
                d="M341.333333 512a42.666667 42.666667 0 0 1 42.666667 42.666667v256a42.666667 42.666667 0 1 1-85.333333 0v-256a42.666667 42.666667 0 0 1 42.666666-42.666667zM981.333333 682.666667a42.666667 42.666667 0 0 0 42.666667-42.666667V42.666667a42.666667 42.666667 0 0 0-42.666667-42.666667H384a42.666667 42.666667 0 0 0-42.666667 42.666667v170.666666a42.666667 42.666667 0 1 0 85.333334 0V85.333333h512v512h-106.666667a42.666667 42.666667 0 1 0 0 85.333334H981.333333z"
                p-id="5259"
              ></path>
            </svg>
          </div>
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
          <div>
            <svg viewBox="0 0 1024 1024" width="14px" height="14px">
              <path
                d="M630.24 618.56L232.224 158.56a42.4 42.4 0 0 1 4.8-60.224 43.712 43.712 0 0 1 61.152 4.896l401.92 464.48c74.016-31.2 162.368-12.576 216.32 51.744 66.432 79.136 55.648 197.504-24.064 264.384-79.68 66.88-198.144 56.96-264.544-22.208-59.84-71.296-56.992-174.432 2.432-243.072z m60.256 27.2a124.064 124.064 0 0 0-43.968 94.784c0 68.864 56.224 124.704 125.6 124.704 69.344 0 125.568-55.84 125.568-124.704 0-68.864-56.224-124.704-125.568-124.704-22.752 0-44.096 6.016-62.496 16.512a42.688 42.688 0 0 1-5.6 5.696c-4.16 3.456-8.736 6.016-13.536 7.744z m-226.048-78.88l-57.344 66.272a44.48 44.48 0 0 1-1.12 1.216c47.232 67.936 45.568 161.28-9.824 227.264-66.4 79.136-184.864 89.088-264.544 22.208-79.712-66.88-90.496-185.28-24.096-264.384 58.496-69.728 157.408-85.76 234.592-42.816l57.792-66.784a128.48 128.48 0 0 0 64.544 57.024z m158.4-183.04a128.448 128.448 0 0 0-65.728-55.68l194.656-224.96a43.712 43.712 0 0 1 61.152-4.864 42.4 42.4 0 0 1 4.8 60.224l-194.88 225.28zM171.648 836.064c53.12 44.576 132.096 37.952 176.352-14.784 44.288-52.768 37.12-131.68-16.032-176.256-53.12-44.576-132.096-37.952-176.384 14.784-44.256 52.768-37.056 131.68 16.064 176.256z"
                fill="#2c2c2c"
              ></path>
            </svg>
          </div>
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
          <div>
            <svg viewBox="0 0 1024 1024" width="14px" height="14px">
              <path
                d="M861.0304 290.816a32.3072 32.3072 0 0 1-23.2448-10.24l-73.5232-78.7968-73.5232 78.7456a31.9488 31.9488 0 1 1-46.4384-43.8784L742.4 132.096a32.3072 32.3072 0 0 1 23.2448-10.24 30.208 30.208 0 0 1 23.2448 10.24l98.048 104.4992A32.3072 32.3072 0 0 1 885.76 281.6a52.224 52.224 0 0 1-24.5248 9.0112zM762.88 911.36a30.208 30.208 0 0 1-23.2448-10.24l-98.048-104.4992a31.9488 31.9488 0 1 1 46.5408-43.9808l73.5232 78.6944L835.2256 752.64a31.9488 31.9488 0 0 1 46.4384 43.8784L783.616 901.12c-2.56 6.4512-11.6224 10.24-20.48 10.24z"
                fill="#2c2c2c"
              ></path>
              <path
                d="M762.88 859.8528a31.9488 31.9488 0 0 1-32.256-32.256V200.4992a32.256 32.256 0 1 1 64.512 0v627.0976a31.9488 31.9488 0 0 1-32.256 32.256zM510.0544 374.6816H170.7008a32.256 32.256 0 0 1 0-64.512h339.3536a31.9488 31.9488 0 0 1 32.256 32.256 32.768 32.768 0 0 1-32.256 32.256zM510.0544 537.2928H170.7008a32.256 32.256 0 0 1 0-64.512h339.3536a31.9488 31.9488 0 0 1 32.256 32.256 32.768 32.768 0 0 1-32.256 32.256zM508.7744 723.0976H169.4208a32.256 32.256 0 1 1 0-64.512h339.3536a31.9488 31.9488 0 0 1 32.256 32.256 32.768 32.768 0 0 1-32.256 32.256z"
                fill="#2c2c2c"
              ></path>
            </svg>
          </div>
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
          <div>
            <svg viewBox="0 0 1024 1024" width="13px" height="13px">
              <path
                d="M627.498667 55.168l170.666666 170.666667a42.624 42.624 0 0 1 0 60.330666l-469.333333 469.333334A42.538667 42.538667 0 0 1 298.666667 768H128a42.666667 42.666667 0 0 1-42.666667-42.666667v-170.666666c0-11.306667 4.48-22.186667 12.501334-30.165334l469.333333-469.333333a42.624 42.624 0 0 1 60.330667 0zM896 896a42.666667 42.666667 0 0 1 0 85.333333H128a42.666667 42.666667 0 0 1 0-85.333333h768zM597.333333 145.664l-426.666666 426.666667V682.666667h110.336l426.666666-426.666667L597.333333 145.664z"
                fill="#2c2c2c"
              ></path>
            </svg>
          </div>
          <div>重命名</div>
        </div>
        <div
          className="flex flex-1 cursor-pointer items-center gap-[12px] px-4 hover:bg-[#f4f4f5]"
          onClick={() => deleteFileOrFolder(item.name, item.size)}
        >
          <div>
            <svg viewBox="0 0 1024 1024" width="14px" height="14px">
              <path
                d="M883.640502 229.817249H139.689235a45.799295 45.799295 0 0 0 0 91.598589h743.951267a45.799295 45.799295 0 1 0 0-91.598589z"
                fill="#2c2c2c"
              ></path>
              <path
                d="M696.339444 267.408785a40.874639 40.874639 0 0 1-41.038795-41.038795 144.292401 144.292401 0 0 0-288.584803 0 41.038794 41.038794 0 0 1-82.077589 0 226.36999 226.36999 0 0 1 452.739981 0 41.038794 41.038794 0 0 1-41.038794 41.038795zM818.963362 932.237256a41.20295 41.20295 0 0 1-41.038795-41.20295L779.401964 311.894838a41.038794 41.038794 0 0 1 41.038794-41.038794 41.20295 41.20295 0 0 1 41.038795 41.038794l-1.477397 579.139468a41.038794 41.038794 0 0 1-41.038794 41.20295z"
                fill="#2c2c2c"
              ></path>
              <path
                d="M622.797924 734.101956a41.038794 41.038794 0 0 1-40.710484-41.367105l1.477396-187.793524a41.038794 41.038794 0 0 1 41.038795-40.710484 41.038794 41.038794 0 0 1 40.710484 41.367105l-1.477397 187.793524a41.038794 41.038794 0 0 1-41.038794 40.710484z"
                fill="#2c2c2c"
                opacity=".7"
              ></path>
              <path
                d="M407.754641 734.101956a41.038794 41.038794 0 0 1-40.710484-41.367105l1.477396-187.793524a41.038794 41.038794 0 0 1 41.038795-40.710484 41.038794 41.038794 0 0 1 40.710484 41.367105l-1.477397 187.793524a41.038794 41.038794 0 0 1-41.038794 40.710484z"
                fill="#2c2c2c"
                opacity=".7"
              ></path>
              <path
                d="M623.94701 1023.179224H400.039347A236.383456 236.383456 0 0 1 163.984202 786.959923L165.297443 311.894838a41.20295 41.20295 0 0 1 41.038795-41.038794 41.038794 41.038794 0 0 1 41.038794 41.038794l-1.313241 476.050016a154.141712 154.141712 0 0 0 153.977556 153.977557h223.907663a41.038794 41.038794 0 1 1 0 82.077589z"
                fill="#2c2c2c"
              ></path>
            </svg>
          </div>
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
    if (currentItem && renameInput != undefined)
      nameRef.current[currentIndex]?.focus()
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
                  '/' +
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
                            folderPath.split('/').slice(-1)[0] != value &&
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
            {folders?.map((value, index) => {
              return (
                <div
                  className="flex h-[50px] w-full items-center gap-[20px] px-8 text-sm hover:bg-[#FAFAFC]"
                  onClick={() => {
                    setFolderPath(`${folderPath}/${value.name}`)
                  }}
                >
                  <div>
                    {
                      <svg viewBox="0 0 1024 1024" width="35px" height="35px">
                        <path
                          d="M953.9 300.7c-27.2-42-657-19.8-716.3 34.6-59.3 54.4-103.7 511.3-81.5 528.6 22.2 17.3 708.9 17.3 731.1-17.3 22.3-34.6 93.9-503.9 66.7-545.9z"
                          fill="#FFCE45"
                        ></path>
                        <path
                          d="M573.8 252.4c-16.7-39.9-40-82.7-67-95-54.3-24.7-390.3 7.4-432.3 46.9-35 33 26.2 411.3 47.4 536 7.3-141.2 42.7-395 85.9-434.7 29.6-26.9 199.2-45.9 366-53.2z"
                          fill="#FFCE45"
                        ></path>
                      </svg>
                    }
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
          item={currentItem}
          mousePosition={mousePosition}
          index={currentIndex}
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
                <svg viewBox="0 0 1024 1024" width="0.5rem" height="0.5rem">
                  <path
                    d="M918.208 424.96L207.04 13.824C139.456-25.088 55.488 23.552 55.488 101.376v821.76c0 77.824 83.968 125.952 151.04 87.04l711.68-410.624c67.072-38.912 67.072-136.192 0-174.592z"
                    p-id="2313"
                    fill="#707070"
                  ></path>
                </svg>
              </div>
              <div className="hidden xl:block">我的文件</div>
              <div className="hidden md:max-xl:block">Files</div>
              <div>
                <svg viewBox="0 0 1024 1024" width="0.9rem" height="0.9rem">
                  <path
                    d="M512.123 0.43c59.12 0 108.38 49.265 108.38 108.385s-49.265 108.39-108.38 108.39c-59.12 0-108.396-49.274-108.396-108.39C403.732 49.695 453.007 0.43 512.123 0.43z m0 400.712c59.12 0 108.38 49.264 108.38 108.385 0 59.13-49.265 108.39-108.38 108.39-59.12 0-108.396-49.264-108.396-108.39s49.28-108.385 108.396-108.385z m0 400.711c59.12 0 108.38 49.275 108.38 108.386 0 59.13-49.265 108.395-108.38 108.395-59.12 0-108.396-49.27-108.396-108.395 0.005-59.11 49.28-108.386 108.396-108.386z m0 0"
                    fill="#707070"
                  ></path>
                </svg>
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
                    <svg viewBox="0 0 1024 1024" width="0.9rem" height="0.9rem">
                      <path
                        d="M512.123 0.43c59.12 0 108.38 49.265 108.38 108.385s-49.265 108.39-108.38 108.39c-59.12 0-108.396-49.274-108.396-108.39C403.732 49.695 453.007 0.43 512.123 0.43z m0 400.712c59.12 0 108.38 49.264 108.38 108.385 0 59.13-49.265 108.39-108.38 108.39-59.12 0-108.396-49.264-108.396-108.39s49.28-108.385 108.396-108.385z m0 400.711c59.12 0 108.38 49.275 108.38 108.386 0 59.13-49.265 108.395-108.38 108.395-59.12 0-108.396-49.27-108.396-108.395 0.005-59.11 49.28-108.386 108.396-108.386z m0 0"
                        fill="#707070"
                      ></path>
                    </svg>
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
                      '/' +
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
                                targetPath.split('/').slice(-1)[0] != value &&
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
                    !loading && filesAndFolders.length ? 'grid' : 'block',
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
                                  renameInput != undefined
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
                      filesAndFolders.length || loading ? 'none' : 'flex',
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

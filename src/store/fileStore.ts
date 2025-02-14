import { makeAutoObservable, reaction } from 'mobx'
import React from 'react'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

export interface FType {
  name: string
  size: number | null
  path: string
  isBeingRenamed: boolean
  lastModified: Date
}

export type Convert = 1 | 2 | 3 | 4 | 5

class FilesAndFolders {
  files: FType[] = []
  folders: FType[] = []
  refs: React.RefObject<HTMLInputElement>[] = []
  totalPath: string = ''
  folderPath: string = ''
  constructor() {
    makeAutoObservable(this)
    reaction(
      () => this.totalPath, // 监听 `totalPath`
      () => {
        filesReader() // 执行副作用操作
      }
    )
    reaction(
      () => this.folderPath,
      () => {
        folderReader(this.folderPath)
      }
    )
  }
  resetAll(temp: FType[]) {
    this.files = [...temp]
    this.createRefs()
  }

  resetFolders(temp: FType[]) {
    this.folders = [...temp]
  }

  createRefs() {
    this.refs = []
    this.refs = this.files.map(() => React.createRef<HTMLInputElement>())
  }
  setTotalPath(newPath: string) {
    this.totalPath = newPath
  }
  setFolderPath(newPath: string) {
    this.folderPath = newPath
  }
}

class CurrentItem {
  item: FType | null = null
  index: number = -1
  resourceLink: string | null = null
  resourceBlob: Blob | null = null
  constructor() {
    makeAutoObservable(this)
  }
  reset(tempItem: FType | null, tempIndex: number) {
    this.item = tempItem
    this.index = tempIndex
  }

  async fetchResource() {
    try {
      if (this.item?.name.split('.').slice(-1)[0] == 'mp4') {
        return
      } else {
        const url =
          `${baseUrl}/api/file/preview` +
          `?filePath=${encodeURIComponent((this.item as FType).path)}`
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        this.resourceBlob = await res.blob()
        this.resourceLink = URL.createObjectURL(this.resourceBlob)
      }
    } catch (error) {
      console.log(error)
    }
  }

  clearResource() {
    URL.revokeObjectURL(this.resourceLink as string)
    this.resourceLink = null
    this.resourceBlob = null
  }
}

class BasicStates {
  renameInput: string | undefined = undefined
  mousePosition: { x: number; y: number } = { x: 0, y: 0 }
  isLoading: boolean = false
  isSearching: boolean = false
  showMenu: boolean = false
  moveFile: boolean = false
  renderFile: boolean = false
  isSorting: boolean = false
  cutItem: FType | null = null
  copyItem: FType | null = null
  constructor() {
    makeAutoObservable(this)
    reaction(
      () => this.renameInput,
      () => {
        filesAndFolders.refs[currentItem.index]?.current?.focus()
      }
    )
    reaction(
      () => this.showMenu,
      () => {
        folderReader(filesAndFolders.folderPath)
      }
    )
    reaction(
      () => this.renderFile,
      () => {
        if (this.renderFile) currentItem.fetchResource()
        else currentItem.clearResource()
      }
    )
  }
  setIsSorting(isSorting: boolean) {
    this.isSorting = isSorting
  }
  setIsSearching(isSearching: boolean) {
    this.isSearching = isSearching
  }
  setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading
  }
  setRenameInput(newInput: string | undefined) {
    this.renameInput = newInput
  }
  setMousePosition(newPosition: { x: number; y: number }) {
    this.mousePosition = newPosition
  }
  setShowMenu(isShow: boolean) {
    this.showMenu = isShow
  }
  setMoveFile(isMove: boolean) {
    this.moveFile = isMove
  }
  setRenderFile(isRender: boolean) {
    this.renderFile = isRender
  }
  setCutItem(temp: FType | null) {
    this.cutItem = temp
  }
  setCopyItem(temp: FType | null) {
    this.copyItem = temp
  }
}

export const filesAndFolders = new FilesAndFolders()
export const currentItem = new CurrentItem()
export const basicStates = new BasicStates()

export const filterFiles = async (category: number | string) => {
  switch (category) {
    case 1:
      category = 'txt'
      break
    case 2:
      category = 'mp3'
      break
    case 3:
      category = 'mp4'
      break
    case 4:
      category = 'jpg'
      break
    case 5:
      category = 'others'
      break
  }
  basicStates.setIsLoading(true)
  let url = `${baseUrl}/api/file/filter`
  url += '?' + `category=${category}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  const result = await response.json()
  const temp: FType[] = []
  for (const file of result.files) {
    temp.push({
      name: file.fileName,
      path: file.filePath.replace(/\\/g, '/'),
      size: file.fileSize,
      isBeingRenamed: false,
      lastModified: new Date(file.lastModified),
    })
  }
  filesAndFolders.resetAll([...temp])
  setTimeout(() => {
    basicStates.setIsLoading(false)
  }, 300)
}

export const filesReader = async () => {
  basicStates.setIsLoading(true)
  try {
    let url = `${baseUrl}/api/file/reader`
    url += '?' + `pathQuery=${encodeURIComponent(filesAndFolders.totalPath)}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    const result = await response.json()
    const temp: FType[] = []
    for (const folder of result.folders) {
      temp.push({
        path: folder.folderPath.replace(/\\/g, '/'),
        name: folder.folderName,
        size: null,
        isBeingRenamed: false,
        lastModified: new Date(folder.lastModified),
      })
    }
    for (const file of result.files) {
      temp.push({
        name: file.fileName,
        path: file.filePath.replace(/\\/g, '/'),
        size: file.fileSize,
        isBeingRenamed: false,
        lastModified: new Date(file.lastModified),
      })
    }
    filesAndFolders.resetAll([...temp])
  } catch (error) {
    console.log('文件读取错误 ):', error)
    filesAndFolders.setTotalPath('')
  } finally {
    setTimeout(() => {
      basicStates.setIsLoading(false)
    }, 300)
  }
}

export const cutFileOrFolder = async (cutF: FType) => {
  const temp = []
  for (const f of filesAndFolders.files) {
    if (cutF != f) temp.push(f)
  }
  filesAndFolders.resetAll(temp)
}

export const pasteFileOrFolder = async (
  oldPath: string,
  newPath: string,
  operation: number
) => {
  let url = `${baseUrl}/api/file/paste`
  url += `?oldPath=${encodeURIComponent(
    oldPath
  )}&newPath=${encodeURIComponent(newPath)}&operationType=${
    operation ? 'cut' : 'copy'
  }`
  await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  console.log('paste')
  filesReader()
}

export const renameFileOrFolder = async (f: FType, newName: string) => {
  let url = `${baseUrl}/api/file/rename?`
  if (filesAndFolders.totalPath)
    url +=
      `fPath=${encodeURIComponent(filesAndFolders.totalPath)}&` +
      `originalName=${encodeURIComponent(f.name)}&` +
      `newName=${encodeURIComponent(newName)}`
  else
    url +=
      'fPath=0&' +
      `originalName=${encodeURIComponent(f.name)}&` +
      `newName=${encodeURIComponent(newName)}`
  await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  console.log('rename')
  filesReader()
}

const folderReader = async (currentPath: string) => {
  let url = `${baseUrl}/api/file/reader`
  url += '?' + `pathQuery=${encodeURIComponent(currentPath)}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  const result = await response.json()
  const temp: FType[] = []
  for (const folder of result.folders) {
    temp.push({
      path: folder.folderPath,
      name: folder.folderName,
      size: null,
      isBeingRenamed: false,
      lastModified: new Date(folder.lastModified),
    })
  }
  filesAndFolders.resetFolders(temp)
}

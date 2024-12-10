import { makeAutoObservable } from 'mobx'
import React from 'react'

export interface FType {
  name: string
  size: number | null
  path: string
  isBeingRenamed: boolean
  lastModified: Date
}

class FilesAndFolders {
  files: FType[] = []
  folders: FType[] = []
  refs: React.RefObject<HTMLInputElement>[] = []
  totalPath: string = ''
  folderPath: string = ''
  constructor() {
    makeAutoObservable(this)
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
  constructor() {
    makeAutoObservable(this)
  }
  reset(tempItem: FType | null, tempIndex: number) {
    this.item = tempItem
    this.index = tempIndex
  }
}

class BasicStates {
  renameInput: string | undefined = undefined
  mousePosition: { x: number; y: number } = { x: 2, y: 0 }
  showMenu: boolean = false
  moveFile: boolean = false
  cutItem: FType | null = null
  copyItem: FType | null = null
  constructor() {
    makeAutoObservable(this)
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

export const filesReader = async () => {
  try {
    let url = 'http://localhost:6677/api/file/reader'
    url += '?' + `pathQuery=${encodeURIComponent(filesAndFolders.totalPath)}`
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
    return
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
  let url = 'http://localhost:6677/api/file/paste'
  url += `?oldPath=${encodeURIComponent(
    oldPath
  )}&newPath=${encodeURIComponent(newPath)}&operationType=${
    operation ? 'cut' : 'copy'
  }`
  await fetch(url)
  filesReader()
}

export const renameFileOrFolder = async (f: FType, newName: string) => {
  let url = 'http://localhost:6677/api/file/rename?'
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
  await fetch(url)
  filesReader()
}

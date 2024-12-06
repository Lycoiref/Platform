import { makeAutoObservable } from 'mobx'
import React from 'react'

interface FType {
  name: string
  size: number | null
  path: string
  lastModefined: Date
}

class FilesAndFolders {
  files: FType[] = []
  refs: React.RefObject<HTMLInputElement>[] = []
  constructor() {
    makeAutoObservable(this)
  }
  reset(temp: FType[]) {
    this.files = [...temp]
    this.createRefs()
  }
  createRefs() {
    this.refs = []
    this.refs = this.files.map(() => React.createRef<HTMLInputElement>())
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
export const filesAndFolders = new FilesAndFolders()
export const currentItem = new CurrentItem()

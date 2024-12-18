'use client'
import React, { useLayoutEffect, useRef } from 'react'
import {
  filesAndFolders,
  currentItem,
  basicStates,
  FType,
  filesReader,
} from '@/store/fileStore'
import {
  FileLeftSideBar,
  FileContextMenu,
  FileMainBody,
  FileMoveModal,
  FileOnlinePreview,
} from '@/components'
import { UserIcon, UploadIcon } from '@/components/static/'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

export default function FilePage() {
  const uploadRef = useRef<HTMLInputElement>(null)

  const uploadClick = () => {
    if (uploadRef.current) {
      uploadRef.current.click()
    }
  }

  const uploadFile = async (files: FileList) => {
    if (
      Array.from(files).reduce((sum, f) => sum + f.size, 0) >
      10 * 1024 * 1024 * 1024
    ) {
      alert('单次上传总量不可超过10GB哦,本次操作已取消 ):')
      return
    }
    let url = `${baseUrl}/api/file/upload`

    url += `?pathQuery=${encodeURIComponent(filesAndFolders.totalPath)}`

    for (const file of files) {
      const chunkSize = 1024 * 1024 * 5
      let index = 0
      const [fname, fExt] = file.name.split('.')
      const promises: Promise<Response>[] = []
      while (index * chunkSize < file.size) {
        const blob = file.slice(index * chunkSize, (index + 1) * chunkSize)
        const chunkFile = new File([blob], `${fname}.${index}.${fExt}`)
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
            `${baseUrl}/api/file/merge` +
              `?pathQuery=${encodeURIComponent(filesAndFolders.totalPath)}` +
              `&name=${encodeURIComponent(file.name)}`
          )
        })
        .catch((error) => {
          console.log('传送出错啦！本次传输暂停！！', error)
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

  useLayoutEffect(() => {
    filesReader()
  }, [])

  return (
    <>
      <FileOnlinePreview />
      <FileMoveModal />
      <div
        className="flex h-screen w-screen"
        onClick={() => {
          if (basicStates.showMenu) {
            basicStates.setShowMenu(false)
          }
          if (basicStates.renameInput !== undefined) {
            basicStates.setRenameInput(undefined)
          }
          if (currentItem.item) {
            currentItem.reset(null, -1)
          }
        }}
      >
        <FileContextMenu />
        <FileLeftSideBar />
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
                  onClick={() => {
                    const newFolder: FType = {
                      name: '',
                      path: filesAndFolders.totalPath,
                      size: null,
                      isBeingRenamed: true,
                      lastModified: new Date(),
                    }
                    filesAndFolders.resetAll([
                      newFolder,
                      ...filesAndFolders.files,
                    ])
                    currentItem.reset(newFolder, 0)
                    basicStates.setRenameInput('')
                  }}
                >
                  新建文件夹
                </div>
              </div>
              <FileMainBody />
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

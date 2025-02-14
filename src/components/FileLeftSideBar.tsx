import React, { useState } from 'react'

import { filesAndFolders, filesReader, filterFiles } from '@/store/fileStore'

import {
  LeftBarSet,
  LeftBarDocument,
  LeftBarMusic,
  LeftBarPhoto,
  LeftBarOthers,
  LeftBarVideo,
  ExpandIconA,
  ExpandIconB,
} from './static'

const FileLeftSideBar = () => {
  const [expandCategories, setExpandCategories] = useState(true)
  const [showLeftBar, setShowLeftBar] = useState(false)

  const category = [
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
  return (
    <>
      <div className="hidden w-[18%] bg-[#f9fafb] p-6 md:block">
        <div className="flex h-full w-full flex-col items-center">
          <div className="md:max-xl:text:lg flex h-[2.5rem] w-full cursor-pointer items-center justify-around text-base font-bold text-[#707070] xl:text-xl">
            <div
              onClick={() => {
                setExpandCategories(!expandCategories)
              }}
              style={{
                transform: expandCategories ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'all 0.3s ease-in-out',
              }}
              className="flex h-1/2 w-[8%] cursor-pointer items-center justify-center"
            >
              <ExpandIconA />
            </div>
            <div
              className="hidden xl:block"
              onClick={() => {
                filesAndFolders.setTotalPath('')
                filesReader()
              }}
            >
              我的文件
            </div>
            <div className="hidden md:max-xl:block">Files</div>
            <LeftBarSet />
          </div>
          <div className="h-5"></div>
          <div
            style={{
              overflow: 'hidden',
              transform: expandCategories ? 'scaleY(1)' : 'scaleY(0)',
              transformOrigin: 'top',
              opacity: expandCategories ? 1 : 0,
              transition: 'all 0.35s ease',
            }}
            className="flex w-full flex-col items-center gap-2"
          >
            {expandCategories &&
              category.map((value) => {
                return (
                  <div
                    className="flex h-[2.5rem] w-full cursor-pointer items-center justify-center gap-4 rounded-lg text-xs font-semibold text-[#707070] hover:bg-[#f3f4f6] md:text-sm"
                    onClick={() => filterFiles(value.id)}
                  >
                    {value.component}
                    <div className="hidden xl:block">{value.name}</div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
      <div className="fixed z-10 block h-full bg-[#f9fafb] md:hidden">
        <div>
          <div
            style={{
              opacity: showLeftBar ? 1 : 0,
              width: showLeftBar ? '70vw' : '0vw',
              transition: 'all 0.3s ease',
            }}
          >
            <div
              className="flex h-full w-full flex-col items-center p-8"
              style={{ padding: showLeftBar ? '32px' : '0px' }}
            >
              <div
                onClick={() => {
                  filesAndFolders.setTotalPath('')
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
                  category.map((value) => {
                    return (
                      <div
                        className="flex h-[2.5rem] w-full cursor-pointer items-center justify-center gap-4 rounded-lg text-xs font-semibold text-[#707070] hover:bg-[#f3f4f6] md:text-sm"
                        onClick={() => filterFiles(value.id)}
                      >
                        {value.component}
                        <div>{value.name}</div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
          <div
            className="fixed top-[15vw] flex h-[6vw] w-[6vw] cursor-pointer items-center justify-center rounded-full bg-[#f9fafb]"
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
    </>
  )
}
export default FileLeftSideBar

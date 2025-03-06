'use client'
import { UserIcon, FrontPageFile } from '@/components/static'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FunctionModules = { icon: any; name: string; route: string }
const functionModules: FunctionModules[] = [
  {
    icon: <FrontPageFile />,
    name: '文件管理',
    route: '/file',
  },
]
const Home = () => {
  return (
    <div className="flex h-screen w-screen flex-col">
      <div className="flex h-[8%] w-full justify-between text-xl font-semibold text-blue-600 shadow-[0px_1px_4px_rgba(0,0,0,0.1)]">
        <div className="flex w-2/3 items-center justify-center text-blue-700 md:max-xl:w-1/2 xl:w-1/4">
          HelloWorld Platform
        </div>
        <div className="hidden w-1/4 items-center justify-center gap-8 xl:flex">
          <div>Welcome to HelloWorld ~</div>
          <div>
            <UserIcon></UserIcon>
          </div>
        </div>
        <div className="flex w-1/4 items-center justify-center xl:hidden">
          <UserIcon></UserIcon>
        </div>
      </div>
      <div className="flex h-[92%] w-full">
        <div className="h-full w-3/4 p-10 md:flex">
          <div className="grid h-full w-full grid-cols-[repeat(auto-fit,minmax(100px,150px))] grid-rows-[repeat(auto-fit,minmax(100px,150px))] gap-8 overflow-auto rounded-xl bg-indigo-50 p-8 px-12">
            {functionModules.map((item) => {
              return (
                <div
                  className="flex h-full w-[90%] cursor-pointer flex-col justify-center gap-2 rounded-xl p-6 pt-2 font-semibold text-gray-500 hover:bg-indigo-100"
                  onClick={() => {
                    window.location.href = item.route
                  }}
                >
                  <div className="flex justify-center">{item.icon}</div>
                  <div className="flex justify-center">{item.name}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="h-full w-1/4 p-10 pl-0">
          <div className="h-[90%] w-full">
            <div className="h-1/2 w-full pb-5">
              <div className="h-full w-full rounded-xl shadow-[0px_0px_4px_rgba(0,0,0,0.1)]">
                天气（尚未完成版
              </div>
            </div>
            <div className="h-1/2 w-full pt-5">
              <div className="h-full w-full rounded-xl shadow-[0px_0px_4px_rgba(0,0,0,0.1)]">
                日历（尚未完成版
              </div>
            </div>
          </div>
          <div className="flex h-[10%] w-full items-end justify-end text-xl font-semibold text-blue-600">
            <div
              className="cursor-pointer"
              onClick={() => {
                window.location.href = '/about'
              }}
            >
              About us
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

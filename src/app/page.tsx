'use client'
import { UserIcon, FrontPageFile } from '@/components/static'
import { useRouter } from 'next/navigation'
import { student } from '@/store/basicInfoStore'
import { observer } from 'mobx-react'
import { WeatherModal } from '@/components'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FunctionModules = { icon: any; name: string; route: string }
const functionModules: FunctionModules[] = [
  {
    icon: <FrontPageFile />,
    name: '文件管理',
    route: '/file',
  },
]
const navItems = [
  {
    path: '/',
    route: '首页',
  },
  {
    path: '/about',
    route: '关于',
  },
  {
    path: '/assistant',
    route: '帮助',
  },
  {
    path: '/contact',
    route: '联系我们',
  },
]
const Home = observer(() => {
  console.log(student)
  const router = useRouter()
  return (
    <div className="flex h-screen w-screen flex-col">
      <div className="flex h-[8%] w-full justify-between px-10 text-sm shadow-[0px_1px_4px_rgba(0,0,0,0.1)]">
        <div className="flex gap-6">
          <div className="flex items-center">
            <UserIcon></UserIcon>
          </div>
          <div className="flex items-center font-semibold">{student.name}</div>
        </div>
        <div className="flex items-center gap-8">
          {navItems.map((item) => {
            return (
              <div
                className="cursor-pointer hover:text-blue-800"
                style={{
                  fontWeight: '/' == `${item.path}` ? 600 : 500,
                  color: '/' == `${item.path}` ? '#193CB8' : '',
                }}
                onClick={() => {
                  router.push(item.path)
                }}
              >
                {item.route}
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex h-[92%] w-full">
        <div className="h-full w-3/4 p-10 md:flex md:flex-col md:gap-10">
          <div className="flex flex-1 flex-col gap-2">
            {student.id === 88888888 ? (
              <>
                <div className="text-2xl font-semibold">
                  欢迎来到 HelloWorld，请先登陆哦（游客身份将无法体验社团功能）
                </div>
                <div className="text-sm text-gray-500">
                  Welcome to HelloWorld&nbsp;!!!
                </div>
                <div
                  className="flex w-full cursor-pointer justify-end hover:font-semibold hover:text-blue-800"
                  onClick={() => {
                    router.push('/auth')
                  }}
                >
                  点我去登录
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold">
                  你好，{student.name}&nbsp;同学
                </div>
                <div className="text-sm text-gray-500">
                  欢迎来到 HalloWorld ，在此管理你的学习资源与信息
                </div>
              </>
            )}
          </div>

          <div className="grid h-[180px] w-full grid-cols-[repeat(auto-fit,minmax(100px,150px))] gap-8 overflow-x-auto rounded-xl p-4 px-4 shadow-[0px_0px_4px_rgba(0,0,0,0.15)]">
            {functionModules.map((item) => {
              return (
                <div
                  className="flex h-full w-[90%] cursor-pointer flex-col justify-center gap-2 rounded-xl p-2 font-semibold text-gray-500 hover:bg-gray-50"
                  onClick={() => {
                    router.push(item.route)
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
          <div className="h-full w-full">
            <div className="h-2/5 w-full pb-5">
              <WeatherModal width="100%" height="100%"></WeatherModal>
            </div>
            <div className="h-3/5 w-full pt-5">
              <div className="h-full w-full rounded-xl shadow-[0px_0px_4px_rgba(0,0,0,0.15)]">
                日历（尚未完成版
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default Home

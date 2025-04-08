'use client'
import { UserIcon, FrontPageFile } from '@/components/static'
import { useRouter } from 'next/navigation'
import { student } from '@/store/basicInfoStore'
import { observer } from 'mobx-react'
import { WeatherModal, DailySchedule } from '@/components'

const exampleCourses = [
  {
    day: 2, // 周一
    session: '3-4节',
    classLocation: '实验楼B305',
    scheduleWeeks: '1-16周',
    classroomId: 'B305',
    courseCode: 'CS102',
    courseName: '数据结构',
    teacherName: '李教授',
    courseCredit: 4,
  },
  {
    day: 2, // 周一
    session: '5-6节',
    classLocation: '实验楼B305',
    scheduleWeeks: '1-16周',
    classroomId: 'B305',
    courseCode: 'CS102',
    courseName: '数据结构',
    teacherName: '李教授',
    courseCredit: 4,
  },
  {
    day: 2, // 周一
    session: '7-8节',
    classLocation: '实验楼B305',
    scheduleWeeks: '1-16周',
    classroomId: 'B305',
    courseCode: 'CS102',
    courseName: '数据结构',
    teacherName: '李教授',
    courseCredit: 4,
  },
  {
    day: 2, // 周一
    session: '1-2节',
    classLocation: '教学楼A201',
    scheduleWeeks: '1-16周',
    classroomId: 'A201',
    courseCode: 'CS101',
    courseName: '计算机科学导论',
    teacherName: '张教授',
    courseCredit: 3,
  },
]
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
  const router = useRouter()
  if (localStorage.getItem('token'))
    try {
      student.judgeToken()
    } catch (err) {
      console.log(err)
    }

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
        <div className="flex h-full w-3/4 flex-col gap-10 p-10">
          {student.id === 88888888 ? (
            <div className="flex flex-col gap-2">{/* 游客内容不变 */}</div>
          ) : (
            <>
              {/* 使用网格布局重构顶部区域 */}
              <div className="grid min-h-0 flex-1 grid-cols-3 gap-10">
                <div className="col-span-2 flex flex-col gap-2">
                  <div className="text-3xl font-bold">
                    你好，{student.name}&nbsp;同学
                  </div>
                  <div className="text-sm text-gray-500">
                    欢迎来到 HalloWorld ，在此管理你的学习资源与信息
                  </div>
                </div>
                <div className="h-full min-h-[400px]">
                  <DailySchedule
                    courses={exampleCourses}
                    width={'100%'}
                    height={'100%'}
                  />
                </div>
              </div>

              {/* 底部功能模块 - 保持固定高度和正确间距 */}
              <div className="grid h-[180px] w-full grid-cols-[repeat(auto-fit,minmax(100px,150px))] gap-8 overflow-x-auto rounded-xl p-4 shadow-[0px_0px_4px_rgba(0,0,0,0.15)]">
                {functionModules.map((item, index) => (
                  <div
                    key={index}
                    className="flex h-full w-[90%] cursor-pointer flex-col justify-center gap-2 rounded-xl p-2 font-semibold text-gray-500 hover:bg-gray-50"
                    onClick={() => router.push(item.route)}
                  >
                    <div className="flex justify-center">{item.icon}</div>
                    <div className="flex justify-center">{item.name}</div>
                  </div>
                ))}
              </div>
            </>
          )}
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

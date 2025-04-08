import React from 'react'

interface Course {
  day: number
  session: string
  classLocation: string
  scheduleWeeks: string
  classroomId: string
  courseCode: string
  courseName: string
  teacherName: string
  courseCredit: number
}

interface DailyScheduleProps {
  width?: string | number
  height?: string | number // 必须设置固定高度
  courses: Course[]
  className?: string
  targetDay?: number
}

const DailySchedule: React.FC<DailyScheduleProps> = ({
  width = '100%',
  height = '500px', // 默认固定高度
  courses,
  targetDay,
}) => {
  const dayToShow = targetDay || new Date().getDay() || 7

  const dailyCourses = courses
    .filter((course) => course.day === dayToShow)
    .sort((a, b) => {
      const aStart = parseInt(a.session.split('-')[0])
      const bStart = parseInt(b.session.split('-')[0])
      return aStart - bStart
    })

  const weekDays = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

  return (
    <div
      className="flex flex-col rounded-xl bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.15)]"
      style={{
        width,
        height, // 固定高度
        minHeight: '300px', // 最小高度保证
      }}
    >
      {/* 固定高度的头部 */}
      <div className="flex-shrink-0 rounded-xl bg-blue-600 px-5 py-4 text-white">
        <h2 className="m-0 text-xl font-semibold">每日课表</h2>
        <div className="mt-1 text-sm opacity-90">
          {weekDays[dayToShow]}{' '}
          {!targetDay && `· ${new Date().toLocaleDateString()}`}
        </div>
      </div>

      {/* 可滚动的内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {dailyCourses.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            当天没有课程安排
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {dailyCourses.map((course, index) => (
              <li
                key={`${course.courseCode}-${index}`}
                className="px-5 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div className="mr-5 flex min-w-[80px] flex-col items-center">
                    <span className="text-lg font-semibold text-blue-600">
                      {course.session}
                    </span>
                    <span className="mt-1 text-xs text-gray-500">
                      08:00-09:40
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 truncate text-lg font-medium text-gray-800">
                      {course.courseName}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="max-w-[120px] truncate">
                        {course.teacherName}
                      </span>
                      <span className="max-w-[100px] truncate">
                        {course.classLocation}
                      </span>
                      <span>{course.scheduleWeeks}</span>
                    </div>
                  </div>

                  <div className="ml-2 whitespace-nowrap rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-500">
                    {course.courseCredit}学分
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default DailySchedule

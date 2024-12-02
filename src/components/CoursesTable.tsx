import React, { useState } from 'react'

interface JcPart {
  total: number
  timePeriod: string
}

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

interface DailyCourse {
  c1?: Course
  c2?: Course
  c3?: Course
  c4?: Course
  c5?: Course
  c6?: Course
  c7?: Course
  c8?: Course
  c9?: Course
  c10?: Course
  c11?: Course
  c12?: Course
  c14?: Course
  c15?: Course
  c16?: Course
  [key: string]: Course | undefined
}

interface Color {
  font: string
  content: string
  padding: string
  [key: string]: string
}

type DayOfWeek = 'Mon' | 'Tues' | 'Wed' | 'Thur' | 'Fri' | 'Sat' | 'Sun'
const colors: Color[] = [
  {
    font: '#16a34a', //绿
    content: '#bbf7d0',
    padding: '#34d399',
  },
  {
    font: '#bc6685', //粉
    content: '#f8e3ea',
    padding: '#f19aba',
  },
  {
    font: '#1e40af', //蓝
    content: '#dbe7ff',
    padding: '#87aefe',
  },
  {
    font: '#8a6fcb', //紫
    content: '#e9e4fa',
    padding: '#a88ef2',
  },
  {
    font: '#b94f53', //红
    content: '#fedfdd',
    padding: '#fe9292',
  },
]

function CoursesTable({
  sessionInfo,
  coursesData,
  width,
  height,
}: {
  sessionInfo: JcPart
  coursesData: Course[]
  width?: string
  height?: string
}) {
  const { timePeriod } = sessionInfo

  if (!width) width = '600px'
  if (!height) height = '1000px'

  const sessionPeriod = timePeriod.split(' ')
  const dayOfWeek: DayOfWeek[] = [
    'Mon',
    'Tues',
    'Wed',
    'Thur',
    'Fri',
    'Sat',
    'Sun',
  ]
  const dailyCourses: DailyCourse[] = [{}, {}, {}, {}, {}, {}, {}]

  for (const course of coursesData) {
    const last = course.session.split('-')
    const from = Number(last[0])
    const to = Number(last[1])
    for (let i = from; i <= to; i++) {
      dailyCourses[course.day - 1][`c${i}`] = course
    }
  }

  const [pointerPosition, setPointerPosition] = useState({
    row: 0,
    col: 0,
  })
  const [modalVisible, setModalVisible] = useState(false)
  const openModal = (newrow: number, newcol: number) => {
    setPointerPosition({ row: newrow, col: newcol })
    setModalVisible(true)
  }
  const closeModal = () => {
    setModalVisible(false)
  }
  const pointerCourse =
    dailyCourses[pointerPosition.col][`c${pointerPosition.row + 1}`]

  const courses = dayOfWeek.map((dayIndex, indexCol) => (
    <div key={indexCol} className="flex flex-1 flex-col items-stretch">
      {sessionPeriod.map((value, indexRow) => {
        let gridNumber = 1
        const tempCourse = dailyCourses[indexCol][`c${indexRow + 1}`]
        if (tempCourse) {
          const last = tempCourse.session.split('-')
          const colorIndex = Number(tempCourse.courseCode.slice(-1)) % 5
          const from = Number(last[0])
          const to = Number(last[1])
          if (from == indexRow + 1) {
            gridNumber = to - from + 1
            return (
              <div
                key={indexCol + indexRow * 10 + 100}
                onClick={() => openModal(indexRow, indexCol)}
                className={`box-content flex cursor-pointer flex-col items-stretch justify-between rounded-md border-b-2 border-dashed border-[#cbd5e1] hover:shadow-[inset_0px_0px_4px_rgba(0,0,0,0.1)]`}
                style={{
                  flex: gridNumber,
                  backgroundColor: `${colors[colorIndex].content}`,
                  paddingBottom: `${2 * gridNumber - 2}px`,
                }}
              >
                <div
                  className="h-[7px] w-full rounded-t-md"
                  style={{ backgroundColor: `${colors[colorIndex].padding}` }}
                ></div>
                <div
                  className="flex w-full flex-1 flex-col"
                  style={{ color: `${colors[colorIndex].font}` }}
                >
                  <div className="h-[15%] w-full"></div>
                  <div className="flex h-[60%] w-full flex-col px-1">
                    <div className="flex flex-1 items-end justify-center text-center text-xs">
                      {tempCourse.courseName}
                    </div>
                    <div className="h-[8px]"></div>
                    <div className="items-top flex flex-1 justify-center text-center text-xs">
                      {tempCourse.classLocation}
                    </div>
                  </div>
                  <div className="h-[25%] w-full"></div>
                </div>
              </div>
            )
          } else
            return (
              <div
                key={indexCol + indexRow * 10 + 100}
                className="hidden"
              ></div>
            )
        } else {
          return (
            <div
              key={indexCol + indexRow * 10 + 100}
              className={`box-content flex flex-1 items-center justify-center border-b-2 border-dashed border-[#cbd5e1]`}
            ></div>
          )
        }
      })}
    </div>
  ))

  const timestamp = Date.now()
  const date = new Date(timestamp)
  // const year = date.getFullYear()
  const month = date.getMonth() + 1
  // const day = date.getDay()

  return (
    <>
      <div
        className="flex flex-col rounded-md bg-[#f1f5f9] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)]"
        style={{ width: width, height: height }}
      >
        <div
          className="absolute z-10 flex cursor-pointer items-center justify-center bg-[rgba(0,0,0,0.5)]"
          onClick={closeModal}
          style={{
            width: width,
            height: height,
            opacity: modalVisible ? 1 : 0,
            pointerEvents: modalVisible ? 'auto' : 'none',
          }}
        >
          <div
            className="flex aspect-[4/3] w-3/5 cursor-pointer rounded-md bg-[#ffffff] p-[5%]"
            onClick={(event) => {
              event.stopPropagation()
            }}
            style={{
              transform: modalVisible ? 'scale(1)' : 'scale(0.7)',
              transition: 'all 0.1s ease-in-out',
            }}
          >
            <div className="flex flex-1 flex-col">
              <div className="text-ms flex-1 font-semibold">
                {pointerCourse?.courseName}
              </div>
              <div className="flex-1">{`第 ${pointerCourse?.scheduleWeeks.split('-')[0]} - ${pointerCourse?.scheduleWeeks.split('-')[1]} 周`}</div>
              <div className="flex-1">{`第 ${pointerCourse?.session.split('-')[0]} - ${pointerCourse?.session.split('-')[1]} 节 ${sessionPeriod[Number(pointerCourse?.session.split('-')[0]) - 1].split('-')[0]} - ${sessionPeriod[Number(pointerCourse?.session.split('-')[1]) - 1].split('-')[1]}`}</div>
              <div className="flex-1">
                {pointerCourse?.classLocation.replace(/(\d+)/g, ' $1 ')}
              </div>
              <div className="flex-1">{pointerCourse?.teacherName}</div>
              <div className="flex-1">{`学分：${pointerCourse?.courseCredit.toFixed(1)}`}</div>
            </div>
            <div className="h-4/5 w-[6px] rounded-lg bg-[#60a5fa]"></div>
            <div className="w-[3%]"></div>
          </div>
        </div>
        <div
          className="z-0 h-full w-full"
          style={{ filter: modalVisible ? 'blur(3px)' : 'blur(0)' }}
        >
          <div className="h-[10%] rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.15)]">
            <div className="flex h-[50%] flex-col items-center justify-center rounded-md bg-[#f1f5f9] p-2">
              <div className="h-[15%] w-full"></div>
              <div className="flex h-[85%] w-full justify-center">
                {/* <div className='flex-1 flex i`tems-center justify-center font-bold text-xl text-[#94a3b8]'>{`${year}年${month}月${day}日`}</div> */}
                <div className="flex w-[40%] items-center justify-center text-xl">
                  Total
                </div>
                {/* <div className='flex-1'></div>` */}
              </div>
            </div>
            <div className="flex h-[50%] bg-[#f1f5f9]">
              <div className="flex w-[8%] items-center justify-center">
                {month}
              </div>
              <div className="flex w-[92%]">
                {dayOfWeek.map((day) => (
                  <div
                    key={day}
                    className="flex flex-1 items-center justify-center"
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="h-[4px]"></div>
          <div className="flex h-[90%]">
            <div className="flex w-[8%] flex-col">
              {sessionPeriod.map((value, index) => {
                return (
                  <div
                    key={index}
                    className="flex flex-1 flex-col items-center justify-center"
                  >
                    <div className="h-[20%]"></div>
                    <div className="flex flex-[2_1_0%] items-center justify-center text-lg">
                      {index + 1}
                    </div>
                    <div className="flex flex-1 items-end text-xs text-[#6b7280]">
                      {value.split('-')[0]}
                    </div>
                    <div className="items-top flex flex-1 text-xs text-[#6b7280]">
                      {value.split('-')[1]}
                    </div>
                    <div className="h-[20%]"></div>
                  </div>
                )
              })}
            </div>
            <div className="flex w-[92%]">{courses}</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CoursesTable

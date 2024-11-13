import React , { useState } from 'react';

interface JcPart{
  total: number
  timePeriod: string
}

interface Course{
  day: number
  session: string
  classLocation: string,
  scheduleWeeks: string
  classroomId: string
  courseCode: string
  courseName: string
  teacherName: string
  courseCredit: number
}

interface DailyCourse{
  c1?: Course,
  c2?: Course,
  c3?: Course,
  c4?: Course,
  c5?: Course,
  c6?: Course,
  c7?: Course,
  c8?: Course,
  c9?: Course,
  c10?: Course,
  c11?: Course,
  c12?: Course,
  c14?: Course,
  c15?: Course,
  c16?: Course
  [key: string]: Course | undefined
}

interface Color{
  font: string,
  content: string,
  padding: string
  [key: string]: string
}

type DayOfWeek = 'Mon' | 'Tues' | 'Wed' | 'Thur' | 'Fri' | 'Sat' | 'Sun';
const colors: Color[]= [
  {                             
    font: '#16a34a',     //绿
    content: '#bbf7d0',
    padding: '#34d399'
  },{
    font: '#bc6685',     //粉
    content: '#f8e3ea',
    padding: '#f19aba'
  },{
    font:'#1e40af',      //蓝 
    content: '#dbe7ff',
    padding: '#87aefe'
  },{  
    font: '#8a6fcb',     //紫
    content: '#e9e4fa',
    padding: '#a88ef2'
  },{
    font: '#b94f53',     //红
    content: '#fedfdd',
    padding: '#fe9292'
  }
]

function CoursesTable({sessionInfo , coursesData, width , height}
   : {sessionInfo: JcPart , coursesData: Course[] , width?: string , height?: string} ) {
  
  const { timePeriod } = sessionInfo 
  
  if( !width ) width = '600px'
  if( !height ) height = '1000px'
  
  const sessionPeriod = timePeriod.split(" ")
  const dayOfWeek : DayOfWeek[] = ['Mon' , 'Tues' , 'Wed' , 'Thur' , 'Fri' , 'Sat' , 'Sun']
  const dailyCourses: DailyCourse[] = [{},{},{},{},{},{},{}]
  
  for(const course of coursesData){
    const last = course.session.split('-')
    const from = Number(last[0])
    const to = Number(last[1])
    for(let i = from;i <= to ; i++){
      dailyCourses[course.day - 1][`c${i}`] = course
    }
  }

  const [pointerPosition , setPointerPosition] = useState({
    row: 0,
    col: 0
  })
  const [modalVisible , setModalVisible] = useState(false)
  const openModal = (newrow: number , newcol: number) => {
    setPointerPosition({row: newrow , col: newcol})
    setModalVisible(true)
  }
  const closeModal = () => {
    setModalVisible(false)

  }
  const pointerCourse =  dailyCourses[pointerPosition.col][`c${pointerPosition.row + 1}`]

  const courses = dayOfWeek.map(( dayIndex , indexCol ) => 
    <div key={indexCol} className='flex-1 flex flex-col items-stretch'>
      {
        sessionPeriod.map((value , indexRow) => {
          let gridNumber = 1
          const tempCourse = dailyCourses[indexCol][`c${indexRow+1}`]
          if(tempCourse){
            const last = tempCourse.session.split('-')
            const colorIndex = Number(tempCourse.courseCode.slice(-1)) % 5
            const from = Number(last[0])
            const to = Number(last[1])
            if(from == indexRow + 1) {
              gridNumber = to - from + 1
              return(
                  <div key={indexCol + indexRow * 10 + 100}
                      onClick={() => openModal(indexRow,indexCol)}
                      className={`flex flex-col rounded-md items-stretch cursor-pointer hover:shadow-[inset_0px_0px_4px_rgba(0,0,0,0.1)] justify-between border-dashed box-content border-b-2 border-[#cbd5e1]`}
                      style={{flex: gridNumber,backgroundColor: `${colors[colorIndex].content}`,paddingBottom: `${2*gridNumber-2}px`}}>
                    <div className='w-full h-[7px] rounded-t-md' style={{backgroundColor: `${colors[colorIndex].padding}`}}></div>
                    <div className='w-full flex-1 flex flex-col' style={{color: `${colors[colorIndex].font}`}}>
                      <div className='w-full h-[15%]'></div>
                      <div className='w-full h-[60%] px-1 flex flex-col'>
                        <div className='flex-1 flex justify-center text-center text-xs items-end'>{tempCourse.courseName}</div>
                        <div className='h-[8px]'></div>
                        <div className='flex-1 flex justify-center text-center text-xs items-top'>{tempCourse.classLocation}</div>
                      </div>
                      <div className='w-full h-[25%]'></div>
                    </div>
                  </div>
                ) 
            }else return(
              <div key={indexCol + indexRow * 10 + 100} className='hidden'></div>
            )
          }else{
            return(
              <div key={indexCol + indexRow * 10 + 100}  
                  className={`flex-1 flex items-center justify-center box-content border-dashed border-b-2 border-[#cbd5e1]`}>
              </div>
            )
          }
        })
      }
    </div>
  )

  const timestamp = Date.now()
  const date = new Date(timestamp)
  // const year = date.getFullYear()
  const month = date.getMonth() + 1
  // const day = date.getDay()

  
  return (
    <>
      <div className='rounded-md shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)] bg-[#f1f5f9] flex flex-col' style={{width: width , height: height}}>
        <div className='absolute z-10 bg-[rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer' onClick={closeModal} style={{width: width , height: height , opacity: modalVisible ? 1 : 0 , pointerEvents: modalVisible ? 'auto' : 'none'}}>
          <div className='flex w-3/5 rounded-md p-[5%] aspect-[4/3] cursor-pointer bg-[#ffffff]' 
            onClick={(event) => {
              event.stopPropagation()
            }} style={{transform: modalVisible ? 'scale(1)' : 'scale(0.7)', transition: "all 0.1s ease-in-out"}}>
            <div className='flex-col flex-1 flex'>
              <div className='flex-1 text-ms font-semibold'>{pointerCourse?.courseName}</div>
              <div className='flex-1 '>{`第 ${pointerCourse?.scheduleWeeks.split('-')[0]} - ${pointerCourse?.scheduleWeeks.split('-')[1]} 周`}</div>
              <div className='flex-1 '>{`第 ${pointerCourse?.session.split('-')[0]} - ${pointerCourse?.session.split('-')[1]} 节 ${sessionPeriod[Number(pointerCourse?.session.split('-')[0])-1].split('-')[0]} - ${sessionPeriod[Number(pointerCourse?.session.split('-')[1])-1].split('-')[1]}`}</div>
              <div className='flex-1 '>{pointerCourse?.classLocation.replace(/(\d+)/g, ' $1 ')}</div>
              <div className='flex-1 '>{pointerCourse?.teacherName}</div>
              <div className='flex-1 '>{`学分：${pointerCourse?.courseCredit.toFixed(1)}`}</div>
            </div>
            <div className='w-[6px] h-4/5 bg-[#60a5fa] rounded-lg'></div>
            <div className='w-[3%]'></div>
          </div>
        </div>
        <div className='w-full h-full z-0' style={{filter: modalVisible ? 'blur(3px)' : 'blur(0)'}}>
          <div className='h-[10%] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.15)] rounded-md'>
            <div className='h-[50%] rounded-md bg-[#f1f5f9] p-2 flex flex-col items-center justify-center'>
              <div className='w-full h-[15%]'></div>
              <div className='w-full h-[85%] flex justify-center'>
                {/* <div className='flex-1 flex i`tems-center justify-center font-bold text-xl text-[#94a3b8]'>{`${year}年${month}月${day}日`}</div> */}
                <div className='w-[40%] flex items-center justify-center text-xl'>Total</div>
                {/* <div className='flex-1'></div>` */}
              </div>
            </div>
            <div className='h-[50%] bg-[#f1f5f9] flex'>
              <div className='w-[8%] flex items-center justify-center'>{month}</div>
              <div className='w-[92%] flex'>
                {dayOfWeek.map(day =>
                  <div key={day} className='flex flex-1 items-center justify-center'>
                    {day}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='h-[4px]'></div>
          <div className='h-[90%] flex'>
            <div className='w-[8%] flex flex-col '>
              {sessionPeriod.map(( value , index )=> {
                return  <div key={index} className='flex-1 flex flex-col items-center justify-center' >
                          <div className='h-[20%]'></div>
                          <div className='flex-[2_1_0%] flex text-lg justify-center items-center'>{ index + 1 }</div>
                          <div className='flex-1 flex text-xs text-[#6b7280] items-end'>{ value.split('-')[0] }</div>
                          <div className='flex-1 flex text-xs text-[#6b7280] items-top'>{ value.split('-')[1] }</div>
                          <div className='h-[20%]'></div>
                        </div>})}
            </div>
            <div className='w-[92%] flex'>{courses}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CoursesTable
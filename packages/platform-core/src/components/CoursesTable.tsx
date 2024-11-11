import React from 'react';

interface JcPart{
  total: number
  timePeriod: string
}

interface Course{
  day: number
  session: string
  classroomId: string
  courseCode: string
  courseName: string
  teacherName: string
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
  c16?: Course,
  [key: string]: Course | undefined
}

type DayOfWeek = 'Mon' | 'Tues' | 'Wed' | 'Thur' | 'Fri' | 'Sat' | 'Sun';

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

  const courses = dayOfWeek.map(( dayIndex , indexCol ) => 
    <div key={indexCol} className='flex-1 flex flex-col items-stretch'>
      {
        sessionPeriod.map((value , indexRow) => {
          let gridNumber = 1
          const last = dailyCourses[indexCol][`c${indexRow+1}`]?.session.split('-')
          if(last){
            const from = Number(last[0])
            const to = Number(last[1])
            if(from == indexRow + 1) {
              gridNumber = to - from + 1
              return(
                <div key={indexCol + indexRow * 10 + 100}
                    className={`flex flex-col rounded-md items-stretch justify-between border-dashed box-content border-b-2 bg-[#bbf7d0] border-[#cbd5e1]`}
                    style={{flex: gridNumber,paddingBottom: `${2*gridNumber-2}px`}}>
                  <div className='w-full h-[4px] bg-[#34d399] rounded-t-md'></div>
                  <div className='w-full flex-1 flex text-[#16a34a] items-center justify-center'>
                    {dailyCourses[indexCol][`c${indexRow + 1}`]?.courseName}
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



  return (
    <div className='rounded-md shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)] bg-[#f1f5f9] flex flex-col' style={{width: width,height: height}}>
      <div className='h-[10%] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.15)] rounded-md'>
        <div className='h-[50%] rounded-md bg-[#f1f5f9] flex items-center justify-center'>Total</div>
        <div className='h-[50%] bg-[#f1f5f9] flex'>
          <div className='w-[8%] flex items-center justify-center'>11月</div>
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
            return  <div key={index} className='flex-1 flex items-center justify-center' >
                      {index + 1}
                    </div>})}
        </div>
        <div className='w-[92%] flex'>{courses}</div>
      </div>
    </div>
  );
}

export default CoursesTable
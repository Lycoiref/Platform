展示类 · CoursesTable

# 课表

课表用于课程的页面渲染，旨在提供一个较为美观的课表页面

## 代码演示

### 如何引入

```typescript
import React from 'react'
import CoursesTable from "@/components/CoursesTable";

const exInfo = {
  total: 1;
  timePeriod: '8:00-20:00'
};

const exData = [{
    day: 1,           // 星期几上课，1表示周一
    session: "1-1",         // 上课节次，表示第3到第5节
    classroomId: "1001",    // 教室ID
    courseCode: "A1001",    // 课程号
    courseName: "线性代数",  // 课程名称
    instructor: "张三"      // 教师姓名
  },{
    day: 2,
    session: "1-1",
    classroomId: "1002",
    courseCode: "A1002",
    courseName: "大学物理",
    instructor: "李四"
  },
]

const example = () => <CoursesTable sessionInfo = { exInfo } coursesData = { exData }></CoursesTable>;
```

### 基本用法

该组件接收四个参数分别为 sessionInfo , coursesData , width , height

这四个参数分别记录了：

- **sessionInfo**
  - total : 总节次数，即一天内共有多少学时
  - timePeriod : 学时分布，以空格为分隔，如 **_8:00-9:00 9:05-9.50_**,字符串类型
- **coursesData** 这是一个存放所有课程的数组，以每一节课程为对象集成
  - 其中每一节课的字段上文代码块所示
- **width & height**
  - 用户可在此自定义组件的宽高，若无指定则采用默认值

'use client'
const Home = () => {
  return (
    <>
      <div>HelloWorld</div>
      <div>
        <button
          onClick={() => {
            window.location.href = '/file'
          }}
        >
          跳转至文件管理系统页面
        </button>
      </div>
    </>
  )
}

export default Home

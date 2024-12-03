import { exec, spawn } from 'child_process'
import { fileURLToPath } from 'url'

import path from 'path'
// import { iconv } from 'iconv-lite'

// 获取当前文件的路径
const __filename = fileURLToPath(import.meta.url)
// 获取当前文件的目录路径
const __dirname = path.dirname(__filename)

// 定义执行命令的辅助函数
function runCommand(command, description, workingDir = __dirname) {
  return new Promise((resolve, reject) => {
    console.log(`\n⏳ ${description}...`)
    exec(
      command,
      { encoding: 'utf8', cwd: workingDir },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ ${description} 失败:`, stderr)
          return reject(error)
        }
        console.log(`✅ ${description} 成功:\n`, stdout)
        resolve(stdout)
      }
    )
  })
}

function runProcess(command, args, description, workingDir = __dirname) {
  return new Promise((resolve, reject) => {
    console.log(`\n⏳ ${description}...`)
    const process = spawn(command, args, { cwd: workingDir, shell: true })

    // 实时输出 stdout 数据
    process.stdout.on('data', (data) => {
      console.log(data.toString())
    })

    // 实时输出 stderr 数据
    process.stderr.on('data', (data) => {
      console.error(data.toString())
    })

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} 成功`)
        resolve()
      } else {
        console.error(`❌ ${description} 失败，退出码: ${code}`)
        reject(new Error(`Command failed with code ${code}`))
      }
    })
  })
}

// 主函数
async function main() {
  // 设置编码为 UTF-8，防止控制台输出乱码
  try {
    await runCommand('chcp 65001', '设置编码为 UTF-8')
  } catch (error) {
    // 不支持设置编码，跳过
  }

  const goProjectDir = path.join(__dirname, '../../server/golang')
  console.log(`\n🚀 正在启动 Go 项目: ${goProjectDir}`)

  try {
    // 步骤 1：更新 Go 依赖
    await runProcess('go', ['mod', 'tidy'], '更新 Go 依赖', goProjectDir)

    // 步骤 2：检查 Air 是否已安装
    try {
      await runCommand('air -v', '检查 Air 是否已安装', goProjectDir)
    } catch (error) {
      console.error('Air 未安装，尝试使用 go install 安装...')
      try {
        await runProcess(
          'go',
          ['install', 'github.com/air-verse/air@latest'],
          '安装 Air',
          goProjectDir
        )
      } catch (error) {
        console.error('安装 Air 失败，请尝试手动安装')
        process.exit(1)
      }
    }

    // 步骤 3：使用 Air 运行项目
    await runCommand('air', '启动项目', goProjectDir)
  } catch (error) {
    console.error('运行脚本时出错:', error)
  }
}

main()

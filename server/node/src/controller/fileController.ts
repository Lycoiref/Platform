import { Context } from 'koa'
import path from 'path'
import fs, { copyFileSync } from 'fs'
import archiver from 'archiver'
import ffmpeg from 'fluent-ffmpeg'

function copyFolder(oldFolderPath: string, newFolderPath: string) {
  fs.mkdirSync(newFolderPath)
  const folder = fs.readdirSync(oldFolderPath)
  folder.forEach((file) => {
    const formerPath = path.join(oldFolderPath, file)
    const laterPath = path.join(newFolderPath, file)
    if (fs.statSync(formerPath).isFile()) fs.copyFileSync(formerPath, laterPath)
    else copyFolder(formerPath, laterPath)
  })
}

export const filesReader = async (ctx: Context) => {
  if (!fs.existsSync(path.join(__dirname, '../../files'))) {
    fs.mkdirSync(path.join(__dirname, '../../files'))
    fs.mkdirSync(
      path.join(__dirname, '../../files', 'HelloWorldOfficialUploadFolder')
    )
  }
  const { pathQuery } = ctx.query
  let dirPath
  if (pathQuery)
    dirPath = path.join(__dirname, '../../files', pathQuery as string)
  else dirPath = path.join(__dirname, '../../files')
  try {
    const filesAndFolders = fs.readdirSync(dirPath)
    const fileContents = []
    const folderContents = []

    if (filesAndFolders) {
      for (const f of filesAndFolders) {
        if (f == 'HelloWorldOfficialUploadFolder') continue
        const fPath = path.join(dirPath, f)
        const fState = fs.statSync(fPath)
        if (fState.isFile()) {
          fileContents.push({
            fileName: f,
            filePath: path.join(pathQuery as string, '/', f),
            fileSize: fState.size,
            lastModified: fState.mtime,
          })
        } else if (fState.isDirectory()) {
          folderContents.push({
            folderName: f,
            folderPath: path.join(pathQuery as string, '/', f),
            lastModified: fState.mtime,
          })
        }
      }
    }
    ctx.state = 200
    ctx.body = {
      files: fileContents,
      folders: folderContents,
    }
  } catch {
    ctx.state = 500
    ctx.body = {
      message: '读取失败喔 ):',
    }
  }
}

export const uploadFileOrFolder = async (ctx: Context) => {
  try {
    if (!ctx.request.files || Object.keys(ctx.request.files).length === 0) {
      ctx.status = 400
      ctx.body = { message: 'No file uploaded.' }
      return
    }

    const files = ctx.request.files
    const response = []

    if (!files) {
      ctx.status = 400
      ctx.body = { message: 'File processing error.' }
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file: any = files.file
    const dirPath = path.join(
      path.dirname(file.filepath),
      file.originalFilename.split('.')[0]
    )
    console.log(dirPath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath)
    }

    fs.renameSync(
      file.filepath,
      path.join(dirPath, file.originalFilename.split('.')[1])
    )
    response.push({
      filename: path.basename(dirPath),
      path: path.join(path.dirname(file.filepath), path.basename(dirPath)),
    })

    ctx.state = 200
    ctx.body = {
      fileContent: response,
      message: 'FileChunk uploaded successfully.',
    }
  } catch (err) {
    console.error('Error during file upload:', err)
    ctx.status = 500
    ctx.body = { message: 'Internal server error' }
  }
}

export const deleteFileOrFolder = async (ctx: Context) => {
  const { pathQuery, type } = ctx.query
  const dirPath = path.join(__dirname, '../../files', pathQuery as string)
  if (type == 'file') {
    fs.unlinkSync(dirPath)
  }
  if (type == 'folder') {
    fs.rmSync(dirPath, { recursive: true })
  }
  ctx.state = 200
  ctx.body = {
    message: pathQuery,
  }
}

export const renameFileOrFolder = async (ctx: Context) => {
  const { fPath, originalName, newName } = ctx.query
  const oldPath = path.join(
    __dirname,
    '../../files',
    fPath !== '0' ? (fPath as string) : '',
    '/',
    originalName as string
  )
  const newPath = path.join(
    __dirname,
    '../../files',
    fPath !== '0' ? (fPath as string) : '',
    '/',
    newName as string
  )
  fs.renameSync(oldPath, newPath)
  ctx.state = 200
  ctx.body = {
    message: '重命名成功啦！ (:',
  }
}

export const createFolder = async (ctx: Context) => {
  const { folderPath, folderName } = ctx.query
  const dirPath = path.join(
    __dirname,
    '../../files',
    folderPath ? (folderPath as string) : '',
    '/',
    folderName as string
  )
  fs.mkdirSync(dirPath)
  fs.mkdirSync(path.join(dirPath, 'HelloWorldOfficialUploadFolder'))
  ctx.state = 200
  ctx.body = {
    message: '新建文件夹成功 (:',
  }
}

export const pasteFileOrFolder = async (ctx: Context) => {
  const { oldPath, newPath, operationType } = ctx.query
  const dirPath = path.join(__dirname, '../../files')
  const formerPath = path.join(dirPath, oldPath as string)
  const laterPath = path.join(dirPath, newPath as string)
  if (operationType == 'cut') {
    fs.renameSync(formerPath, laterPath)
    ctx.state = 200
    ctx.body = {
      message: '操作成功 (:',
    }
  } else {
    if (fs.statSync(formerPath).isDirectory()) copyFolder(formerPath, laterPath)
    else copyFileSync(formerPath, laterPath)
    ctx.status = 200
    ctx.body = {
      message: '操作成功 (:',
    }
  }
}

export const fileOrFolderDownloader = async (ctx: Context) => {
  const { filePath } = ctx.query
  const dirPath = path.join(__dirname, '../../files', filePath as string)
  const file = fs.statSync(dirPath)

  if (file.isFile()) {
    ctx.status = 200
    ctx.body = fs.createReadStream(dirPath)
  } else if (file.isDirectory()) {
    const output = fs.createWriteStream(dirPath + '.zip')
    const archive = archiver('zip', {
      zlib: { level: 9 },
    })
    archive.glob('**', {
      cwd: dirPath,
      ignore: ['**/HelloWorldOfficialUploadFolder/**'],
    })
    archive.pipe(output)
    archive.on('error', (err) => {
      console.error('归档过程中发生错误：', err)
    })
    await archive.finalize()
    ctx.body = fs.createReadStream(dirPath + '.zip').on('close', () => {
      fs.unlinkSync(dirPath + '.zip')
    })
    ctx.status = 200
  }
}

export const mergeUploadedChunk = async (ctx: Context) => {
  const { pathQuery, name } = ctx.query
  const originalPath = path.join(
    __dirname,
    '../../files',
    pathQuery as string,
    'HelloWorldOfficialUploadFolder',
    (name as string).split('.')[0]
  )
  let targetPath = path.join(
    __dirname,
    '../../files',
    pathQuery as string,
    (name as string).split('.')[0]
  )
  const uploadChunks = fs.readdirSync(originalPath)
  if (fs.existsSync(targetPath + '.' + (name as string).split('.')[1])) {
    let i = 0
    targetPath += '_'
    while (
      fs.existsSync(targetPath + `${i}` + '.' + (name as string).split('.')[1])
    ) {
      i++
    }
    targetPath += `${i}`
  }
  const tempPath = targetPath + '_temp' + '.' + (name as string).split('.')[1]
  targetPath += '.' + (name as string).split('.')[1]
  fs.writeFileSync(targetPath, '')
  uploadChunks.sort((a, b) => Number(a) - Number(b))
  for (const f of uploadChunks) {
    const chunkFile = fs.readFileSync(path.join(originalPath, f))
    fs.appendFileSync(targetPath, chunkFile)
  }
  fs.rmSync(originalPath, { recursive: true })
  if (path.extname(targetPath) === '.mp4') {
    console.log(1)
    ffmpeg(targetPath)
      .outputOptions(
        ' -c:v libx264', // 使用H.264视频编码
        '-c:a aac', // 使用AAC音频编码
        '-f mp4', // 指定输出格式为mp4
        '-movflags +faststart', // 确保moov头移动到文件的开头，支持流式播放
        '+frag_keyframe', // 以关键帧为分片的开始
        '+empty_moov', // 确保moov盒子存在
        '+default_base_moof',
        '-frag_duration 1000000'
      )
      .output(tempPath)
      .on('end', () => {
        console.log('Conversion finished!')
        fs.unlinkSync(targetPath)
        fs.renameSync(tempPath, targetPath)
        ctx.body = {
          message: ':)',
        }
        ctx.status = 200
      })
      .on('error', (err) => {
        console.error('Error:', err)
      })
      .run()
  } else {
    ctx.body = {
      message: ':)',
    }
    ctx.status = 200
  }
}

export const filePreview = async (ctx: Context) => {
  const { filePath } = ctx.query
  const dirPath = path.join(__dirname, '../../files', filePath as string)
  const stat = fs.statSync(dirPath)
  if (path.extname(dirPath) === '.mp4') {
    const range = ctx.req.headers.range as string
    const parts = range.replace(/bytes=/, '').split('-')
    const start = Number(parts[0])
    const end = Number(parts[1]) || stat.size - 1
    ctx.set('Content-Range', `bytes ${start}-${end}/${stat.size}`)
    ctx.type = 'video/mp4'
    ctx.set('Accept-Ranges', 'bytes')
    ctx.status = 206
    const stream = fs.createReadStream(dirPath, {
      start,
      end,
    })
    ctx.body = stream
  } else {
    ctx.body = fs.createReadStream(dirPath)
    ctx.status = 200
    if (path.extname(dirPath) === '.pdf') {
      ctx.type = 'pdf'
    }
  }
}

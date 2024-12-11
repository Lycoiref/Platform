import Router from '@koa/router'
import koaBody from 'koa-body'
import path from 'path'

import { Context } from 'koa'
import {
  uploadFileOrFolder,
  filesReader,
  deleteFileOrFolder,
  renameFileOrFolder,
  createFolder,
  pasteFileOrFolder,
  fileOrFolderDownloader,
  mergeUploadedChunk,
  filePreview,
} from '../../../controller/fileController'

type Next = () => Promise<void>

const router = new Router()

const dynamicKoaBody = (ctx: Context, next: Next) => {
  const { pathQuery } = ctx.query
  const uploadDir = path.join(
    __dirname,
    '../../../../files',
    pathQuery as string,
    'HelloWorldOfficialUploadFolder'
  )
  return koaBody({
    multipart: true,
    formidable: {
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024 * 1024,
    },
  })(ctx, next)
}

router.get('/reader', filesReader)

router.post('/upload', dynamicKoaBody, uploadFileOrFolder)

router.get('/delete', deleteFileOrFolder)

router.get('/rename', renameFileOrFolder)

router.get('/create', createFolder)

router.get('/paste', pasteFileOrFolder)

router.get('/downloadOne', fileOrFolderDownloader)

router.get('/merge', mergeUploadedChunk)

router.get('/preview', filePreview)

export default router

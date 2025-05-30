import React, { useRef, useState, useEffect } from 'react'

import { Viewer } from '@photo-sphere-viewer/core'

import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin'

import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin' //虚拟游览组件

import { PlusOutlined } from '@ant-design/icons'
import { Image, Upload, Button } from 'antd'
import type { GetProp, UploadFile, UploadProps } from 'antd'

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })

export default function VrUploader () {
  const [selectedFileUrl, setSelectedFileUrl] = useState('')
  const [confirmedImageUrl, setConfirmedImageUrl] = useState('')
  const viewerRef = useRef<HTMLDivElement | null>(null)
  const viewerInstance = useRef<Viewer | null>(null)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType)
    }

    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true)
  }

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    // 始终只保留最后一张图片
    const latestFileList = newFileList.slice(-1)
    setFileList(latestFileList)

    if (latestFileList.length > 0) {
      const file = latestFileList[0].originFileObj as File
      const url = URL.createObjectURL(file)
      setSelectedFileUrl(url)
    } else {
      setSelectedFileUrl('')
      setConfirmedImageUrl('')
    }
  }
  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type='button'>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </button>
  )

  const handleConfirm = () => {
    if (selectedFileUrl) {
      setConfirmedImageUrl(selectedFileUrl)
    }
  }

  const handleCancel = () => {
    setFileList([])
    setSelectedFileUrl('')
    setConfirmedImageUrl('')
    // 销毁 Viewer 实例并清空引用
    if (viewerInstance.current) {
      viewerInstance.current.destroy()
      viewerInstance.current = null
    }
  }

  const [isRotating, setIsRotating] = useState(false) // 是否旋转

  const handleRotate = () => {
    setIsRotating(prev => {
      const next = !prev
      if (viewerInstance.current) {
        const autorotate = viewerInstance.current.getPlugin(AutorotatePlugin)
        if (next) {
          autorotate.start()
        } else {
          autorotate.stop()
        }
      }
      return next
    })
  }

  useEffect(() => {
    if (confirmedImageUrl && viewerRef.current) {
      if (viewerInstance.current) {
        viewerInstance.current.setPanorama(confirmedImageUrl)
      } else {
        viewerInstance.current = new Viewer({
          container: viewerRef.current,
          panorama: confirmedImageUrl,
          plugins: [[AutorotatePlugin, { autostart: false }]]
        })
      }
    }
  }, [confirmedImageUrl])

  return (
    <div className='p-4 cursor-pointer'>
      <div className='flex items-center justify-center w-100 min-w-full'>
        <div className='min-w-[100%]'>
          <div className='flex justify-between'>
            <Upload
              listType='picture-card'
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              beforeUpload={() => false}
            >
              {fileList.length >= 8 ? null : uploadButton}
            </Upload>
            {previewImage && (
              <Image
                wrapperStyle={{ display: 'none' }}
                preview={{
                  visible: previewOpen,
                  onVisibleChange: visible => setPreviewOpen(visible),
                  afterOpenChange: visible => !visible && setPreviewImage('')
                }}
                src={previewImage}
              />
            )}
            <div className='flex items-center justify-center'>
              <button
                onClick={handleConfirm}
                disabled={!selectedFileUrl}
                className={`px-4 py-2 rounded-md text-white mr-4
 ${
   selectedFileUrl
     ? 'bg-blue-600 hover:bg-blue-700'
     : 'bg-gray-400 cursor-not-allowed'
 }`}
              >
                生成 VR
              </button>

              {selectedFileUrl && (
                <button
                  onClick={handleRotate}
                  className={`px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 mr-4
`}
                >
                  {!isRotating ? '开始巡检' : '停止巡检'}
                </button>
              )}

              <button
                onClick={handleCancel}
                className={`px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700`}
              >
                重置图片
              </button>
            </div>
          </div>

          {/* VR区域 */}
          <div
            className='h-[65vh] w-full bg-black
 mt-6 rounded overflow-hidden mb-6 rounded-3xl'
            ref={viewerRef}
          >
            {!selectedFileUrl && (
              <p className='text-white p-4 '>
                请上传一张比例为2:1的矩形图 / 圆形图
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

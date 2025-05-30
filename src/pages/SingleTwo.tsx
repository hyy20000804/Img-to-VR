import React, { useRef, useState, useEffect } from 'react'
import 'aframe'
import { PlusOutlined } from '@ant-design/icons'
import { Image, Upload } from 'antd'
import type { GetProp, UploadFile, UploadProps } from 'antd'

import ReactECharts from 'echarts-for-react'
import { getBarChartOption } from '../tools/Echarts' // 无y轴的柱状图

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })

const option = getBarChartOption()

export default function VrUploader () {
  const [selectedFileUrl, setSelectedFileUrl] = useState('')
  const [confirmedImageUrl, setConfirmedImageUrl] = useState('')
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

  const handleChange: UploadProps['onChange'] = async ({
    fileList: newFileList
  }) => {
    const latestFileList = newFileList.slice(-1)
    setFileList(latestFileList)

    if (latestFileList.length > 0) {
      const file = latestFileList[0].originFileObj as File

      // const url = URL.createObjectURL(file)
      // setSelectedFileUrl(url)

      //当前的路径为临时生成的blob URL(blob:http://localhost:5173/xxx)在本地浏览器上下文中和img中有效,不适用于WebGL的纹理贴图,改用base64格式
      const base64URL = await getBase64(file)
      setSelectedFileUrl(base64URL)
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
  }

  return (
    <div className='p-4 cursor-pointer'>
      <div className='flex items-center justify-center w-100'>
        <div className='min-w-[100%]'>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 '>
            <style>
              {`:where(.css-dev-only-do-not-override-5uvb3z).ant-upload-wrapper .ant-upload-list.ant-upload-list-picture-card .ant-upload-list-item-error{
                border-color: #2b90d4 !important;
              }`}
            </style>
            <Upload
              listType='picture-card'
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              beforeUpload={() => false}
            >
              {fileList.length >= 1 ? null : uploadButton}
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
                className={`px-4 py-2 rounded-md text-white mx-4 ${
                  selectedFileUrl
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                生成 VR
              </button>
            </div>

            <div className='flex items-center justify-center'>
              <button
                onClick={handleCancel}
                className={`px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700`}
              >
                重置图片
              </button>
            </div>
          </div>

          {/* VR区域 - A-Frame */}
          <div className='h-[65vh] w-full bg-black mt-6 rounded-3xl overflow-hidden relative'>
            {confirmedImageUrl ? (
              <a-scene embedded vr-mode-ui='enabled: true'>
                <a-sky src={confirmedImageUrl} rotation='0 -130 0'></a-sky>
                <a-camera
                  wasd-controls-enabled='false'
                  look-controls='pointerLockEnabled: true'
                ></a-camera>
              </a-scene>
            ) : (
              <p className='text-white p-4'>
                请上传一张比例为 2:1 的矩形图 / 圆形图
              </p>
            )}
          </div>

          {/* <ReactECharts option={option} style={{ height: 400 }} /> */}
        </div>
      </div>
    </div>
  )
}

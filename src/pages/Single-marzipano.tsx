import React, { useRef, useEffect, useState } from 'react'
import { Upload, Button, Select, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
// import Marzipano from 'marzipano'
declare const Marzipano: any

const { Option } = Select

const stereoModes = [
  { label: 'Mono (普通)', value: 'mono' },
  { label: 'Over/Under 左右上下分离', value: 'stereoOverUnder' },
  { label: 'Side-by-Side 左右并排', value: 'stereoSideBySide' }
]

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })

const App: React.FC = () => {
  const viewerRef = useRef<HTMLDivElement | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [stereoType, setStereoType] = useState<string>('mono')
  const [viewer, setViewer] = useState<any>(null)

  useEffect(() => {
    if (imageUrl && viewerRef.current) {
      if (viewer) viewer.destroy()

      const newViewer = new Marzipano.Viewer(viewerRef.current)

      console.log(newViewer)

      const image = new Image()
      image.src = imageUrl
      image.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!

        if (stereoType === 'stereoOverUnder') {
          canvas.width = image.width
          canvas.height = image.height / 2
          ctx.drawImage(
            image,
            0,
            0,
            image.width,
            image.height / 2,
            0,
            0,
            canvas.width,
            canvas.height
          )
        } else if (stereoType === 'stereoSideBySide') {
          canvas.width = image.width / 2
          canvas.height = image.height
          ctx.drawImage(
            image,
            0,
            0,
            image.width / 2,
            image.height,
            0,
            0,
            canvas.width,
            canvas.height
          )
        } else {
          canvas.width = image.width
          canvas.height = image.height
          ctx.drawImage(image, 0, 0)
        }

        const processedUrl = canvas.toDataURL()

        const source = Marzipano.ImageUrlSource.fromString(processedUrl)
        const geometry = new Marzipano.EquirectGeometry([
          { width: canvas.width }
        ])

        const view = newViewer.createView({
          type: 'equirect',
          yaw: 0,
          pitch: 0,
          roll: 0,
          fov: Math.PI / 2
        })

        const layer = newViewer.createScene({
          source,
          geometry,
          view,
          pinFirstLevel: true
        })

        // WebGL 后续拓展点：此处可注入颜色/混合处理逻辑

        layer.switchTo()
        setViewer(newViewer)
      }
    }
  }, [imageUrl, stereoType])

  const handleUpload = (info: any) => {
    if (info.file.status === 'done' || info.file.status === 'uploading') {
      const file = info.file.originFileObj
      const url = URL.createObjectURL(file)
      console.log('url', url)

      setImageUrl(url)
    } else if (info.file.status === 'error') {
      message.error('上传失败')
    }
  }

  return (
    <div className='p-4'>
      <div className='mb-4 flex items-center gap-4'>
        <Upload
          accept='image/*'
          showUploadList={false}
          beforeUpload={() => false}
          onChange={handleUpload}
        >
          <Button icon={<UploadOutlined />}>上传全景图片</Button>
        </Upload>
        <Select
          value={stereoType}
          onChange={setStereoType}
          style={{ width: 200 }}
        >
          {stereoModes.map(mode => (
            <Option key={mode.value} value={mode.value}>
              {mode.label}
            </Option>
          ))}
        </Select>
      </div>
      <div ref={viewerRef} className='w-full h-[80vh] rounded shadow border' />
    </div>
  )
}

export default App

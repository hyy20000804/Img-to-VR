import React, { useRef, useState, useEffect } from 'react'
import { Viewer } from '@photo-sphere-viewer/core'
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin'
import {
  VirtualTourPlugin,
  VirtualTourPlugin as VirtualTourPluginType
} from '@photo-sphere-viewer/virtual-tour-plugin'

import {
  MarkersPlugin,
  MarkersPlugin as MarkersPluginType
} from '@photo-sphere-viewer/markers-plugin'

import { PlusOutlined } from '@ant-design/icons'
import { Image, Upload, Button, Alert } from 'antd'
import type { GetProp, UploadFile, UploadProps } from 'antd'

import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/virtual-tour-plugin/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })

export default function VrVirtualTour () {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('') // 预览图
  const viewerRef = useRef<HTMLDivElement | null>(null)
  const viewerInstance = useRef<Viewer | null>(null)
  const [isRotating, setIsRotating] = useState(false)

  const markersRef = useRef<any[]>([])
  const [jumpingIndex, setJumpingIndex] = useState(0)
  const [jumpingDirection, setJumpingDirection] = useState(1) // 1 正向, -1 反向

  const markerMap = useRef<Record<string, any[]>>({}) // 每个 node id 存一个 marker 列表,为了切换虚拟场景后自定义组件存在

  const [showHint, setShowHint] = useState(true) // 控制提示是否显示

  const isEditingMarkerRef = useRef(false) // 新增一个变量判断处理右键后新增问题

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File)
    }
    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true)
  }

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(0, 6)) // 最多6张
  }

  const handleReset = () => {
    setFileList([])
    setPreviewImage('')

    // 清空全景图实例
    if (viewerInstance.current) {
      viewerInstance.current.destroy()
      viewerInstance.current = null
    }

    // ✅ 清空 markerMap 中记录的所有标记
    markerMap.current = {}

    // ✅ 可选：还原旋转状态
    setIsRotating(false)
  }

  const handleRotate = () => {
    setIsRotating(prev => {
      const next = !prev
      if (viewerInstance.current) {
        const autorotate = viewerInstance.current.getPlugin(AutorotatePlugin)
        if (next) autorotate.start()
        else autorotate.stop()
      }
      return next
    })
  }

  const handleStartTour = () => {
    if (!viewerRef.current || fileList.length < 2) return

    const urls = fileList.map(file =>
      URL.createObjectURL(file.originFileObj as File)
    )

    const nodes = urls.map((url, i) => ({
      id: `scene${i}`,
      name: `场景 ${i + 1}`,
      panorama: url,
      thumbnail: url,
      position: { yaw: 0, pitch: 0 },
      links:
        i < urls.length - 1
          ? [{ nodeId: `scene${i + 1}`, position: { yaw: 1.5, pitch: 0.1 } }]
          : []
    }))

    nodes.forEach((node, i) => {
      if (i > 0)
        node.links.push({
          nodeId: `scene${i - 1}`,
          position: { yaw: -1.5, pitch: 0.1 }
        })
    })

    if (viewerInstance.current) {
      viewerInstance.current.destroy()
    }

    viewerInstance.current = new Viewer({
      container: viewerRef.current,
      panorama: urls[0],
      plugins: [
        [AutorotatePlugin, { autostartOnIdle: false }],
        [VirtualTourPlugin, { nodes }],
        [MarkersPlugin, {}]
      ]
    })

    const markersPlugin = viewerInstance.current.getPlugin(MarkersPlugin)

    // ** 新增：监听标记的双击事件，实现编辑或删除 **
    let lastClickTime = 0
    let lastClickMarkerId = ''

    markersPlugin.addEventListener(
      'select-marker',
      ({ marker, rightClick }) => {
        const now = Date.now()
        if (rightClick) {
          isEditingMarkerRef.current = true

          const newContent = prompt(
            '请输入新的 tooltip 内容：',
            marker.tooltip?.content || ''
          )
          if (newContent) {
            const shortContent =
              newContent.length > 20
                ? newContent.slice(0, 20) + '...'
                : newContent

            markersPlugin.updateMarker({
              id: marker.id,
              tooltip: {
                content: shortContent,
                trigger: 'hover'
              }
            })

            // ✅ 同步更新 markerMap
            const currentNode = tour.getCurrentNode()
            const nodeMarkers = markerMap.current[currentNode.id] || []
            const m = nodeMarkers.find(m => m.id === marker.id)
            if (m) {
              m.tooltip.content = shortContent
              m.fullContent = newContent
            }
          }
          return
        }

        // 双击逻辑
        if (marker.id === lastClickMarkerId && now - lastClickTime < 300) {
          console.log('Double clicked marker', marker.id)
          markersPlugin.removeMarker(marker.id)
        } else {
          console.log('Clicked marker', marker.id)
        }

        lastClickTime = now
        lastClickMarkerId = marker.id
      }
    )

    // 虚拟漫游插件
    const tour = viewerInstance.current.getPlugin(
      VirtualTourPlugin
    ) as VirtualTourPluginType

    tour.setNodes(nodes)
    tour.setCurrentNode('scene0')

    //使用原生dom事件监听右键
    viewerRef.current?.addEventListener('contextmenu', e => {
      e.preventDefault() // 禁止默认右键菜单

      // 检查是否正在编辑标记，如果是则直接返回
      if (isEditingMarkerRef.current) {
        isEditingMarkerRef.current = false
        return
      }

      const viewer = viewerInstance.current
      if (!viewer) return

      const position = viewer.dataHelper.viewerCoordsToSphericalCoords({
        x: e.offsetX,
        y: e.offsetY
      })

      if (!position) return

      const { yaw, pitch } = position

      const fullContent = `点击 @ ${yaw.toFixed(2)}, ${pitch.toFixed(
        2
      )} - ${Date.now()}` // 示例内容
      const shortContent =
        fullContent.length > 20 ? fullContent.slice(0, 20) + '...' : fullContent

      const marker = {
        id: `${Date.now()}`,
        position: { yaw, pitch },
        image: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png',
        size: { width: 32, height: 32 },
        tooltip: {
          content: shortContent, // ✅ 使用截断后的文本
          position: 'top center',
          trigger: 'manual'
        },
        // ✅ 额外保存完整内容
        fullContent: fullContent
      }

      // 其余代码保持不变...
      const tour = viewer.getPlugin(VirtualTourPlugin) as VirtualTourPluginType
      const currentNode = tour.getCurrentNode()
      if (!currentNode) return

      if (!markerMap.current[currentNode.id]) {
        markerMap.current[currentNode.id] = []
      }

      // 添加标记到当前场景
      markerMap.current[currentNode.id].push(marker)

      // 获取当前场景的标记数量
      const markerCount = markerMap.current[currentNode.id].length

      const markersPlugin = viewer.getPlugin(MarkersPlugin)
      markersPlugin.addMarker(marker)
      markersRef.current.push(marker)

      // ✅ 显示 tooltip
      markersPlugin.showMarkerTooltip(marker.id)

      // 根据标记数量决定放大或缩小
      if (viewer && viewer.animate) {
        try {
          // 奇数放大，偶数缩小
          const targetZoom = markerCount % 2 === 1 ? 10 : 50

          // 先移动到标记点位置，再执行缩放动画
          viewer.animate({
            yaw: yaw,
            pitch: pitch,
            zoom: targetZoom,
            speed: '2rpm'
          })
        } catch (error) {
          console.error('执行动画失败:', error)
        }
      }
    })

    // v5要用addEventListener才能监听到,用on监听不到
    tour.addEventListener('node-changed', () => {
      const currentNode = tour.getCurrentNode()
      if (!currentNode) return

      // 清除旧标记
      markersPlugin.clearMarkers()

      // 加载该 node 的标记
      const nodeMarkers = markerMap.current[currentNode.id] || []
      nodeMarkers.forEach(marker => {
        // ✅ 强制设置 tooltip 的 trigger 为 'manual'
        markersPlugin.addMarker({
          ...marker,
          tooltip: {
            ...marker.tooltip,
            trigger: 'manual'
          }
        })

        // ✅ 显示 tooltip
        markersPlugin.showMarkerTooltip(marker.id)
      })

      // ✅ 如果有标记，跳转到最后一个 marker 的视角
      if (nodeMarkers.length > 0 && viewerInstance.current) {
        const lastMarker = nodeMarkers[nodeMarkers.length - 1]
        viewerInstance.current.animate({
          yaw: lastMarker.position.yaw,
          pitch: lastMarker.position.pitch,
          speed: '2rpm',
          zoom: 50
        })
      }

      setIsRotating(true)
    })
  }

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type='button'>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </button>
  )

  return (
    <div className='p-4'>
      <div className='flex gap-4 items-center justify-between'>
        <Upload
          listType='picture-card'
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          beforeUpload={() => false}
        >
          {fileList.length >= 6 ? null : uploadButton}
        </Upload>

        <div
          className='gap-4 flex
'
        >
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
          <Button
            type='primary'
            onClick={handleStartTour}
            disabled={fileList.length < 2}
          >
            生成虚拟漫游
          </Button>
          <Button
            onClick={handleRotate}
            disabled={!viewerInstance.current}
            style={{ color: isRotating ? 'red' : undefined }}
          >
            {isRotating ? '停止旋转' : '开始旋转'}
          </Button>

          <Button
            type='dashed'
            onClick={() => {
              const viewer = viewerInstance.current
              const markers = markersRef.current

              if (!viewer) return

              const autorotate = viewer.getPlugin(AutorotatePlugin)
              autorotate.stop()
              setIsRotating(false)

              if (markers.length > 0) {
                const currentMarker = markers[jumpingIndex]
                viewer.animate({
                  yaw: currentMarker.position.yaw,
                  pitch: currentMarker.position.pitch,
                  zoom: 70,
                  speed: '2rpm'
                })

                // 计算下一个 index
                let nextIndex = jumpingIndex + jumpingDirection
                if (nextIndex >= markers.length || nextIndex < 0) {
                  setJumpingDirection(prev => -prev) // 方向反转
                  nextIndex = jumpingIndex - jumpingDirection // 回退一步
                }

                setJumpingIndex(nextIndex)
              }
            }}
          >
            标记跳转
          </Button>
          <Button danger onClick={handleReset}>
            重置
          </Button>
        </div>
      </div>

      <div
        className='w-full h-[70vh] bg-black mt-6 rounded-2xl overflow-hidden relative'
        ref={viewerRef}
      >
        {fileList.length === 0 && (
          <p className='text-white p-4'>请上传 2-6 张比例为 2:1 的全景图</p>
        )}

        {fileList.length !== 0 && viewerRef.current && (
          <Alert
            message='提示'
            description={
              <>
                <p>Ctrl + 滚轮可缩放</p>
                <p>右键单击可以标记地点</p>
                <p>右键双击可以修改地点</p>
                <p>左键双击可以删除地点</p>
              </>
            }
            type='info'
            closable
            onClose={() => setShowHint(false)}
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              zIndex: 10,
              width: 300
            }}
          />
        )}
      </div>
    </div>
  )
}

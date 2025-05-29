import React, { useRef, useState, useEffect } from 'react'
// import Viewer from 'photo-sphere-viewer'
import { Viewer } from 'photo-sphere-viewer'
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css'

import SixComponents from '../components/SixComponents'

export default function VrUploader () {
  const [imageUrl, setImageUrl] = useState('')
  const viewerRef = useRef<HTMLDivElement | null>(null)
  const viewerInstance = useRef<Viewer | null>(null) // 注意这里是 Viewer 而不是命名空间

  useEffect(() => {
    if (imageUrl && viewerRef.current) {
      if (viewerInstance.current) {
        viewerInstance.current.setPanorama(imageUrl)
      } else {
        viewerInstance.current = new Viewer({
          container: viewerRef.current,
          panorama: imageUrl,
          navbar: ['zoom', 'fullscreen']
        })
      }
    }
  }, [imageUrl])

  return (
    <div className='p-4 cursor-pointer'>
      {/* 多图生成 */}
      <div className='bg-gray-100 flex items-center justify-center'>
        <SixComponents />
      </div>
    </div>
  )
}

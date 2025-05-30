// src/components/VRCube.tsx
import React, { useState } from 'react'

// 类型
type Face = 'px' | 'nx' | 'py' | 'ny' | 'pz' | 'nz'
const faceLabels: Record<Face, string> = {
  px: '右（+X）',
  nx: '左（-X）',
  py: '上（+Y）',
  ny: '下（-Y）',
  pz: '前（+Z）',
  nz: '后（-Z）'
}

export default function VRCube () {
  const [images, setImages] = useState<Record<Face, string | null>>({
    px: null,
    nx: null,
    py: null,
    ny: null,
    pz: null,
    nz: null
  })

  const allUploaded = Object.values(images).every(Boolean)

  const handleFileChange = (
    face: Face,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImages(prev => ({ ...prev, [face]: url }))
    }
  }

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>上传 6 张立方体全景图</h1>

      <div className='flex justify-between mb-6'>
        {(Object.keys(faceLabels) as Face[]).map(face => (
          <div key={face}>
            <label className='block mb-1 font-medium'>{faceLabels[face]}</label>
            <input
              type='file'
              accept='image/*'
              onChange={e => handleFileChange(face, e)}
            />
            {images[face] && (
              <img
                src={images[face]!}
                alt={face}
                className='mt-2 w-24 h-16 object-cover border'
              />
            )}
          </div>
        ))}
      </div>

      <div className='w-full h-[70vh] bg-black rounded overflow-hidden'>
        {allUploaded ? (
          <a-scene embedded>
            <a-assets>
              {(Object.keys(images) as Face[]).map(face => (
                <img
                  key={face}
                  id={face}
                  src={images[face]!}
                  crossOrigin='anonymous'
                />
              ))}
            </a-assets>

            <a-sky
              shader='cubemap'
              cube-texture='#px #nx #py #ny #pz #nz'
              rotation='0 -90 0'
            ></a-sky>

            <a-camera
              wasd-controls-enabled='true'
              look-controls-enabled='true'
              position='0 1.6 0'
            ></a-camera>

            <a-light type='ambient' color='#fff'></a-light>
          </a-scene>
        ) : (
          <p className='text-white p-4'>请上传全部 6 张图以生成 VR 图</p>
        )}
      </div>
    </div>
  )
}

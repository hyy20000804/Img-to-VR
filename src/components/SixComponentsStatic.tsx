import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

type Face = 'px' | 'nx' | 'py' | 'ny' | 'pz' | 'nz' // right, left, top, bottom, front, back
const faceLabels: Record<Face, string> = {
  py: '上',
  ny: '下',
  nx: '左',
  px: '右',
  pz: '前',
  nz: '后'
}

const faceOrder: Face[] = ['py', 'ny', 'nx', 'px', 'pz', 'nz']

export default function SixImageVrThree () {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const animationFrameId = useRef<number | null>(null)

  const [images, setImages] = useState<Record<Face, string | null>>({
    px: null,
    nx: null,
    py: null,
    ny: null,
    pz: null,
    nz: null
  })

  const allImagesUploaded = faceOrder.every(face => images[face])

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    face: Face
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImages(prev => ({ ...prev, [face]: url }))
    }
  }

  // 生成自动旋转的静态贴图
  const initScene = () => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 0)

    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    )
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(renderer.domElement)

    const loader = new THREE.CubeTextureLoader()
    loader.load(
      [images.px!, images.nx!, images.py!, images.ny!, images.pz!, images.nz!],
      cubeTexture => {
        // 创建一个立方体几何体
        const geometry = new THREE.BoxGeometry(500, 500, 500)
        // 创建材质，贴图来自立方体贴图的6个面
        const materials = cubeTexture.images.map(image => {
          const texture = new THREE.Texture(image)
          texture.needsUpdate = true
          return new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide // 👈 关键：把贴图放在立方体内部
          })
        })

        const cube = new THREE.Mesh(geometry, materials)
        scene.add(cube)

        sceneRef.current = scene
        cameraRef.current = camera
        rendererRef.current = renderer

        animate()
      },
      undefined,
      error => {
        console.error('加载纹理失败', error)
      }
    )
  }

  const animate = () => {
    animationFrameId.current = requestAnimationFrame(animate)
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      sceneRef.current.rotation.y += 0.001
      rendererRef.current.render(sceneRef.current, cameraRef.current)
    }
  }

  useEffect(() => {
    return () => {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current)
      rendererRef.current?.dispose()
    }
  }, [])

  return (
    <div className='min-w-[100%]'>
      {/* <h2 className='text-2xl font-bold mt-4 mb-4'>
        <p>六图上传</p>
        <p>全景动态生成（Three.js）</p>
      </h2> */}

      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
        {faceOrder.map(face => (
          <div key={face} className='flex flex-col'>
            <label className='mb-1 capitalize font-medium text-sm text-gray-700'>
              {faceLabels[face]}
            </label>
            <input
              type='file'
              accept='image/*'
              onChange={e => handleFileChange(e, face)}
              className='cursor-pointer file:mr-3 file:py-1 file:px-3 file:border file:rounded-md file:text-sm file:bg-white hover:file:bg-gray-100'
            />
            {/* 展示临时图片信息 */}
            {/* {images[face] && (
              <img
                src={images[face]!}
                alt={`${faceLabels[face]} 预览`}
                className='mt-2 w-24 h-16 object-cover rounded border'
              />
            )} */}
          </div>
        ))}
      </div>
      <button
        onClick={initScene}
        disabled={!allImagesUploaded}
        className={`px-4 py-2 rounded-md text-white mt-8 ${
          allImagesUploaded
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        生成动态全景图
      </button>
      <div
        className='h-[55vh] w-full bg-black mt-6 rounded overflow-hidden mb-6 rounded-3xl'
        ref={containerRef}
      >
        {!allImagesUploaded && (
          <p className='text-white p-4'>请上传全部 6 张图</p>
        )}
      </div>
    </div>
  )
}

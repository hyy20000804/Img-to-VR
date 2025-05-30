import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

type Face = 'px' | 'nx' | 'py' | 'ny' | 'pz' | 'nz'
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
  const controlsRef = useRef<OrbitControls | null>(null)
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

  const initScene = () => {
    if (!containerRef.current) return

    // 清空旧内容
    containerRef.current.innerHTML = ''

    // 初始化 scene, camera, renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 0.1)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    )
    containerRef.current.appendChild(renderer.domElement)

    // 控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableZoom = true
    controls.enablePan = false
    controls.rotateSpeed = -0.25
    controls.zoomSpeed = 1.0
    controls.minDistance = 0.01
    controls.maxDistance = 10

    // 加载立方体贴图
    const loader = new THREE.CubeTextureLoader()
    loader.load(
      [images.px!, images.nx!, images.py!, images.ny!, images.pz!, images.nz!],
      texture => {
        const geometry = new THREE.BoxGeometry(500, 500, 500)
        const material = new THREE.MeshBasicMaterial({
          envMap: texture,
          side: THREE.BackSide
        })
        const cube = new THREE.Mesh(geometry, material)
        scene.add(cube)
        animate()
      },
      undefined,
      error => {
        console.error('加载贴图失败', error)
      }
    )

    // 保存引用
    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    controlsRef.current = controls

    // 动画循环
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }

    // 处理窗口缩放
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)
  }

  // 清理资源
  useEffect(() => {
    return () => {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current)
      rendererRef.current?.dispose()
      window.removeEventListener('resize', () => {})
    }
  }, [])

  return (
    <div className='min-w-[100%]'>
      <div className='flex justify-between'>
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
            </div>
          ))}
        </div>
        <div className='flex justify-center items-center'>
          <button
            onClick={initScene}
            disabled={!allImagesUploaded}
            className={`px-4 py-2 rounded-md text-white mt-8 ${
              allImagesUploaded
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            生成立体全景图
          </button>
        </div>
      </div>

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

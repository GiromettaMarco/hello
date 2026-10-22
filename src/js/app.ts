import fragmentShader from '$/particles/fragment.glsl'
import vertexShader from '$/particles/vertex.glsl'
import gsap from 'gsap'
import * as THREE from 'three'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { LoadedModel, Sizes } from '@/types'

//#region Particles

// Colors
// default  A #ff7300 B #0091ff
// blue     A #993300 B #0091ff
// red      A #f61500 B #0091ff
// green    A #993300 B #009199

export class Particles {
  colorA = '#993300'
  colorB = '#0091ff'
  geometry: THREE.BufferGeometry
  index = 0
  material: THREE.ShaderMaterial
  maxCount = 0
  morphing = false
  points?: THREE.Points
  positions: THREE.Float32BufferAttribute[] = []

  constructor(sizes: Sizes) {
    this.geometry = new THREE.BufferGeometry()

    this.material = new THREE.ShaderMaterial({
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fragmentShader: fragmentShader,
      uniforms: {
        uColorA: new THREE.Uniform(new THREE.Color(this.colorA)),
        uColorB: new THREE.Uniform(new THREE.Color(this.colorB)),
        uProgress: new THREE.Uniform(0.0),
        uResolution: new THREE.Uniform(
          new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)
        ),
        uSize: new THREE.Uniform(0.4),
        uTime: new THREE.Uniform(0)
      },
      vertexShader: vertexShader
    })
  }

  addPosition(position: Float32Array) {
    this.positions.push(new THREE.Float32BufferAttribute(position, 3))
  }

  morph(index: number) {
    // Update attributes
    this.geometry.attributes.position = this.positions[this.index]
    this.geometry.attributes.aPositionTarget = this.positions[index]

    // Animate progress
    void gsap.fromTo(
      this.material.uniforms.uProgress,
      { value: 0 },
      {
        duration: 3,
        ease: 'linear',
        onComplete: () => (this.morphing = false),
        onStart: () => (this.morphing = true),
        value: 1
      }
    )

    // Save index
    this.index = index
  }
}

//#region three.js

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLElement

// Scene
const scene = new THREE.Scene()

// Loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// Handle window size
const sizes: Sizes = {
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
  width: window.innerWidth
}

// Init particles
const particles = new Particles(sizes)

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

  // Update particles material
  if (particles.material) {
    particles.material.uniforms.uResolution.value.set(
      sizes.width * sizes.pixelRatio,
      sizes.height * sizes.pixelRatio
    )
  }

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(sizes.pixelRatio)
})

// Camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(sizes.width * -0.0015, 0, 8 * 2)
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

// Load particles models
gltfLoader.load('./models.glb', (gltf) => {
  // Positions
  const positions = gltf.scene.children.map(
    // @ts-expect-error assert scene content
    (child: LoadedModel) => child.geometry.lookAt(camera.position).attributes.position
  )

  for (const position of positions) {
    if (position.count > particles.maxCount) {
      particles.maxCount = position.count
    }
  }

  for (const position of positions) {
    if (position.count === particles.maxCount) {
      particles.addPosition(position.array as Float32Array)
    } else {
      const originalArray = position.array
      const newArray = new Float32Array(particles.maxCount * 3)

      for (let i = 0; i < particles.maxCount; i++) {
        const i3 = i * 3

        if (i3 < originalArray.length) {
          newArray[i3] = originalArray[i3]
          newArray[i3 + 1] = originalArray[i3 + 1]
          newArray[i3 + 2] = originalArray[i3 + 2]
        } else {
          const randomIndex = Math.floor(position.count * Math.random()) * 3
          newArray[i3] = originalArray[randomIndex]
          newArray[i3 + 1] = originalArray[randomIndex + 1]
          newArray[i3 + 2] = originalArray[randomIndex + 2]
        }
      }

      particles.addPosition(newArray)
    }
  }

  // Geometry
  const sizesArray = new Float32Array(particles.maxCount)
  for (let i = 0; i < particles.maxCount; i++) {
    sizesArray[i] = Math.random()
  }

  particles.geometry.setAttribute('position', particles.positions[particles.index])
  particles.geometry.setAttribute('aPositionTarget', particles.positions[2])
  // particles.geometry.setAttribute('aPositionTarget', particles.positions[3])
  particles.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1))
  // vertices are unique because we used smooth function with blender
  // particles.geometry.setIndex(null)

  //Points
  particles.points = new THREE.Points(particles.geometry, particles.material)
  // Deactivate frustum culling
  particles.points.frustumCulled = false

  scene.add(particles.points)
})

/**
 * Animate
 */
const timer = new THREE.Timer()
timer.connect(document)

function animate(timestamp?: DOMHighResTimeStamp) {
  // Timer
  timer.update(timestamp)

  // Update Material
  particles.material.uniforms.uTime.value = timer.getElapsed()

  // Render normal scene
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(animate)
}

animate()

export { particles }

//#region Touch

const clickElement = document.getElementById('click-text') as HTMLElement

const mediaQuery = window.matchMedia('(pointer: coarse)')

function update() {
  clickElement.innerHTML = mediaQuery.matches ? 'touch' : 'click'
}

update()

mediaQuery.addEventListener('change', update)

//#region UI

const UI = [
  {
    content: document.getElementById('laravel-content'),
    trigger: document.getElementById('laravel-trigger')
  },
  {
    content: document.getElementById('react-content'),
    trigger: document.getElementById('react-trigger')
  },
  {
    content: document.getElementById('vite-content'),
    trigger: document.getElementById('vite-trigger')
  }
] as Array<{
  content: HTMLElement
  trigger: HTMLElement
}>

function choose(index: number) {
  if (!particles.morphing) {
    particles.morph(index)

    for (let i = 0; i < UI.length; i++) {
      if (index - 1 === i) {
        UI[i].content.dataset.active = 'true'
      } else {
        UI[i].content.removeAttribute('data-active')
      }
    }
  }
}

for (let i = 0; i < UI.length; i++) {
  UI[i].trigger.onclick = () => choose(i + 1)
}

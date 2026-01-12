import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Scene from './components/Scene'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 1.6, 3], fov: 50 }}>
        {/* Lumières */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* Scène 3D */}
        <Scene />

        {/* Contrôles caméra */}
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  )
}



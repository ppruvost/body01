import { Sphere, Html } from '@react-three/drei'
import { useState } from 'react'

export default function Acupoint({ point }: any) {
  const [hover, setHover] = useState(false)

  return (
    <Sphere
      args={[0.015, 16, 16]}
      position={point.position}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}>
      <meshStandardMaterial color="red" />
      {hover && (
        <Html distanceFactor={10}>
          <div style={{ background: 'white', padding: '6px', borderRadius: '6px' }}>
            <strong>{point.name}</strong>
            <p>{point.description}</p>
          </div>
        </Html>
      )}
    </Sphere>
  )
}

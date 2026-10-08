import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Instances, Instance, Line } from '@react-three/drei';
import * as THREE from 'three';

const COUNT = 100;

function TechNetwork() {
  const groupRef = useRef(null);

  // Generate random node positions
  const nodes = useMemo(() => {
    const temp = [];
    for (let i = 0; i < COUNT; i++) {
      temp.push(new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20
      ));
    }
    return temp;
  }, []);

  // Generate connection lines (just connect to next few nodes for a mesh look)
  const lines = useMemo(() => {
    const temp = [];
    for (let i = 0; i < COUNT - 2; i++) {
      if (Math.random() > 0.3) {
        temp.push([nodes[i], nodes[i + 1]]);
        if (Math.random() > 0.5) {
           temp.push([nodes[i], nodes[i + 2]]);
        }
      }
    }
    return temp;
  }, [nodes]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.05;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Floating Nodes */}
      <Instances limit={COUNT} range={COUNT}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.8} />
        {nodes.map((pos, i) => (
          <Instance key={i} position={pos} />
        ))}
      </Instances>

      {/* Connection Lines */}
      {lines.map((line, i) => (
        <Line 
          key={i} 
          points={line} 
          color="#3B82F6" 
          lineWidth={0.5} 
          transparent 
          opacity={0.15} 
        />
      ))}
    </group>
  );
}

export default function MandalaScene() {
  // Keeping the component name MandalaScene so we don't break imports in other files
  return (
    <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 30], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <TechNetwork />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.3} 
        />
      </Canvas>
    </div>
  );
}


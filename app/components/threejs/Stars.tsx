"use client"
import * as THREE from 'three';
import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Preload } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

// Define the Stars component
const Stars: React.FC = (props) => {
  // Create a ref to hold the reference to the Points object
  const ref = useRef<THREE.Points>(null);
  
  // Generate random star positions inside a sphere
  // This will create an array of 5000 random points in a sphere of radius 1.2
  const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.2 }));

  // Use useFrame to animate the rotation of the stars:rotation 3al x wl y
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10; 
      ref.current.rotation.y -= delta / 15; 
    }
  });

  return (
    // Group of Points ,aplikina  a rotation
    <group rotation={[0, 0, Math.PI / 4]}>
      {/* Render Points with the random sphere positions */}
      <Points ref={ref} positions={sphere} stride={3} frustumCulled {...props}>
        <PointMaterial
          transparent // Make the material transparent
          color="#f272c8" // Color of the stars
          size={0.002} // Size of each star
          sizeAttenuation={true} // Allow the size to attenuate with distance
          depthWrite={false} 
        />
      </Points>
    </group>
  );
};

const StarsCanvas: React.FC = () => {
  return (
    <div className="w-full h-auto absolute inset-0 z-[-1]">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Suspense fallback={null}>
          <Stars />
        </Suspense>

        <Preload all />
      </Canvas>
    </div>
  );
};

export default StarsCanvas;

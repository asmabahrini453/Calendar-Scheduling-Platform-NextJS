"use client"
// Import necessary React hooks and components
import * as THREE from 'three';

import { useState, useRef, Suspense } from 'react';
// Import the Canvas and useFrame from react-three/fiber
import { Canvas, useFrame } from '@react-three/fiber';
// Import Points, PointMaterial, and Preload from react-three/drei for easier 3D rendering
import { Points, PointMaterial, Preload } from '@react-three/drei';
// Import the random utility from maath for generating random positions
import * as random from 'maath/random/dist/maath-random.esm';

// Define the Stars component
const Stars: React.FC = (props) => {
  // Create a ref to hold the reference to the Points object
  const ref = useRef<THREE.Points>(null);
  
  // Generate random star positions inside a sphere
  // This will create an array of 5000 random points in a sphere of radius 1.2
  const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.2 }));

  // Use useFrame to animate the rotation of the stars
  useFrame((state, delta) => {
    // Check if the ref is set (i.e., the Points object is mounted)
    if (ref.current) {
      // Rotate the Points object on the x-axis and y-axis
      ref.current.rotation.x -= delta / 10; // Rotate around the x-axis
      ref.current.rotation.y -= delta / 15; // Rotate around the y-axis
    }
  });

  return (
    // Group to hold the Points and apply a rotation to it
    <group rotation={[0, 0, Math.PI / 4]}>
      {/* Render Points with the random sphere positions */}
      <Points ref={ref} positions={sphere} stride={3} frustumCulled {...props}>
        {/* Material for the points (stars) */}
        <PointMaterial
          transparent // Make the material transparent
          color="#f272c8" // Color of the stars
          size={0.002} // Size of each star
          sizeAttenuation={true} // Allow the size to attenuate with distance
          depthWrite={false} // Do not write depth (for transparency effects)
        />
      </Points>
    </group>
  );
};

// Define the StarsCanvas component that sets up the 3D canvas
const StarsCanvas: React.FC = () => {
  return (
    // A container for the Canvas
    <div className="w-full h-auto absolute inset-0 z-[-1]">
      {/* Create a Canvas with a specific camera position */}
      <Canvas camera={{ position: [0, 0, 1] }}>
        {/* Suspense is used to handle loading states for the Stars component */}
        <Suspense fallback={null}>
          {/* Render the Stars component */}
          <Stars />
        </Suspense>

        {/* Preload all assets before rendering */}
        <Preload all />
      </Canvas>
    </div>
  );
};

// Export the StarsCanvas component as the default export
export default StarsCanvas;

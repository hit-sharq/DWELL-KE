'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';

function FloatingBox() {
  return (
    <Sphere args={[1, 32, 32]}>
      <MeshDistortMaterial
        color="#3B82F6"
        attach="material"
        distort={0.5}
        speed={2}
      />
    </Sphere>
  );
}

export function AuthScene3D() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden"
    >
      <Canvas camera={{ position: [0, 0, 2.5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <FloatingBox />
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={4}
          enablePan={false}
        />
      </Canvas>

      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome to Dwell KE
          </h2>
          <p className="text-cyan-400 text-lg">
            Find your perfect property in Kenya
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

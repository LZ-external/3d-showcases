import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Cubie({ position, stickers }) {
  // stickers: { px, nx, py, ny, pz, nz } where each is a color or null
  const size = 0.95;

  // Box face material order in Three.js:
  // [right(px), left(nx), top(py), bottom(ny), front(pz), back(nz)]
  const materials = useMemo(() => {
    const base = new THREE.MeshStandardMaterial({ color: "#111111" }); // "plastic"
    const makeSticker = (c) =>
      c
        ? new THREE.MeshStandardMaterial({
            color: c,
            roughness: 0.35,
            metalness: 0.05,
          })
        : base;

    return [
      makeSticker(stickers.px),
      makeSticker(stickers.nx),
      makeSticker(stickers.py),
      makeSticker(stickers.ny),
      makeSticker(stickers.pz),
      makeSticker(stickers.nz),
    ];
  }, [stickers]);

  return (
    <mesh position={position} material={materials} castShadow receiveShadow>
      <boxGeometry args={[size, size, size]} />
    </mesh>
  );
}

function RubiksCube() {
  const group = useRef();

  // Rotate the whole cube continuously
  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.6;
    group.current.rotation.x += delta * 0.25;
  });

  // Build 3x3x3 cubies positions and sticker colors
  const cubies = useMemo(() => {
    const arr = [];
    const coords = [-1, 0, 1];
    const spacing = 1.02;

    // Standard-ish Rubik colors:
    // +X (right)  = red
    // -X (left)   = orange
    // +Y (top)    = white
    // -Y (bottom) = yellow
    // +Z (front)  = green
    // -Z (back)   = blue
    const colors = {
      px: "#c41e3a",
      nx: "#ff7a00",
      py: "#ffffff",
      ny: "#ffd500",
      pz: "#009e60",
      nz: "#0051ba",
    };

    for (const x of coords) {
      for (const y of coords) {
        for (const z of coords) {
          const stickers = {
            px: x === 1 ? colors.px : null,
            nx: x === -1 ? colors.nx : null,
            py: y === 1 ? colors.py : null,
            ny: y === -1 ? colors.ny : null,
            pz: z === 1 ? colors.pz : null,
            nz: z === -1 ? colors.nz : null,
          };

          arr.push({
            key: `${x}${y}${z}`,
            position: [x * spacing, y * spacing, z * spacing],
            stickers,
          });
        }
      }
    }
    return arr;
  }, []);

  return (
    <group ref={group}>
      {cubies.map((c) => (
        <Cubie key={c.key} position={c.position} stickers={c.stickers} />
      ))}
    </group>
  );
}

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        shadows
        camera={{ position: [5, 5, 7], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[6, 8, 6]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <RubiksCube />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#202020" />
        </mesh>

        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { useParticleSimulation } from "../hooks/useParticleSimulation";

// ── Mobile detection (runs once on module load, client:only so safe) ──
const IS_MOBILE =
  typeof window !== "undefined" &&
  (window.innerWidth < 768 || ("ontouchstart" in window && window.innerWidth < 1024));
const COUNT = IS_MOBILE ? 30 : 60;
const VARIANTS = 3;
const PER_VARIANT = Math.ceil(COUNT / VARIANTS);
const BOUNDS = { x: 2.0, y: 1.3, z: 2.0 };
const BUBBLE_COUNT = IS_MOBILE ? 20 : 40;

type RGB = [number, number, number];
type Palette = { body: RGB; belly: RGB; fin: RGB; stripe: RGB };

const PALETTES: Palette[] = [
  { body: [1.0, 0.45, 0.12], belly: [1.0, 0.75, 0.45], fin: [0.95, 0.30, 0.08], stripe: [1.0, 1.0, 1.0] },
  { body: [0.15, 0.40, 0.85], belly: [0.35, 0.60, 0.95], fin: [0.92, 0.82, 0.20], stripe: [0.05, 0.12, 0.30] },
  { body: [0.92, 0.78, 0.12], belly: [0.98, 0.90, 0.35], fin: [0.75, 0.55, 0.05], stripe: [1.0, 1.0, 1.0] },
];

function createFishGeo(p: Palette): THREE.BufferGeometry {
  const parts: { geo: THREE.BoxGeometry; color: RGB }[] = [];
  const add = (sx: number, sy: number, sz: number, px: number, py: number, pz: number, color: RGB) => {
    const g = new THREE.BoxGeometry(sx, sy, sz);
    g.translate(px, py, pz);
    parts.push({ geo: g, color });
  };

  const EYE_W: RGB = [1.0, 1.0, 1.0];
  const PUPIL: RGB = [0.05, 0.05, 0.05];
  const MOUTH: RGB = [0.85, 0.28, 0.18];
  const LIP: RGB = [p.belly[0], p.belly[1] * 0.9, p.belly[2] * 0.9];

  add(0.28, 0.22, 0.42, 0, 0, 0, p.body);
  add(0.29, 0.08, 0.40, 0, -0.09, 0, p.belly);
  add(0.24, 0.22, 0.14, 0, 0.01, -0.26, p.body);
  add(0.18, 0.10, 0.06, 0, -0.04, -0.35, LIP);
  add(0.12, 0.04, 0.03, 0, -0.08, -0.35, MOUTH);
  add(0.30, 0.23, 0.03, 0, 0, -0.16, p.stripe);
  add(0.30, 0.22, 0.03, 0, 0, 0.10, p.stripe);
  add(0.06, 0.07, 0.07, 0.14, 0.04, -0.24, EYE_W);
  add(0.06, 0.07, 0.07, -0.14, 0.04, -0.24, EYE_W);
  add(0.07, 0.045, 0.045, 0.155, 0.04, -0.28, PUPIL);
  add(0.07, 0.045, 0.045, -0.155, 0.04, -0.28, PUPIL);
  add(0.03, 0.10, 0.22, 0, 0.16, 0.02, p.fin);
  add(0.025, 0.06, 0.08, 0, 0.22, -0.05, p.fin);
  add(0.04, 0.07, 0.12, 0.16, -0.06, -0.02, p.fin);
  add(0.04, 0.07, 0.12, -0.16, -0.06, -0.02, p.fin);
  add(0.08, 0.03, 0.06, 0, -0.13, 0.04, p.fin);
  add(0.10, 0.12, 0.08, 0, 0, 0.24, p.body);
  add(0.03, 0.12, 0.14, 0, 0.06, 0.36, p.fin);
  add(0.03, 0.12, 0.14, 0, -0.06, 0.36, p.fin);
  add(0.025, 0.06, 0.06, 0, 0.14, 0.42, p.fin);
  add(0.025, 0.06, 0.06, 0, -0.14, 0.42, p.fin);
  add(0.025, 0.06, 0.10, 0, -0.14, 0.12, p.fin);

  let totalVerts = 0;
  for (const q of parts) totalVerts += q.geo.getAttribute("position").count;

  const pos = new Float32Array(totalVerts * 3);
  const nrm = new Float32Array(totalVerts * 3);
  const col = new Float32Array(totalVerts * 3);
  const indices: number[] = [];
  let vo = 0;

  for (const q of parts) {
    const gp = q.geo.getAttribute("position") as THREE.BufferAttribute;
    const gn = q.geo.getAttribute("normal") as THREE.BufferAttribute;
    const gi = q.geo.getIndex()!;
    const gpa = gp.array as Float32Array;
    const gna = gn.array as Float32Array;
    for (let i = 0; i < gp.count; i++) {
      pos[(vo + i) * 3] = gpa[i * 3];
      pos[(vo + i) * 3 + 1] = gpa[i * 3 + 1];
      pos[(vo + i) * 3 + 2] = gpa[i * 3 + 2];
      nrm[(vo + i) * 3] = gna[i * 3];
      nrm[(vo + i) * 3 + 1] = gna[i * 3 + 1];
      nrm[(vo + i) * 3 + 2] = gna[i * 3 + 2];
      col[(vo + i) * 3] = q.color[0];
      col[(vo + i) * 3 + 1] = q.color[1];
      col[(vo + i) * 3 + 2] = q.color[2];
    }
    for (let i = 0; i < gi.count; i++) indices.push((gi.array as ArrayLike<number>)[i] + vo);
    vo += gp.count;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setIndex(indices);
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Fish school ──
function FishSchool({ attractor }: { attractor: React.MutableRefObject<THREE.Vector3> }) {
  const meshRefs = [
    useRef<THREE.InstancedMesh>(null),
    useRef<THREE.InstancedMesh>(null),
    useRef<THREE.InstancedMesh>(null),
  ];
  const { ready, tick, positions, velocities } = useParticleSimulation(
    COUNT, BOUNDS.x, BOUNDS.y, BOUNDS.z
  );
  const geos = useMemo(() => PALETTES.map((p) => createFishGeo(p)), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const scales = useMemo(() => {
    const arr = new Float32Array(COUNT);
    const rnd = mulberry32(7);
    for (let i = 0; i < COUNT; i++) arr[i] = 0.22 + rnd() * 0.16;
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!ready) return;
    tick(delta, attractor.current.x, attractor.current.y, attractor.current.z);
    const pos = positions.current;
    const vel = velocities.current;
    if (!pos || !vel) return;

    for (let i = 0; i < COUNT; i++) {
      const variant = i % VARIANTS;
      const localIdx = Math.floor(i / VARIANTS);
      const mesh = meshRefs[variant].current;
      if (!mesh) continue;

      const px = pos[i * 3];
      const py = pos[i * 3 + 1];
      const pz = pos[i * 3 + 2];
      const vx = vel[i * 3];
      const vy = vel[i * 3 + 1];
      const vz = vel[i * 3 + 2];

      dummy.position.set(px, py, pz);
      const vlen = Math.sqrt(vx * vx + vy * vy + vz * vz);
      if (vlen > 0.001) {
        dummy.lookAt(px - vx, py - vy, pz - vz);
      }
      const s = scales[i];
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.setMatrixAt(localIdx, dummy.matrix);
    }

    for (const ref of meshRefs) {
      if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      {PALETTES.map((_, v) => (
        <instancedMesh
          key={v}
          ref={meshRefs[v]}
          args={[geos[v], undefined, PER_VARIANT]}
          frustumCulled={false}
          castShadow
        >
          <meshStandardMaterial vertexColors flatShading roughness={0.55} metalness={0.02} />
        </instancedMesh>
      ))}
    </>
  );
}

// ── Cursor attractor (works with mouse AND touch via R3F pointer) ──
function CursorAttractor({ target }: { target: React.MutableRefObject<THREE.Vector3> }) {
  const { camera, pointer } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.ray.intersectPlane(plane, hit);
    if (!intersects) {
      target.current.set(0, 0, 0);
      return;
    }
    target.current.set(
      Math.max(-BOUNDS.x, Math.min(BOUNDS.x, hit.x)),
      Math.max(-BOUNDS.y, Math.min(BOUNDS.y, hit.y)),
      Math.max(-BOUNDS.z, Math.min(BOUNDS.z, hit.z))
    );
  });
  return null;
}

// ── Tank with thick voxel glass frame ──
function Tank() {
  const bx = BOUNDS.x;
  const by = BOUNDS.y;
  const bz = BOUNDS.z;
  const t = 0.04; // frame thickness
  const frameColor = "#1a2a3a";
  const glassColor = "#1a3050";

  // 4 vertical corner pillars
  const pillars: [number, number, number][] = [
    [bx, 0, bz], [-bx, 0, bz], [bx, 0, -bz], [-bx, 0, -bz],
  ];
  // 8 horizontal edges (top + bottom)
  const hEdges: { pos: [number, number, number]; size: [number, number, number] }[] = [];
  // Top edges
  for (const z of [bz, -bz]) {
    hEdges.push({ pos: [0, by, z], size: [bx * 2 + t, t, t] });
  }
  for (const x of [bx, -bx]) {
    hEdges.push({ pos: [x, by, 0], size: [t, t, bz * 2 + t] });
  }
  // Bottom edges
  for (const z of [bz, -bz]) {
    hEdges.push({ pos: [0, -by, z], size: [bx * 2 + t, t, t] });
  }
  for (const x of [bx, -bx]) {
    hEdges.push({ pos: [x, -by, 0], size: [t, t, bz * 2 + t] });
  }

  return (
    <group>
      {/* Floor: sand with subtle warm tone */}
      <mesh position={[0, -by, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[bx * 2, bz * 2]} />
        <meshStandardMaterial color="#2a2218" roughness={0.95} />
      </mesh>

      {/* Back wall (opaque dark) */}
      <mesh position={[0, 0, -bz + 0.001]}>
        <planeGeometry args={[bx * 2, by * 2]} />
        <meshStandardMaterial color="#0c1428" roughness={0.9} />
      </mesh>

      {/* Side walls (visible tinted glass) */}
      {[-1, 1].map((s) => (
        <mesh key={`side-${s}`} position={[s * bx, 0, 0]} rotation={[0, -s * Math.PI / 2, 0]}>
          <planeGeometry args={[bz * 2, by * 2]} />
          <meshStandardMaterial
            color={glassColor}
            transparent
            opacity={0.15}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Front wall (very subtle hint) */}
      <mesh position={[0, 0, bz]}>
        <planeGeometry args={[bx * 2, by * 2]} />
        <meshStandardMaterial
          color={glassColor}
          transparent
          opacity={0.04}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Water surface at top */}
      <mesh position={[0, by - 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[bx * 2, bz * 2]} />
        <meshStandardMaterial
          color="#2a5a88"
          transparent
          opacity={0.18}
          roughness={0.1}
          metalness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Corner pillars */}
      {pillars.map(([px, py, pz], i) => (
        <mesh key={`pillar-${i}`} position={[px, py, pz]}>
          <boxGeometry args={[t, by * 2 + t, t]} />
          <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.4} />
        </mesh>
      ))}

      {/* Horizontal frame edges */}
      {hEdges.map((e, i) => (
        <mesh key={`edge-${i}`} position={e.pos}>
          <boxGeometry args={e.size} />
          <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.4} />
        </mesh>
      ))}

      {/* Bottom trim (thicker base) */}
      <mesh position={[0, -by - 0.03, 0]}>
        <boxGeometry args={[bx * 2 + t * 2, 0.06, bz * 2 + t * 2]} />
        <meshStandardMaterial color="#12181e" roughness={0.8} metalness={0.3} />
      </mesh>
    </group>
  );
}

// ── Aquatic plants: アナカリス / ヤナギモ / マツモ ──
// Each plant is a hierarchy: plant group → stem/blade groups → segment groups (for sway animation)
// Animation rotates each segment group's Z so the bend accumulates upward.

type PlantType = "anacharis" | "yanagimo" | "matsumo";
type PlantDef = {
  type: PlantType;
  x: number;
  z: number;
  height: number;
  stems: number;
  phase: number;
};

function AquaticPlants() {
  const plants = useMemo(() => {
    const rnd = mulberry32(42);
    const types: PlantType[] = ["anacharis", "yanagimo", "matsumo"];
    const count = IS_MOBILE ? 10 : 16;
    const out: PlantDef[] = [];
    for (let i = 0; i < count; i++) {
      out.push({
        type: types[i % 3],
        x: (rnd() * 2 - 1) * BOUNDS.x * 0.82,
        z: (rnd() * 2 - 1) * BOUNDS.z * 0.82,
        height: 0.35 + rnd() * 0.55,
        stems: 2 + Math.floor(rnd() * 3),
        phase: rnd() * Math.PI * 2,
      });
    }
    return out;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    let pi = 0;
    for (const plantGroup of groupRef.current.children) {
      const plant = plants[pi];
      if (!plant) break;
      let si = 0;
      for (const stemGroup of (plantGroup as THREE.Group).children) {
        const segs = (stemGroup as THREE.Group).children;
        for (let s = 0; s < segs.length; s++) {
          const strength = plant.type === "yanagimo" ? 0.18 : 0.10;
          const freq = plant.type === "matsumo" ? 0.8 : 1.2;
          const sway = Math.sin(t * freq + plant.phase + si * 0.9 + s * 0.35)
            * strength * (s / Math.max(segs.length, 1));
          (segs[s] as THREE.Object3D).rotation.z = sway;
        }
        si++;
      }
      pi++;
    }
  });

  return (
    <group ref={groupRef}>
      {plants.map((plant, pi) => {
        const rnd2 = mulberry32(pi * 173 + 11);
        return (
          <group key={pi} position={[plant.x, -BOUNDS.y, plant.z]}>
            {Array.from({ length: plant.stems }, (_, si) => {
              const ang = (si / plant.stems) * Math.PI * 2 + rnd2() * 0.6;
              const dist = 0.015 + rnd2() * 0.03;
              const ox = Math.cos(ang) * dist;
              const oz = Math.sin(ang) * dist;
              const h = plant.height * (0.75 + rnd2() * 0.5);

              if (plant.type === "anacharis") {
                return <AnacharisStalk key={si} ox={ox} oz={oz} h={h} rnd={rnd2} />;
              } else if (plant.type === "yanagimo") {
                return <YanagimoRibbon key={si} ox={ox} oz={oz} h={h} rnd={rnd2} />;
              } else {
                return <MatsumoStem key={si} ox={ox} oz={oz} h={h} rnd={rnd2} />;
              }
            })}
          </group>
        );
      })}
    </group>
  );
}

// ── アナカリス: 中央の茎に対生の小さな葉が等間隔に付く ──
function AnacharisStalk({ ox, oz, h, rnd }: { ox: number; oz: number; h: number; rnd: () => number }) {
  const segs = 7;
  const segH = h / segs;
  const stemColor = new THREE.Color(0.12, 0.52, 0.18);
  const leafColor = new THREE.Color(0.18, 0.62, 0.25);

  return (
    <group position={[ox, 0, oz]}>
      {Array.from({ length: segs }, (_, s) => {
        const leafAngle = (s * 1.2 + rnd() * 0.5);
        const leafLen = 0.04 + rnd() * 0.02;
        const leafW = 0.018;
        const bright = 1.0 + s * 0.03;
        return (
          <group key={s} position={[0, s * segH, 0]}>
            {/* Stem segment */}
            <mesh position={[0, segH / 2, 0]}>
              <boxGeometry args={[0.012, segH, 0.012]} />
              <meshStandardMaterial color={stemColor} roughness={0.7} flatShading />
            </mesh>
            {/* Paired leaves at this node (2-3 pairs radiating out) */}
            {s > 0 && [0, Math.PI, Math.PI / 2, -Math.PI / 2].map((dir, li) => (
              <mesh
                key={li}
                position={[
                  Math.cos(leafAngle + dir) * leafLen * 0.5,
                  segH * 0.5,
                  Math.sin(leafAngle + dir) * leafLen * 0.5,
                ]}
                rotation={[0, leafAngle + dir, 0.4]}
              >
                <boxGeometry args={[leafLen, 0.006, leafW]} />
                <meshStandardMaterial
                  color={leafColor.clone().multiplyScalar(bright)}
                  roughness={0.65}
                  flatShading
                />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

// ── ヤナギモ: 根元から伸びる細長いリボン状の葉 ──
function YanagimoRibbon({ ox, oz, h, rnd }: { ox: number; oz: number; h: number; rnd: () => number }) {
  const segs = 8;
  const segH = h / segs;
  const shade = 0.85 + rnd() * 0.3;
  const baseColor: RGB = [0.10 * shade, 0.55 * shade, 0.22 * shade];

  return (
    <group position={[ox, 0, oz]}>
      {Array.from({ length: segs }, (_, s) => {
        const w = 0.035 * (1 - s * 0.06); // tapers toward tip
        const tipBright = 1 + s * 0.05;
        return (
          <group key={s} position={[0, s * segH, 0]}>
            <mesh position={[0, segH / 2, 0]}>
              <boxGeometry args={[w, segH, 0.005]} />
              <meshStandardMaterial
                color={new THREE.Color(
                  baseColor[0] * tipBright,
                  baseColor[1] * tipBright,
                  baseColor[2] * tipBright
                )}
                roughness={0.6}
                flatShading
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ── マツモ: 中央茎に放射状の針葉が輪生する (松の枝のような形) ──
function MatsumoStem({ ox, oz, h, rnd }: { ox: number; oz: number; h: number; rnd: () => number }) {
  const segs = 7;
  const segH = h / segs;
  const stemColor = new THREE.Color(0.08, 0.45, 0.20);
  const needleColor = new THREE.Color(0.12, 0.55, 0.28);

  return (
    <group position={[ox, 0, oz]}>
      {Array.from({ length: segs }, (_, s) => {
        const needleCount = 5 + Math.floor(rnd() * 3);
        const needleLen = 0.04 + rnd() * 0.025;
        const rotOffset = rnd() * Math.PI;
        const bright = 0.9 + s * 0.04;
        return (
          <group key={s} position={[0, s * segH, 0]}>
            {/* Stem segment */}
            <mesh position={[0, segH / 2, 0]}>
              <boxGeometry args={[0.010, segH, 0.010]} />
              <meshStandardMaterial color={stemColor} roughness={0.7} flatShading />
            </mesh>
            {/* Needle whorl at this node */}
            {s > 0 && Array.from({ length: needleCount }, (_, ni) => {
              const a = rotOffset + (ni / needleCount) * Math.PI * 2;
              const nx = Math.cos(a) * needleLen * 0.5;
              const nz = Math.sin(a) * needleLen * 0.5;
              // Needles fork: each has a small secondary tip
              return (
                <group key={ni}>
                  <mesh
                    position={[nx, segH * 0.5, nz]}
                    rotation={[0, a, 0.5]}
                  >
                    <boxGeometry args={[needleLen, 0.004, 0.004]} />
                    <meshStandardMaterial
                      color={needleColor.clone().multiplyScalar(bright)}
                      roughness={0.6}
                      flatShading
                    />
                  </mesh>
                  {/* Forked tip */}
                  <mesh
                    position={[
                      Math.cos(a) * needleLen * 0.85,
                      segH * 0.5 + 0.012,
                      Math.sin(a) * needleLen * 0.85,
                    ]}
                    rotation={[0, a + 0.4, 0.7]}
                  >
                    <boxGeometry args={[needleLen * 0.45, 0.003, 0.003]} />
                    <meshStandardMaterial
                      color={needleColor.clone().multiplyScalar(bright * 1.1)}
                      roughness={0.6}
                      flatShading
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

// ── Pebbles on the floor ──
function Pebbles() {
  const items = useMemo(() => {
    const rnd = mulberry32(200);
    const count = IS_MOBILE ? 20 : 40;
    const out: { pos: [number, number, number]; size: [number, number, number]; color: RGB }[] = [];
    for (let i = 0; i < count; i++) {
      const px = (rnd() * 2 - 1) * BOUNDS.x * 0.88;
      const pz = (rnd() * 2 - 1) * BOUNDS.z * 0.88;
      const sz = 0.04 + rnd() * 0.06;
      const shade = 0.18 + rnd() * 0.15;
      out.push({
        pos: [px, -BOUNDS.y + sz / 2, pz],
        size: [sz, sz * 0.55, sz],
        color: [shade, shade * 0.9, shade * 1.05],
      });
    }
    return out;
  }, []);

  return (
    <group>
      {items.map((it, i) => (
        <mesh key={i} position={it.pos} receiveShadow>
          <boxGeometry args={it.size} />
          <meshStandardMaterial
            color={new THREE.Color(it.color[0], it.color[1], it.color[2])}
            roughness={0.85}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

// ── Rising bubbles ──
function Bubbles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const state = useMemo(() => {
    const rnd = mulberry32(99);
    return Array.from({ length: BUBBLE_COUNT }, () => ({
      x: (rnd() * 2 - 1) * BOUNDS.x * 0.85,
      y: -BOUNDS.y + rnd() * BOUNDS.y * 2,
      z: (rnd() * 2 - 1) * BOUNDS.z * 0.85,
      speed: 0.08 + rnd() * 0.14,
      size: 0.015 + rnd() * 0.025,
      phase: rnd() * Math.PI * 2,
    }));
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((s, delta) => {
    if (!meshRef.current) return;
    const t = s.clock.elapsedTime;
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      const b = state[i];
      b.y += b.speed * delta;
      if (b.y > BOUNDS.y - 0.05) {
        b.y = -BOUNDS.y + 0.02;
        b.x = Math.sin(t * 0.7 + i) * 0.7 * BOUNDS.x * 0.85;
        b.z = Math.cos(t * 0.5 + i * 1.3) * 0.7 * BOUNDS.z * 0.85;
      }
      const wobbleX = Math.sin(t * 1.8 + b.phase) * 0.008;
      const wobbleZ = Math.cos(t * 1.5 + b.phase) * 0.008;
      dummy.position.set(b.x + wobbleX, b.y, b.z + wobbleZ);
      dummy.scale.setScalar(b.size);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BUBBLE_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial
        color="#bfe6ff"
        transparent
        opacity={0.55}
        roughness={0.2}
        metalness={0.1}
        emissive="#4488aa"
        emissiveIntensity={0.15}
      />
    </instancedMesh>
  );
}

// ── Clickable voxel lamp ──
function Lamp({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const pointRef = useRef<THREE.PointLight>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hover ? "pointer" : "";
    return () => { document.body.style.cursor = ""; };
  }, [hover]);

  useFrame((s) => {
    if (!pointRef.current) return;
    const flicker = on ? 1 + Math.sin(s.clock.elapsedTime * 8) * 0.04 : 0;
    pointRef.current.intensity = flicker * 1.8;
  });

  const top = BOUNDS.y + 0.18;
  const bulbColor = on ? "#fff1b8" : "#403830";
  const emissive = on ? "#ffd26a" : "#000000";

  return (
    <group
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={() => setHover(false)}
    >
      <mesh position={[0, top - 0.3, 0]}>
        <boxGeometry args={[0.012, 0.6, 0.012]} />
        <meshStandardMaterial color="#1a1a22" />
      </mesh>
      <mesh position={[0, top - 0.04, 0]}>
        <boxGeometry args={[0.28, 0.04, 0.28]} />
        <meshStandardMaterial color="#2a2228" roughness={0.8} />
      </mesh>
      <mesh position={[0, top - 0.12, 0]}>
        <boxGeometry args={[0.32, 0.08, 0.32]} />
        <meshStandardMaterial color={hover ? "#3d3340" : "#302634"} roughness={0.7} />
      </mesh>
      <mesh position={[0, top - 0.20, 0]}>
        <boxGeometry args={[0.24, 0.06, 0.24]} />
        <meshStandardMaterial color={hover ? "#463a4a" : "#382e3e"} roughness={0.7} />
      </mesh>
      <mesh position={[0, top - 0.27, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.12]} />
        <meshStandardMaterial color={bulbColor} emissive={emissive} emissiveIntensity={on ? 2.2 : 0} roughness={0.3} />
      </mesh>
      <pointLight
        ref={pointRef}
        position={[0, top - 0.32, 0]}
        color={on ? "#ffd89c" : "#000000"}
        intensity={on ? 1.8 : 0}
        distance={BOUNDS.y * 4}
        decay={1.8}
      />
    </group>
  );
}

// ── Mood lighting ──
function MoodLighting({ on }: { on: boolean }) {
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const ambRef = useRef<THREE.AmbientLight>(null);
  const target = useRef({
    hemiSky: new THREE.Color(), hemiGround: new THREE.Color(), dir: new THREE.Color(),
    dirI: 0, ambI: 0, hemiI: 0,
  });

  useFrame((_, delta) => {
    const t = target.current;
    if (on) {
      t.hemiSky.set("#a8d4ff"); t.hemiGround.set("#3a2a1a"); t.dir.set("#ffe4b0");
      t.dirI = 0.85; t.ambI = 0.18; t.hemiI = 0.55;
    } else {
      t.hemiSky.set("#2a3a78"); t.hemiGround.set("#050510"); t.dir.set("#5a7ab8");
      t.dirI = 0.18; t.ambI = 0.04; t.hemiI = 0.28;
    }
    const k = Math.min(1, delta * 4);
    if (hemiRef.current) {
      hemiRef.current.color.lerp(t.hemiSky, k);
      hemiRef.current.groundColor.lerp(t.hemiGround, k);
      hemiRef.current.intensity += (t.hemiI - hemiRef.current.intensity) * k;
    }
    if (dirRef.current) {
      dirRef.current.color.lerp(t.dir, k);
      dirRef.current.intensity += (t.dirI - dirRef.current.intensity) * k;
    }
    if (ambRef.current) {
      ambRef.current.intensity += (t.ambI - ambRef.current.intensity) * k;
    }
  });

  return (
    <>
      <hemisphereLight ref={hemiRef} args={["#a8d4ff", "#3a2a1a", 0.55]} />
      <directionalLight
        ref={dirRef}
        position={[2.5, 3.5, 2]}
        intensity={0.85}
        color="#ffe4b0"
        castShadow
        shadow-mapSize-width={IS_MOBILE ? 512 : 1024}
        shadow-mapSize-height={IS_MOBILE ? 512 : 1024}
      />
      <ambientLight ref={ambRef} intensity={0.18} color="#6a88c8" />
    </>
  );
}

// ── Responsive camera + OrbitControls ──
function CameraRig() {
  const { camera, size } = useThree();

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;

    if (aspect < 0.7) {
      // Tall portrait (phone): side view, eye level
      cam.position.set(4.5, 0.3, 0);
      cam.fov = 48;
    } else if (aspect < 1.0) {
      // Moderate portrait: side view, slightly further
      cam.position.set(5.0, 0.3, 0);
      cam.fov = 45;
    } else {
      // Landscape / desktop: front view, eye level
      cam.position.set(0, 0.3, 5.5);
      cam.fov = 42;
    }
    cam.updateProjectionMatrix();
  }, [camera, size]);

  return (
    <OrbitControls
      target={[0, 0, 0]}
      enablePan={false}
      enableZoom={false}
      minPolarAngle={Math.PI * 0.15}
      maxPolarAngle={Math.PI * 0.6}
      rotateSpeed={0.5}
      makeDefault
    />
  );
}

// ── Scene root ──
function SceneContent() {
  const [lampOn, setLampOn] = useState(true);
  const attractor = useRef(new THREE.Vector3());
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.Fog("#0a0818", 4.5, 9);
    return () => { scene.fog = null; };
  }, [scene]);

  return (
    <>
      <color attach="background" args={["#0a0818"]} />
      <MoodLighting on={lampOn} />
      <Lamp on={lampOn} onToggle={() => setLampOn((v) => !v)} />
      <CursorAttractor target={attractor} />
      <Tank />
      <AquaticPlants />
      <Pebbles />
      <Bubbles />
      <FishSchool attractor={attractor} />
      <CameraRig />
    </>
  );
}

export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: IS_MOBILE ? [0, 0.8, 5.0] : [0, 0.8, 5.5], fov: IS_MOBILE ? 48 : 42 }}
      gl={{ alpha: false, antialias: !IS_MOBILE, powerPreference: "high-performance" }}
      shadows={!IS_MOBILE}
      dpr={[1, IS_MOBILE ? 1.5 : 2]}
    >
      <SceneContent />
    </Canvas>
  );
}

import { useRef, useEffect, useState } from "react";

interface ParticleSystemHandle {
  system: any;
  memory: WebAssembly.Memory;
}

export function useParticleSimulation(
  count: number,
  boundsX: number,
  boundsY: number,
  boundsZ: number
) {
  const systemRef = useRef<ParticleSystemHandle | null>(null);
  const positionsRef = useRef<Float32Array | null>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // @ts-ignore - WASM module resolved via local package
        const mod = await import("particle-sim");
        const wasm = await mod.default();
        if (cancelled) return;

        const system = new mod.ParticleSystem(count, boundsX, boundsY, boundsZ);
        systemRef.current = { system, memory: wasm.memory };

        positionsRef.current = new Float32Array(
          wasm.memory.buffer,
          system.positions_ptr(),
          count * 3
        );
        velocitiesRef.current = new Float32Array(
          wasm.memory.buffer,
          system.velocities_ptr(),
          count * 3
        );
        setReady(true);
      } catch (e) {
        console.warn("WASM particle simulation failed to load:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [count, boundsX, boundsY, boundsZ]);

  const tick = (dt: number, ax: number, ay: number, az: number) => {
    if (!systemRef.current) return;
    systemRef.current.system.tick(dt, ax, ay, az);
    const buf = systemRef.current.memory.buffer;
    const sys = systemRef.current.system;
    positionsRef.current = new Float32Array(buf, sys.positions_ptr(), count * 3);
    velocitiesRef.current = new Float32Array(buf, sys.velocities_ptr(), count * 3);
  };

  return { positions: positionsRef, velocities: velocitiesRef, ready, tick };
}

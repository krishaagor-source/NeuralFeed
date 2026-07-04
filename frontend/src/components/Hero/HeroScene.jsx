import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import "./HeroScene.css";

/* ─────────────────────────────── Constants ─────────────────────────────── */
const R           = 2.2;
const NODE_N      = 26;
const SEGS        = 72;
const LAT_STEPS   = [-75, -60, -45, -30, -15, 15, 30, 45, 60, 75]; // no equator here
const LONG_N      = 12;
const CONNECT_A   = 0.82; // ~47° — angular threshold for connections
const OMEGA       = (Math.PI * 2) / 9; // 1 full rotation per 9 s

/* ─────────────────────────────── Math helpers ──────────────────────────── */
/** Return SEGS {x,y,z} pts for a latitude circle */
function latCircle(lat_deg) {
  const phi = Math.PI / 2 - (lat_deg * Math.PI) / 180;
  const y = R * Math.cos(phi);
  const cr = R * Math.sin(phi);
  return Array.from({ length: SEGS }, (_, i) => {
    const t = (i / SEGS) * Math.PI * 2;
    return { x: cr * Math.cos(t), y, z: cr * Math.sin(t) };
  });
}

/** Return SEGS+1 {x,y,z} pts for a longitude half-great-circle */
function longCircle(li) {
  const lon = (li / LONG_N) * Math.PI * 2;
  return Array.from({ length: SEGS + 1 }, (_, i) => {
    const phi = (i / SEGS) * Math.PI;
    return {
      x: R * Math.sin(phi) * Math.cos(lon),
      y: R * Math.cos(phi),
      z: R * Math.sin(phi) * Math.sin(lon),
    };
  });
}

/** Equator circle at y = 0 */
function equatorCircle() {
  return Array.from({ length: SEGS }, (_, i) => {
    const t = (i / SEGS) * Math.PI * 2;
    return { x: R * Math.cos(t), y: 0, z: R * Math.sin(t) };
  });
}

/** Uniform random point on sphere */
function randSphere() {
  const theta = Math.random() * Math.PI * 2;
  const phi   = Math.acos(1 - 2 * Math.random());
  return new THREE.Vector3(
    R * Math.sin(phi) * Math.cos(theta),
    R * Math.cos(phi),
    R * Math.sin(phi) * Math.sin(theta),
  );
}

/** Build a lineSegments BufferGeometry from an array of [a,b] {x,y,z} pairs */
function buildSegGeo(pairs) {
  const buf = new Float32Array(pairs.length * 6);
  pairs.forEach(([a, b], i) => {
    buf[i * 6 + 0] = a.x; buf[i * 6 + 1] = a.y; buf[i * 6 + 2] = a.z;
    buf[i * 6 + 3] = b.x; buf[i * 6 + 4] = b.y; buf[i * 6 + 5] = b.z;
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(buf, 3));
  return g;
}

/* ─────────────────────────── Globe Wireframe ───────────────────────────── */
function GlobeFrame() {
  const [mainGeo, eqGeo] = useMemo(() => {
    const mainPairs = [];

    // Latitude lines (not equator)
    LAT_STEPS.forEach((lat) => {
      const pts = latCircle(lat);
      for (let i = 0; i < SEGS; i++)
        mainPairs.push([pts[i], pts[(i + 1) % SEGS]]);
    });

    // Longitude half-circles
    for (let li = 0; li < LONG_N; li++) {
      const pts = longCircle(li);
      for (let i = 0; i < SEGS; i++)
        mainPairs.push([pts[i], pts[i + 1]]);
    }

    // Equator (separate, slightly brighter)
    const eq = equatorCircle();
    const eqPairs = eq.map((p, i) => [p, eq[(i + 1) % SEGS]]);

    return [buildSegGeo(mainPairs), buildSegGeo(eqPairs)];
  }, []);

  return (
    <group>
      <lineSegments geometry={mainGeo}>
        <lineBasicMaterial color="#0b2348" transparent opacity={0.55} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={eqGeo}>
        <lineBasicMaterial color="#1a5296" transparent opacity={0.75} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

/* ─────────────────────────── Globe Nodes ───────────────────────────────── */
function GlobeNodes({ nodes }) {
  const meshRef = useRef();
  const dummy   = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    nodes.forEach((pos, i) => {
      const s = 1 + 0.25 * Math.sin(t * 2.0 + i * 0.58);
      dummy.position.copy(pos);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, nodes.length]}>
      <sphereGeometry args={[0.065, 8, 8]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.92} depthWrite={false} />
    </instancedMesh>
  );
}

/* ─────────────────────────── Connections ───────────────────────────────── */
function GlobeConnections({ conns, nodes }) {
  const geo = useMemo(() => {
    const pairs = conns.map(([a, b]) => [
      { x: nodes[a].x, y: nodes[a].y, z: nodes[a].z },
      { x: nodes[b].x, y: nodes[b].y, z: nodes[b].z },
    ]);
    return buildSegGeo(pairs);
  }, [conns, nodes]);

  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#0ea5e9" transparent opacity={0.28} depthWrite={false} />
    </lineSegments>
  );
}

/* ─────────────────────────── Particles ─────────────────────────────────── */
function GlobeParticles({ conns, nodes }) {
  const pointsRef = useRef();
  const tmpVec    = useRef(new THREE.Vector3());

  const { particles, geoObj } = useMemo(() => {
    const p = conns.flatMap(([a, b]) => {
      const count = Math.random() < 0.45 ? 2 : 1;
      return Array.from({ length: count }, (_, j) => ({
        a:     nodes[a].clone(),
        b:     nodes[b].clone(),
        t:     ((j / count) + Math.random() * 0.4) % 1,
        speed: 0.06 + Math.random() * 0.12,
      }));
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(p.length * 3), 3),
    );
    return { particles: p, geoObj: g };
  }, [conns, nodes]);

  const progress = useRef(particles.map((p) => p.t));

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const attr = geoObj.attributes.position;
    particles.forEach((p, i) => {
      progress.current[i] = (progress.current[i] + p.speed * delta) % 1;
      tmpVec.current.lerpVectors(p.a, p.b, progress.current[i]);
      attr.setXYZ(i, tmpVec.current.x, tmpVec.current.y, tmpVec.current.z);
    });
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geoObj}>
      <pointsMaterial
        color="#a78bfa"
        size={0.075}
        sizeAttenuation
        transparent
        opacity={0.88}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─────────────────────────── Globe Group ───────────────────────────────── */
function GlobeGroup({ mouseRef }) {
  const groupRef = useRef();

  const nodes = useMemo(() => Array.from({ length: NODE_N }, randSphere), []);

  const conns = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++)
        if (nodes[i].angleTo(nodes[j]) < CONNECT_A) pairs.push([i, j]);
    return pairs;
  }, [nodes]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += OMEGA * delta;
    const tx = (mouseRef.current.y || 0) * 0.16;
    groupRef.current.rotation.x +=
      (tx - groupRef.current.rotation.x) * 0.03;
  });

  return (
    <group ref={groupRef}>
      <GlobeFrame />
      <GlobeNodes nodes={nodes} />
      <GlobeConnections conns={conns} nodes={nodes} />
      <GlobeParticles conns={conns} nodes={nodes} />
    </group>
  );
}

/* ─────────────────────── Floating Category Tags ───────────────────────── */
const TAGS = [
  { label: "AI",                 pos: { top: "9%",    left: "7%"   }, delay: "0s",    dur: "4.2s" },
  { label: "Machine Learning",  pos: { top: "3%",    left: "32%"  }, delay: "0.8s",  dur: "3.8s" },
  { label: "Cybersecurity",     pos: { top: "9%",    right: "6%"  }, delay: "1.5s",  dur: "4.5s" },
  { label: "Robotics",          pos: { top: "47%",   right: "2%"  }, delay: "0.4s",  dur: "5.0s" },
  { label: "Space Tech",        pos: { bottom: "9%", right: "6%"  }, delay: "1.1s",  dur: "4.1s" },
  { label: "Data Science",      pos: { bottom: "3%", left: "32%"  }, delay: "1.9s",  dur: "3.9s" },
  { label: "Quantum Computing", pos: { bottom: "9%", left: "4%"   }, delay: "0.6s",  dur: "4.7s" },
  { label: "Cloud Computing",   pos: { top: "47%",   left: "2%"   }, delay: "2.3s",  dur: "4.3s" },
];

/* ─────────────────────────── Main Export ───────────────────────────────── */
function HeroScene() {
  const wrapRef  = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });

  const onMouseMove = useCallback((e) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = {
      x:   (e.clientX - rect.left) / rect.width  * 2 - 1,
      y: -((e.clientY - rect.top)  / rect.height * 2 - 1),
    };
  }, []);

  const onMouseLeave = useCallback(() => {
    mouseRef.current = { x: 0, y: 0 };
  }, []);

  return (
    <div
      className="hero-scene"
      ref={wrapRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Ambient outer glow ring */}
      <div className="hero-scene__glow" aria-hidden="true" />

      {/* Floating tech category labels */}
      <div className="hero-scene__tags" aria-hidden="true">
        {TAGS.map(({ label, pos, delay, dur }) => (
          <span
            key={label}
            className="hero-scene__tag"
            style={{ ...pos, animationDelay: delay, animationDuration: dur }}
          >
            <span className="hero-scene__tag-dot" />
            {label}
          </span>
        ))}
      </div>

      {/* 3D canvas — pointer-events: none lets scroll pass through */}
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <GlobeGroup mouseRef={mouseRef} />
      </Canvas>

      {/* Live badge */}
      <div className="hero-scene__label">
        <span className="hero-scene__dot" />
        Global AI Network · Live
      </div>
    </div>
  );
}

export default HeroScene;

/**
 * modes-extra.js — TOGETHER 3D BRUTALIST AUDIO STAGE
 * 40 Additional Procedural Visualizer Modes (50 Total Modes)
 * Categories: Cosmic, Cyberpunk, Sacred Geometry, Waveforms, Quantum Physics
 */

(function () {
  "use strict";

  if (typeof window === "undefined") return;

  const MODES_EXTRA = [
    // ══════════════════════════════════════════════════════════════════
    // CATEGORY 1: COSMIC & CELESTIAL
    // ══════════════════════════════════════════════════════════════════
    {
      id: "solar_flare",
      name: "SOLAR FLARE",
      category: "Cosmic",
      icon: "☀️",
      camera: { x: 0, y: 16, z: 36, targetY: 9 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 9, 0);

        // Core sun sphere
        const sunGeom = new THREE.SphereGeometry(4.5, 24, 24);
        const sunMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: theme.primary,
          emissiveIntensity: 0.9,
          roughness: 0.1,
          metalness: 0.9,
        });
        const sunMesh = new THREE.Mesh(sunGeom, sunMat);
        group.add(sunMesh);

        // 4 Coronal Loops (Torus loops)
        const loops = [];
        for (let i = 0; i < 4; i++) {
          const lGeom = new THREE.TorusGeometry(6.5 + i * 1.5, 0.18, 6, 32, Math.PI);
          const lMat = new THREE.LineBasicMaterial({ color: i % 2 === 0 ? theme.primary : theme.secondary });
          const lMesh = new THREE.Mesh(lGeom, new THREE.MeshBasicMaterial({ color: lMat.color, wireframe: true }));
          lMesh.rotation.x = (i * Math.PI) / 4;
          lMesh.rotation.y = (i * Math.PI) / 3;
          group.add(lMesh);
          loops.push(lMesh);
        }

        // Prominence Spikes
        const spikeCount = 36;
        const spikes = [];
        const spikeGeom = new THREE.ConeGeometry(0.35, 4.0, 4);
        spikeGeom.translate(0, 2, 0);
        for (let i = 0; i < spikeCount; i++) {
          const sMat = new THREE.MeshStandardMaterial({
            color: 0x0a0c12,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.6,
          });
          const sMesh = new THREE.Mesh(spikeGeom, sMat);
          const theta = Math.random() * Math.PI * 2;
          const phi = (Math.random() - 0.5) * Math.PI;
          sMesh.position.set(Math.cos(phi) * Math.cos(theta) * 4.5, Math.sin(phi) * 4.5, Math.cos(phi) * Math.sin(theta) * 4.5);
          sMesh.lookAt(sMesh.position.clone().multiplyScalar(2));
          group.add(sMesh);
          spikes.push({ mesh: sMesh, baseScale: 1.0, phi, theta });
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            sunMesh.rotation.y += delta * (isPlaying ? 1.2 : 0.3);
            const scale = 1.0 + (isPlaying ? Math.sin(beat * 2) * 0.15 : 0);
            sunMesh.scale.set(scale, scale, scale);
            sunMat.emissiveIntensity = isPlaying ? 0.8 + bass * 0.4 : 0.4;
            loops.forEach((l, i) => {
              l.rotation.z += delta * (0.8 + i * 0.2) * (isPlaying ? 1.5 : 0.5);
            });
            spikes.forEach((s, i) => {
              const pulse = 1.0 + (isPlaying ? Math.sin(beat * 3 + i) * (0.5 + bass * 0.5) : 0);
              s.mesh.scale.set(1, pulse, 1);
            });
            group.rotation.y += delta * 0.1;
          },
          recolor(t) {
            sunMat.emissive.setHex(t.primary);
            loops.forEach((l, i) => l.material.color.setHex(i % 2 === 0 ? t.primary : t.secondary));
            spikes.forEach((s, i) => s.mesh.material.emissive.setHex(i % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "nebula_cloud",
      name: "NEBULA CLOUD",
      category: "Cosmic",
      icon: "🌌",
      camera: { x: 0, y: 18, z: 38, targetY: 9 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 9, 0);

        const particleCount = 120;
        const particles = [];
        const geom = new THREE.OctahedronGeometry(0.5, 0);
        for (let i = 0; i < particleCount; i++) {
          const mat = new THREE.MeshStandardMaterial({
            color: 0x05070c,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.6,
          });
          const mesh = new THREE.Mesh(geom, mat);
          const radius = 4 + Math.random() * 16;
          const theta = Math.random() * Math.PI * 2;
          const phi = (Math.random() - 0.5) * Math.PI * 0.8;
          mesh.position.set(radius * Math.cos(phi) * Math.cos(theta), radius * Math.sin(phi), radius * Math.cos(phi) * Math.sin(theta));
          group.add(mesh);
          particles.push({ mesh, radius, theta, phi, speed: (0.2 + Math.random() * 0.4) * (i % 2 === 0 ? 1 : -1) });
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            particles.forEach((p) => {
              p.theta += delta * p.speed * (isPlaying ? 1.6 : 0.5);
              const r = p.radius + (isPlaying ? Math.sin(beat + p.theta) * (1.5 + bass) : 0);
              p.mesh.position.x = r * Math.cos(p.phi) * Math.cos(p.theta);
              p.mesh.position.z = r * Math.cos(p.phi) * Math.sin(p.theta);
              p.mesh.rotation.x += delta * 1.5;
            });
            group.rotation.y += delta * 0.08;
          },
          recolor(t) {
            particles.forEach((p, i) => p.mesh.material.emissive.setHex(i % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "galaxy_spiral",
      name: "GALAXY SPIRAL",
      category: "Cosmic",
      icon: "🌀",
      camera: { x: 0, y: 24, z: 36, targetY: 7 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 7, 0);

        const coreGeom = new THREE.SphereGeometry(3.2, 16, 16);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: theme.primary,
          emissiveIntensity: 0.8,
        });
        const core = new THREE.Mesh(coreGeom, coreMat);
        group.add(core);

        const stars = [];
        const starGeom = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const ARM_COUNT = 4;
        const STARS_PER_ARM = 24;

        for (let a = 0; a < ARM_COUNT; a++) {
          const armAngle = (a / ARM_COUNT) * Math.PI * 2;
          for (let i = 0; i < STARS_PER_ARM; i++) {
            const dist = 3.5 + (i / STARS_PER_ARM) * 18;
            const spiral = armAngle + (dist * 0.4);
            const mat = new THREE.MeshStandardMaterial({
              color: 0x05070a,
              emissive: a % 2 === 0 ? theme.primary : theme.secondary,
              emissiveIntensity: 0.6,
            });
            const mesh = new THREE.Mesh(starGeom, mat);
            mesh.position.set(Math.cos(spiral) * dist, (Math.random() - 0.5) * 1.5, Math.sin(spiral) * dist);
            group.add(mesh);
            stars.push({ mesh, dist, spiral, arm: a });
          }
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            core.rotation.y += delta * 1.5;
            const coreScale = 1.0 + (isPlaying ? Math.sin(beat * 2) * 0.2 : 0);
            core.scale.set(coreScale, coreScale, coreScale);
            group.rotation.y += delta * (isPlaying ? 0.4 : 0.1);
            stars.forEach((s) => {
              const wave = Math.sin(beat * 1.5 + s.dist * 0.5) * (isPlaying ? 1.0 + bass * 0.5 : 0.2);
              s.mesh.position.y = wave;
            });
          },
          recolor(t) {
            coreMat.emissive.setHex(t.primary);
            stars.forEach((s) => s.mesh.material.emissive.setHex(s.arm % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "dark_matter",
      name: "DARK MATTER",
      category: "Cosmic",
      icon: "🕳️",
      camera: { x: 0, y: 16, z: 36, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        // Invisible black attractor
        const bhGeom = new THREE.IcosahedronGeometry(3.8, 1);
        const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const bh = new THREE.Mesh(bhGeom, bhMat);
        group.add(bh);

        // Gravitational ring web
        const rings = [];
        for (let i = 0; i < 8; i++) {
          const rGeom = new THREE.TorusGeometry(5.5 + i * 1.6, 0.15, 6, 32);
          const rMat = new THREE.MeshStandardMaterial({
            color: 0x05070a,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.5,
          });
          const rMesh = new THREE.Mesh(rGeom, rMat);
          rMesh.rotation.x = Math.PI / 2 + (i * 0.15);
          rMesh.rotation.y = (i * Math.PI) / 4;
          group.add(rMesh);
          rings.push(rMesh);
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            rings.forEach((r, idx) => {
              r.rotation.z += delta * (idx % 2 === 0 ? 0.6 : -0.6) * (isPlaying ? 1.5 : 0.4);
              const warp = 1.0 + (isPlaying ? Math.sin(beat * 2 + idx) * 0.15 : 0);
              r.scale.set(warp, warp, warp);
            });
            group.rotation.y += delta * 0.15;
          },
          recolor(t) {
            rings.forEach((r, idx) => r.material.emissive.setHex(idx % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "orbital_sat",
      name: "SATELLITE FLEET",
      category: "Cosmic",
      icon: "🛰️",
      camera: { x: 0, y: 18, z: 36, targetY: 9 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 9, 0);

        const planetGeom = new THREE.SphereGeometry(6.0, 24, 24);
        const planetMat = new THREE.MeshStandardMaterial({
          color: 0x060810,
          roughness: 0.5,
          metalness: 0.8,
          wireframe: true,
          emissive: theme.primary,
          emissiveIntensity: 0.2,
        });
        const planet = new THREE.Mesh(planetGeom, planetMat);
        group.add(planet);

        const sats = [];
        const satGeom = new THREE.BoxGeometry(0.9, 0.5, 1.4);
        for (let i = 0; i < 6; i++) {
          const sMat = new THREE.MeshStandardMaterial({
            color: 0x0a0c14,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.8,
          });
          const sMesh = new THREE.Mesh(satGeom, sMat);
          group.add(sMesh);
          sats.push({ mesh: sMesh, radius: 10 + i * 1.5, angle: (i / 6) * Math.PI * 2, tilt: (i * Math.PI) / 3 });
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            planet.rotation.y += delta * 0.2;
            sats.forEach((s) => {
              s.angle += delta * (isPlaying ? 1.4 : 0.4);
              s.mesh.position.set(
                Math.cos(s.angle) * s.radius,
                Math.sin(s.angle * 2 + s.tilt) * 3,
                Math.sin(s.angle) * s.radius
              );
              s.mesh.rotation.y = -s.angle;
            });
            group.rotation.y += delta * 0.1;
          },
          recolor(t) {
            planetMat.emissive.setHex(t.primary);
            sats.forEach((s, i) => s.mesh.material.emissive.setHex(i % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "ringed_giant",
      name: "RINGED GIANT",
      category: "Cosmic",
      icon: "🪐",
      camera: { x: 0, y: 16, z: 38, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        const giantGeom = new THREE.SphereGeometry(5.2, 24, 24);
        const giantMat = new THREE.MeshStandardMaterial({
          color: 0x070912,
          emissive: theme.primary,
          emissiveIntensity: 0.4,
          roughness: 0.3,
          metalness: 0.8,
        });
        const giant = new THREE.Mesh(giantGeom, giantMat);
        group.add(giant);

        const ringGeom = new THREE.RingGeometry(7.5, 17.0, 36);
        const ringMat = new THREE.MeshBasicMaterial({
          color: theme.secondary,
          side: THREE.DoubleSide,
          wireframe: true,
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2.4;
        ring.rotation.y = Math.PI / 6;
        group.add(ring);

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            giant.rotation.y += delta * 0.4;
            ring.rotation.z += delta * (isPlaying ? 0.6 : 0.15);
            const scale = 1.0 + (isPlaying ? Math.sin(beat * 2) * 0.12 : 0);
            ring.scale.set(scale, scale, 1);
            group.rotation.y += delta * 0.1;
          },
          recolor(t) {
            giantMat.emissive.setHex(t.primary);
            ringMat.color.setHex(t.secondary);
          },
        };
      },
    },

    {
      id: "eclipse",
      name: "ECLIPSE DISK",
      category: "Cosmic",
      icon: "🌘",
      camera: { x: 0, y: 14, z: 36, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        // Pitch black moon
        const moonGeom = new THREE.SphereGeometry(5.0, 32, 32);
        const moonMat = new THREE.MeshBasicMaterial({ color: 0x020306 });
        const moon = new THREE.Mesh(moonGeom, moonMat);
        group.add(moon);

        // Blinding Corona ring
        const coronaGeom = new THREE.RingGeometry(5.2, 8.5, 48);
        const coronaMat = new THREE.MeshBasicMaterial({
          color: theme.primary,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        });
        const corona = new THREE.Mesh(coronaGeom, coronaMat);
        group.add(corona);

        // Ray spikes
        const rays = [];
        const rayGeom = new THREE.ConeGeometry(0.3, 7.0, 4);
        rayGeom.translate(0, 3.5, 0);
        for (let i = 0; i < 24; i++) {
          const rMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? theme.primary : theme.secondary });
          const rMesh = new THREE.Mesh(rayGeom, rMat);
          const angle = (i / 24) * Math.PI * 2;
          rMesh.position.set(Math.cos(angle) * 5.2, Math.sin(angle) * 5.2, 0);
          rMesh.rotation.z = angle - Math.PI / 2;
          group.add(rMesh);
          rays.push(rMesh);
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            corona.rotation.z += delta * 0.4;
            const cScale = 1.0 + (isPlaying ? Math.sin(beat * 2.5) * 0.25 + bass * 0.2 : 0);
            corona.scale.set(cScale, cScale, 1);
            rays.forEach((r, idx) => {
              const rScale = 1.0 + (isPlaying ? Math.sin(beat * 3 + idx) * (0.6 + bass * 0.6) : 0);
              r.scale.set(1, rScale, 1);
            });
            group.rotation.y += delta * 0.12;
          },
          recolor(t) {
            coronaMat.color.setHex(t.primary);
            rays.forEach((r, idx) => r.material.color.setHex(idx % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "comet_tail",
      name: "COMET TAIL",
      category: "Cosmic",
      icon: "☄️",
      camera: { x: 0, y: 16, z: 38, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        const headGeom = new THREE.DodecahedronGeometry(2.0, 0);
        const headMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: theme.primary,
          emissiveIntensity: 0.9,
        });
        const head = new THREE.Mesh(headGeom, headMat);
        group.add(head);

        const tailNodes = [];
        const tGeom = new THREE.OctahedronGeometry(0.6, 0);
        for (let i = 0; i < 30; i++) {
          const tMat = new THREE.MeshStandardMaterial({
            color: 0x05070a,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.7 - (i / 30) * 0.5,
          });
          const tMesh = new THREE.Mesh(tGeom, tMat);
          group.add(tMesh);
          tailNodes.push({ mesh: tMesh, offset: i });
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            const time = beat * 1.5;
            const hX = Math.sin(time) * 14;
            const hZ = Math.cos(time * 0.8) * 10;
            const hY = Math.sin(time * 1.2) * 4;
            head.position.set(hX, hY, hZ);
            head.rotation.x += delta * 2;

            tailNodes.forEach((n) => {
              const lag = time - (n.offset * 0.08);
              n.mesh.position.set(
                Math.sin(lag) * 14 + (Math.sin(lag * 4) * 0.5),
                Math.sin(lag * 1.2) * 4,
                Math.cos(lag * 0.8) * 10
              );
              const scale = 1.0 - (n.offset / 30) * 0.6;
              n.mesh.scale.set(scale, scale, scale);
            });
          },
          recolor(t) {
            headMat.emissive.setHex(t.primary);
            tailNodes.forEach((n) => n.mesh.material.emissive.setHex(n.offset % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    // ══════════════════════════════════════════════════════════════════
    // CATEGORY 2: CYBERPUNK & DIGITAL
    // ══════════════════════════════════════════════════════════════════
    {
      id: "matrix_rain",
      name: "MATRIX RAIN",
      category: "Cyberpunk",
      icon: "💾",
      camera: { x: 0, y: 14, z: 34, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 0, 0);

        const colCount = 36;
        const columns = [];
        const boxGeom = new THREE.BoxGeometry(0.35, 1.8, 0.35);

        for (let i = 0; i < colCount; i++) {
          const mat = new THREE.MeshStandardMaterial({
            color: 0x05070a,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.7,
          });
          const mesh = new THREE.Mesh(boxGeom, mat);
          const x = (i % 6 - 2.5) * 4.5;
          const z = (Math.floor(i / 6) - 2.5) * 4.5;
          mesh.position.set(x, Math.random() * 20, z);
          group.add(mesh);
          columns.push({ mesh, speed: 6 + Math.random() * 10 });
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass) {
            columns.forEach((c) => {
              c.mesh.position.y -= delta * c.speed * (isPlaying ? 1.8 + bass : 0.6);
              if (c.mesh.position.y < 0) c.mesh.position.y = 22;
              c.mesh.rotation.y += delta * 1.5;
            });
            group.rotation.y += delta * 0.05;
          },
          recolor(t) {
            columns.forEach((c, idx) => c.mesh.material.emissive.setHex(idx % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "cyber_city",
      name: "CYBER HIGHWAY",
      category: "Cyberpunk",
      icon: "🏎️",
      camera: { x: 0, y: 8, z: 32, targetY: 4 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 0, 0);

        // Highway grid lanes
        const laneCount = 20;
        const lanes = [];
        const segGeom = new THREE.BoxGeometry(0.5, 0.2, 4);
        for (let i = 0; i < laneCount; i++) {
          const mat = new THREE.MeshStandardMaterial({
            color: 0x060810,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.8,
          });
          const mesh = new THREE.Mesh(segGeom, mat);
          mesh.position.set(((i % 4) - 1.5) * 4, 0.5, -i * 6);
          group.add(mesh);
          lanes.push(mesh);
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass) {
            lanes.forEach((l) => {
              l.position.z += delta * (isPlaying ? 32 + bass * 12 : 10);
              if (l.position.z > 20) l.position.z = -100;
            });
          },
          recolor(t) {
            lanes.forEach((l, i) => l.material.emissive.setHex(i % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "hologram_cube",
      name: "HOLOGRAM CUBE",
      category: "Cyberpunk",
      icon: "📦",
      camera: { x: 18, y: 16, z: 28, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        const cubeGeom = new THREE.BoxGeometry(10, 10, 10);
        const cubeMat = new THREE.MeshStandardMaterial({
          color: 0x05070c,
          roughness: 0.2,
          metalness: 0.9,
          transparent: true,
          opacity: 0.3,
          wireframe: true,
        });
        const cube = new THREE.Mesh(cubeGeom, cubeMat);
        group.add(cube);

        const edgeMat = new THREE.LineBasicMaterial({ color: theme.primary, linewidth: 2 });
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(cubeGeom), edgeMat);
        cube.add(edges);

        const coreGeom = new THREE.OctahedronGeometry(3.0, 0);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: theme.secondary,
          emissiveIntensity: 0.8,
        });
        const core = new THREE.Mesh(coreGeom, coreMat);
        group.add(core);

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            cube.rotation.y += delta * (isPlaying ? 0.8 : 0.2);
            cube.rotation.x += delta * (isPlaying ? 0.5 : 0.15);
            core.rotation.y -= delta * (isPlaying ? 1.8 : 0.4);
            const scale = 1.0 + (isPlaying ? Math.sin(beat * 2) * 0.2 : 0);
            core.scale.set(scale, scale, scale);
            group.rotation.y += delta * 0.1;
          },
          recolor(t) {
            edgeMat.color.setHex(t.primary);
            coreMat.emissive.setHex(t.secondary);
          },
        };
      },
    },

    {
      id: "circuit_board",
      name: "CIRCUIT MATRIX",
      category: "Cyberpunk",
      icon: "🔌",
      camera: { x: 0, y: 22, z: 32, targetY: 2 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 0, 0);

        // Central CPU chip
        const chipGeom = new THREE.BoxGeometry(8, 1.2, 8);
        const chipMat = new THREE.MeshStandardMaterial({
          color: 0x060810,
          roughness: 0.2,
          metalness: 0.9,
          emissive: theme.primary,
          emissiveIntensity: 0.5,
        });
        const chip = new THREE.Mesh(chipGeom, chipMat);
        chip.position.y = 0.6;
        group.add(chip);

        // Traces radiating outward
        const traceCount = 16;
        const traces = [];
        const tGeom = new THREE.BoxGeometry(0.4, 0.2, 12);
        for (let i = 0; i < traceCount; i++) {
          const tMat = new THREE.MeshStandardMaterial({
            color: 0x05070a,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.6,
          });
          const tMesh = new THREE.Mesh(tGeom, tMat);
          const angle = (i / traceCount) * Math.PI * 2;
          tMesh.position.set(Math.cos(angle) * 10, 0.2, Math.sin(angle) * 10);
          tMesh.rotation.y = -angle;
          group.add(tMesh);
          traces.push(tMesh);
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            chip.rotation.y += delta * 0.1;
            chipMat.emissiveIntensity = isPlaying ? 0.6 + Math.sin(beat * 3) * 0.4 : 0.2;
            traces.forEach((t, idx) => {
              const pulse = 1.0 + (isPlaying ? Math.sin(beat * 2 + idx) * 0.3 : 0);
              t.scale.set(pulse, 1, 1);
            });
            group.rotation.y += delta * 0.08;
          },
          recolor(t) {
            chipMat.emissive.setHex(t.primary);
            traces.forEach((tMesh, i) => tMesh.material.emissive.setHex(i % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "retro_grid",
      name: "OUTRUN RETRO",
      category: "Cyberpunk",
      icon: "🌆",
      camera: { x: 0, y: 6, z: 32, targetY: 4 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 0, 0);

        const planeGeom = new THREE.PlaneGeometry(80, 100, 20, 25);
        planeGeom.rotateX(-Math.PI / 2);
        const planeMat = new THREE.MeshBasicMaterial({ color: theme.primary, wireframe: true });
        const plane = new THREE.Mesh(planeGeom, planeMat);
        group.add(plane);

        const sunGeom = new THREE.SphereGeometry(12, 16, 16);
        const sunMat = new THREE.MeshBasicMaterial({ color: theme.secondary, wireframe: true });
        const sun = new THREE.Mesh(sunGeom, sunMat);
        sun.position.set(0, 8, -50);
        group.add(sun);

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            const pos = planeGeom.attributes.position;
            const time = beat * 0.8;
            for (let i = 0; i < pos.count; i++) {
              const x = pos.getX(i);
              const z = pos.getZ(i);
              const wave = Math.sin(x * 0.2 + time) * Math.cos(z * 0.15 - time);
              pos.setY(i, Math.abs(x) > 10 ? (Math.abs(x) - 10) * 0.4 + wave * (isPlaying ? 2.5 : 0.8) : wave);
            }
            pos.needsUpdate = true;
            sun.rotation.y += delta * 0.2;
            const sScale = 1.0 + (isPlaying ? Math.sin(beat * 2) * 0.15 : 0);
            sun.scale.set(sScale, sScale, sScale);
          },
          recolor(t) {
            planeMat.color.setHex(t.primary);
            sunMat.color.setHex(t.secondary);
          },
        };
      },
    },

    {
      id: "laser_harp",
      name: "LASER HARP",
      category: "Cyberpunk",
      icon: "⚡",
      camera: { x: 0, y: 14, z: 36, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 0, 0);

        const stringCount = 16;
        const strings = [];
        const sGeom = new THREE.CylinderGeometry(0.12, 0.12, 18, 6);
        sGeom.translate(0, 9, 0);

        for (let i = 0; i < stringCount; i++) {
          const mat = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? theme.primary : theme.secondary,
            transparent: true,
            opacity: 0.8,
          });
          const mesh = new THREE.Mesh(sGeom, mat);
          const x = (i - stringCount / 2 + 0.5) * 1.8;
          mesh.position.set(x, 0, 0);
          group.add(mesh);
          strings.push(mesh);
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            strings.forEach((s, idx) => {
              const vib = isPlaying ? Math.sin(beat * 4 + idx) * (0.4 + bass * 0.3) : 0;
              s.position.z = vib;
              s.material.opacity = isPlaying ? 0.5 + Math.abs(Math.sin(beat * 2 + idx)) * 0.5 : 0.3;
            });
            group.rotation.y += delta * 0.05;
          },
          recolor(t) {
            strings.forEach((s, i) => s.material.color.setHex(i % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "digital_prism",
      name: "CHROMATIC BEAM",
      category: "Cyberpunk",
      icon: "📐",
      camera: { x: 0, y: 16, z: 36, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        const prismGeom = new THREE.CylinderGeometry(3.5, 3.5, 7, 3);
        const prismMat = new THREE.MeshStandardMaterial({
          color: 0x05070c,
          roughness: 0.1,
          metalness: 0.95,
          emissive: theme.primary,
          emissiveIntensity: 0.3,
        });
        const prism = new THREE.Mesh(prismGeom, prismMat);
        group.add(prism);

        const beams = [];
        const bGeom = new THREE.BoxGeometry(0.3, 0.3, 16);
        bGeom.translate(0, 0, 8);
        for (let i = 0; i < 6; i++) {
          const bMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? theme.primary : theme.secondary });
          const bMesh = new THREE.Mesh(bGeom, bMat);
          bMesh.rotation.y = (i - 2.5) * 0.25;
          group.add(bMesh);
          beams.push(bMesh);
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            prism.rotation.y += delta * 0.6;
            beams.forEach((b, idx) => {
              b.rotation.y = (idx - 2.5) * 0.25 + Math.sin(beat + idx) * (isPlaying ? 0.08 : 0.02);
              const scale = 1.0 + (isPlaying ? Math.sin(beat * 3 + idx) * 0.4 : 0);
              b.scale.set(scale, scale, 1);
            });
            group.rotation.y += delta * 0.1;
          },
          recolor(t) {
            prismMat.emissive.setHex(t.primary);
            beams.forEach((b, i) => b.material.color.setHex(i % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "mainframe",
      name: "MAINFRAME RACK",
      category: "Cyberpunk",
      icon: "🖥️",
      camera: { x: 0, y: 16, z: 36, targetY: 7 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 0, 0);

        const rackCount = 8;
        const racks = [];
        const rGeom = new THREE.BoxGeometry(2.4, 14, 2.4);
        rGeom.translate(0, 7, 0);

        for (let i = 0; i < rackCount; i++) {
          const rMat = new THREE.MeshStandardMaterial({
            color: 0x070912,
            roughness: 0.3,
            metalness: 0.85,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.35,
          });
          const mesh = new THREE.Mesh(rGeom, rMat);
          const angle = (i / rackCount) * Math.PI * 2;
          mesh.position.set(Math.cos(angle) * 14, 0, Math.sin(angle) * 14);
          mesh.rotation.y = -angle;
          group.add(mesh);
          racks.push(mesh);
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            racks.forEach((r, idx) => {
              r.material.emissiveIntensity = isPlaying ? 0.3 + Math.sin(beat * 4 + idx) * 0.5 : 0.2;
              r.scale.y = 1.0 + (isPlaying ? Math.sin(beat * 2 + idx) * 0.15 : 0);
            });
            group.rotation.y += delta * 0.1;
          },
          recolor(t) {
            racks.forEach((r, i) => r.material.emissive.setHex(i % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    // ══════════════════════════════════════════════════════════════════
    // CATEGORY 3: SACRED GEOMETRY
    // ══════════════════════════════════════════════════════════════════
    {
      id: "kaleidoscope",
      name: "KALEIDOSCOPE",
      category: "Geometry",
      icon: "✨",
      camera: { x: 0, y: 16, z: 32, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        const facets = [];
        const fGeom = new THREE.TetrahedronGeometry(2.4, 0);
        for (let i = 0; i < 18; i++) {
          const fMat = new THREE.MeshStandardMaterial({
            color: 0x060810,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.5,
            roughness: 0.2,
            metalness: 0.9,
          });
          const mesh = new THREE.Mesh(fGeom, fMat);
          const angle = (i / 18) * Math.PI * 2;
          const r = 7 + (i % 3) * 2;
          mesh.position.set(Math.cos(angle) * r, Math.sin(i) * 2, Math.sin(angle) * r);
          group.add(mesh);
          facets.push({ mesh, angle, r, speed: 0.5 + (i % 3) * 0.2 });
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            facets.forEach((f) => {
              f.angle += delta * f.speed * (isPlaying ? 1.6 : 0.5);
              f.mesh.position.x = Math.cos(f.angle) * f.r;
              f.mesh.position.z = Math.sin(f.angle) * f.r;
              f.mesh.rotation.x += delta * 1.5;
              f.mesh.rotation.y += delta * 1.8;
            });
            group.rotation.z += delta * (isPlaying ? 0.4 : 0.1);
          },
          recolor(t) {
            facets.forEach((f, i) => f.mesh.material.emissive.setHex(i % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "merkaba",
      name: "MERKABA STAR",
      category: "Geometry",
      icon: "⭐",
      camera: { x: 0, y: 14, z: 34, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        const tGeom = new THREE.TetrahedronGeometry(6.0, 0);
        const tMat1 = new THREE.MeshStandardMaterial({
          color: 0x070912,
          emissive: theme.primary,
          emissiveIntensity: 0.6,
          roughness: 0.2,
          metalness: 0.9,
          wireframe: true,
        });
        const tet1 = new THREE.Mesh(tGeom, tMat1);
        group.add(tet1);

        const tMat2 = new THREE.MeshStandardMaterial({
          color: 0x070912,
          emissive: theme.secondary,
          emissiveIntensity: 0.6,
          roughness: 0.2,
          metalness: 0.9,
          wireframe: true,
        });
        const tet2 = new THREE.Mesh(tGeom, tMat2);
        tet2.rotation.x = Math.PI;
        tet2.rotation.z = Math.PI / 4;
        group.add(tet2);

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            tet1.rotation.y += delta * (isPlaying ? 1.2 : 0.3);
            tet2.rotation.y -= delta * (isPlaying ? 1.2 : 0.3);
            const scale = 1.0 + (isPlaying ? Math.sin(beat * 2) * 0.18 : 0);
            group.scale.set(scale, scale, scale);
            group.rotation.x += delta * 0.2;
          },
          recolor(t) {
            tMat1.emissive.setHex(t.primary);
            tMat2.emissive.setHex(t.secondary);
          },
        };
      },
    },

    {
      id: "fibonacci",
      name: "FIBONACCI LATTICE",
      category: "Geometry",
      icon: "🌻",
      camera: { x: 0, y: 22, z: 32, targetY: 4 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 4, 0);

        const nodeCount = 55;
        const nodes = [];
        const nGeom = new THREE.OctahedronGeometry(0.5, 0);
        const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio

        for (let i = 0; i < nodeCount; i++) {
          const r = Math.sqrt(i) * 2.2;
          const theta = i * 2 * Math.PI * (1 - 1 / phi);
          const mat = new THREE.MeshStandardMaterial({
            color: 0x05070c,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.6,
          });
          const mesh = new THREE.Mesh(nGeom, mat);
          mesh.position.set(r * Math.cos(theta), 0, r * Math.sin(theta));
          group.add(mesh);
          nodes.push({ mesh, r, theta, idx: i });
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            nodes.forEach((n) => {
              n.mesh.position.y = Math.sin(beat * 2 + n.r * 0.4) * (isPlaying ? 2.5 + bass : 0.5);
              n.mesh.rotation.y += delta * 1.5;
            });
            group.rotation.y += delta * 0.15;
          },
          recolor(t) {
            nodes.forEach((n) => n.mesh.material.emissive.setHex(n.idx % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "dodeca_core",
      name: "DODECA MATRIX",
      category: "Geometry",
      icon: "💎",
      camera: { x: 0, y: 16, z: 34, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        const dGeom = new THREE.DodecahedronGeometry(6.5, 0);
        const dMat = new THREE.MeshStandardMaterial({
          color: 0x05070a,
          emissive: theme.primary,
          emissiveIntensity: 0.4,
          wireframe: true,
        });
        const outer = new THREE.Mesh(dGeom, dMat);
        group.add(outer);

        const innerGeom = new THREE.DodecahedronGeometry(3.5, 0);
        const innerMat = new THREE.MeshStandardMaterial({
          color: 0x05070a,
          emissive: theme.secondary,
          emissiveIntensity: 0.7,
        });
        const inner = new THREE.Mesh(innerGeom, innerMat);
        group.add(inner);

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            outer.rotation.y += delta * 0.5;
            outer.rotation.x += delta * 0.3;
            inner.rotation.y -= delta * 1.2;
            const scale = 1.0 + (isPlaying ? Math.sin(beat * 2) * 0.2 : 0);
            inner.scale.set(scale, scale, scale);
            group.rotation.y += delta * 0.1;
          },
          recolor(t) {
            dMat.emissive.setHex(t.primary);
            innerMat.emissive.setHex(t.secondary);
          },
        };
      },
    },

    {
      id: "mobius_strip",
      name: "MOBIUS RIBBON",
      category: "Geometry",
      icon: "♾️",
      camera: { x: 0, y: 14, z: 34, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        // Approximate mobius ribbon with segmented boxes
        const segCount = 48;
        const segments = [];
        const sGeom = new THREE.BoxGeometry(2.0, 0.2, 0.8);

        for (let i = 0; i < segCount; i++) {
          const u = (i / segCount) * Math.PI * 2;
          const mat = new THREE.MeshStandardMaterial({
            color: 0x060810,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.6,
          });
          const mesh = new THREE.Mesh(sGeom, mat);
          const r = 9 + Math.cos(u / 2) * 2;
          mesh.position.set(r * Math.cos(u), Math.sin(u / 2) * 3, r * Math.sin(u));
          mesh.rotation.y = -u;
          mesh.rotation.z = u / 2;
          group.add(mesh);
          segments.push(mesh);
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            segments.forEach((s, idx) => {
              const pulse = 1.0 + (isPlaying ? Math.sin(beat * 2 + idx * 0.2) * 0.2 : 0);
              s.scale.set(1, pulse, 1);
            });
            group.rotation.y += delta * (isPlaying ? 0.6 : 0.2);
            group.rotation.x = Math.sin(beat) * 0.2;
          },
          recolor(t) {
            segments.forEach((s, i) => s.material.emissive.setHex(i % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "torus_knot",
      name: "TORUS KNOT",
      category: "Geometry",
      icon: "🪢",
      camera: { x: 0, y: 16, z: 32, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        const knotGeom = new THREE.TorusKnotGeometry(6.0, 1.2, 64, 12, 3, 7);
        const knotMat = new THREE.MeshStandardMaterial({
          color: 0x05070a,
          emissive: theme.primary,
          emissiveIntensity: 0.6,
          wireframe: true,
        });
        const knot = new THREE.Mesh(knotGeom, knotMat);
        group.add(knot);

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            knot.rotation.y += delta * (isPlaying ? 0.8 : 0.2);
            knot.rotation.x += delta * 0.4;
            const scale = 1.0 + (isPlaying ? Math.sin(beat * 2) * 0.15 : 0);
            knot.scale.set(scale, scale, scale);
          },
          recolor(t) {
            knotMat.emissive.setHex(t.primary);
          },
        };
      },
    },

    {
      id: "icosa_cluster",
      name: "ICOSA CLUSTER",
      category: "Geometry",
      icon: "🔷",
      camera: { x: 0, y: 16, z: 36, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        const count = 12;
        const gems = [];
        const gGeom = new THREE.IcosahedronGeometry(1.6, 0);
        for (let i = 0; i < count; i++) {
          const gMat = new THREE.MeshStandardMaterial({
            color: 0x060810,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.7,
            roughness: 0.15,
            metalness: 0.9,
          });
          const mesh = new THREE.Mesh(gGeom, gMat);
          const angle = (i / count) * Math.PI * 2;
          mesh.position.set(Math.cos(angle) * 10, Math.sin(angle * 2) * 2.5, Math.sin(angle) * 10);
          group.add(mesh);
          gems.push({ mesh, angle });
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            gems.forEach((g) => {
              g.angle += delta * (isPlaying ? 1.2 : 0.3);
              g.mesh.position.x = Math.cos(g.angle) * 10;
              g.mesh.position.z = Math.sin(g.angle) * 10;
              g.mesh.rotation.x += delta * 2;
              g.mesh.rotation.y += delta * 2.5;
            });
            group.rotation.y += delta * 0.1;
          },
          recolor(t) {
            gems.forEach((g, i) => g.mesh.material.emissive.setHex(i % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "fractal_tree",
      name: "FRACTAL DENDRITE",
      category: "Geometry",
      icon: "🌲",
      camera: { x: 0, y: 14, z: 36, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 0, 0);

        const branches = [];
        const bGeom = new THREE.CylinderGeometry(0.15, 0.25, 6, 6);
        bGeom.translate(0, 3, 0);

        function addBranch(x, y, z, rx, rz, scale, depth) {
          if (depth > 3) return;
          const mat = new THREE.MeshStandardMaterial({
            color: 0x05070a,
            emissive: depth % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.6,
          });
          const mesh = new THREE.Mesh(bGeom, mat);
          mesh.position.set(x, y, z);
          mesh.rotation.x = rx;
          mesh.rotation.z = rz;
          mesh.scale.set(scale, scale, scale);
          group.add(mesh);
          branches.push({ mesh, depth, baseScale: scale });

          const nextY = y + 5 * scale;
          addBranch(x - 2 * scale, nextY, z, rx + 0.3, rz - 0.4, scale * 0.75, depth + 1);
          addBranch(x + 2 * scale, nextY, z, rx - 0.3, rz + 0.4, scale * 0.75, depth + 1);
        }

        addBranch(0, 0, 0, 0, 0, 1.2, 0);

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            branches.forEach((b) => {
              const pulse = b.baseScale * (1.0 + (isPlaying ? Math.sin(beat * 2 + b.depth) * (0.2 + bass * 0.2) : 0));
              b.mesh.scale.set(pulse, pulse, pulse);
            });
            group.rotation.y += delta * 0.2;
          },
          recolor(t) {
            branches.forEach((b) => b.mesh.material.emissive.setHex(b.depth % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    // ══════════════════════════════════════════════════════════════════
    // CATEGORY 4: AUDIO WAVEFORMS & SPECTRA
    // ══════════════════════════════════════════════════════════════════
    {
      id: "circular_spec",
      name: "RADIAL SPECTRUM",
      category: "Waveforms",
      icon: "📊",
      camera: { x: 0, y: 18, z: 36, targetY: 6 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 0, 0);

        const barCount = 48;
        const bars = [];
        const bGeom = new THREE.BoxGeometry(0.8, 1, 0.8);
        bGeom.translate(0, 0.5, 0);

        for (let i = 0; i < barCount; i++) {
          const mat = new THREE.MeshStandardMaterial({
            color: 0x05070a,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.6,
          });
          const mesh = new THREE.Mesh(bGeom, mat);
          const angle = (i / barCount) * Math.PI * 2;
          mesh.position.set(Math.cos(angle) * 14, 0, Math.sin(angle) * 14);
          mesh.rotation.y = -angle;
          group.add(mesh);
          bars.push({ mesh, angle, idx: i });
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            bars.forEach((b) => {
              const h = isPlaying ? 1.0 + Math.abs(Math.sin(beat * 2 + b.angle * 2)) * (14 + bass * 8) : 1.0;
              b.mesh.scale.y += (h - b.mesh.scale.y) * 0.3;
            });
            group.rotation.y += delta * 0.15;
          },
          recolor(t) {
            bars.forEach((b) => b.mesh.material.emissive.setHex(b.idx % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "oscilloscope",
      name: "LISSAJOUS SCOPE",
      category: "Waveforms",
      icon: "〰️",
      camera: { x: 0, y: 14, z: 34, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        const nodeCount = 40;
        const nodes = [];
        const nGeom = new THREE.OctahedronGeometry(0.6, 0);
        for (let i = 0; i < nodeCount; i++) {
          const mat = new THREE.MeshStandardMaterial({
            color: 0x05070c,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.8,
          });
          const mesh = new THREE.Mesh(nGeom, mat);
          group.add(mesh);
          nodes.push({ mesh, t: (i / nodeCount) * Math.PI * 2 });
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            nodes.forEach((n) => {
              const t = n.t + beat * (isPlaying ? 1.5 : 0.4);
              n.mesh.position.set(
                Math.sin(t * 3) * (10 + bass * 2),
                Math.sin(t * 2) * (6 + bass * 2),
                Math.cos(t * 4) * 6
              );
            });
            group.rotation.y += delta * 0.2;
          },
          recolor(t) {
            nodes.forEach((n, i) => n.mesh.material.emissive.setHex(i % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "sound_wave",
      name: "AUDIO RIBBON",
      category: "Waveforms",
      icon: "🎗️",
      camera: { x: 0, y: 14, z: 36, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        const ribbons = [];
        for (let r = 0; r < 3; r++) {
          const nodes = [];
          const geom = new THREE.BoxGeometry(0.6, 0.6, 0.6);
          for (let i = 0; i < 32; i++) {
            const mat = new THREE.MeshStandardMaterial({
              color: 0x05070a,
              emissive: r === 0 ? theme.primary : theme.secondary,
              emissiveIntensity: 0.6,
            });
            const mesh = new THREE.Mesh(geom, mat);
            group.add(mesh);
            nodes.push({ mesh, idx: i, r });
          }
          ribbons.push(nodes);
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            ribbons.forEach((nodes, r) => {
              nodes.forEach((n) => {
                const x = (n.idx - 16) * 1.2;
                const y = Math.sin(beat * 2 + n.idx * 0.3 + r) * (isPlaying ? 4 + bass * 3 : 1);
                const z = (r - 1) * 4;
                n.mesh.position.set(x, y, z);
              });
            });
            group.rotation.y += delta * 0.1;
          },
          recolor(t) {
            ribbons.forEach((nodes, r) => {
              nodes.forEach((n) => n.mesh.material.emissive.setHex(r === 0 ? t.primary : t.secondary));
            });
          },
        };
      },
    },

    {
      id: "liquid_mesh",
      name: "LIQUID MESH",
      category: "Waveforms",
      icon: "🌊",
      camera: { x: 0, y: 18, z: 34, targetY: 4 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 2, 0);

        const planeGeom = new THREE.PlaneGeometry(36, 36, 18, 18);
        planeGeom.rotateX(-Math.PI / 2);
        const planeMat = new THREE.MeshStandardMaterial({
          color: 0x05070c,
          roughness: 0.2,
          metalness: 0.9,
          emissive: theme.primary,
          emissiveIntensity: 0.35,
          wireframe: true,
        });
        const plane = new THREE.Mesh(planeGeom, planeMat);
        group.add(plane);

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            const pos = planeGeom.attributes.position;
            const time = beat * 1.2;
            for (let i = 0; i < pos.count; i++) {
              const x = pos.getX(i);
              const z = pos.getZ(i);
              const dist = Math.sqrt(x * x + z * z);
              const wave = Math.sin(dist * 0.5 - time) * (isPlaying ? 3.5 + bass * 2 : 0.8);
              pos.setY(i, wave);
            }
            pos.needsUpdate = true;
            group.rotation.y += delta * 0.1;
          },
          recolor(t) {
            planeMat.emissive.setHex(t.primary);
          },
        };
      },
    },

    {
      id: "freq_dome",
      name: "GEODESIC DOME",
      category: "Waveforms",
      icon: "🌐",
      camera: { x: 0, y: 14, z: 34, targetY: 6 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 0, 0);

        const domeGeom = new THREE.IcosahedronGeometry(12, 1);
        const domeMat = new THREE.MeshBasicMaterial({ color: theme.primary, wireframe: true });
        const dome = new THREE.Mesh(domeGeom, domeMat);
        group.add(dome);

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            dome.rotation.y += delta * (isPlaying ? 0.4 : 0.1);
            const scale = 1.0 + (isPlaying ? Math.sin(beat * 2) * 0.15 + bass * 0.15 : 0);
            dome.scale.set(scale, scale, scale);
          },
          recolor(t) {
            domeMat.color.setHex(t.primary);
          },
        };
      },
    },

    {
      id: "hex_tunnel",
      name: "HEX CONDUIT",
      category: "Waveforms",
      icon: "🛑",
      camera: { x: 0, y: 0, z: 18, targetY: 0 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 0, 0);

        const ringCount = 20;
        const rings = [];
        const hexGeom = new THREE.RingGeometry(8, 8.4, 6);

        for (let i = 0; i < ringCount; i++) {
          const mat = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? theme.primary : theme.secondary,
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(hexGeom, mat);
          mesh.position.z = -i * 5 + 10;
          group.add(mesh);
          rings.push(mesh);
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            rings.forEach((r, idx) => {
              r.position.z += delta * (isPlaying ? 24 + bass * 10 : 8);
              if (r.position.z > 20) r.position.z = -80;
              r.rotation.z += delta * (idx % 2 === 0 ? 0.3 : -0.3);
            });
          },
          recolor(t) {
            rings.forEach((r, i) => r.material.color.setHex(i % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "vumeter_3d",
      name: "3D VU TOWERS",
      category: "Waveforms",
      icon: "📶",
      camera: { x: 0, y: 16, z: 36, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 0, 0);

        const towers = [];
        const stepCount = 10;
        const sGeom = new THREE.BoxGeometry(4.0, 0.8, 1.5);

        for (let ch = 0; ch < 2; ch++) {
          const chSteps = [];
          for (let s = 0; s < stepCount; s++) {
            const mat = new THREE.MeshStandardMaterial({
              color: 0x05070a,
              emissive: s > 7 ? theme.primary : theme.secondary,
              emissiveIntensity: 0.3,
            });
            const mesh = new THREE.Mesh(sGeom, mat);
            mesh.position.set((ch - 0.5) * 10, s * 1.4 + 1, 0);
            group.add(mesh);
            chSteps.push(mesh);
          }
          towers.push(chSteps);
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            towers.forEach((chSteps, ch) => {
              const level = isPlaying ? Math.floor(Math.abs(Math.sin(beat * 3 + ch)) * 10) : 1;
              chSteps.forEach((step, s) => {
                step.material.emissiveIntensity = s <= level ? 0.9 : 0.15;
              });
            });
          },
          recolor(t) {
            towers.forEach((chSteps) => {
              chSteps.forEach((step, s) => step.material.emissive.setHex(s > 7 ? t.primary : t.secondary));
            });
          },
        };
      },
    },

    {
      id: "audio_sphere",
      name: "SPECTRUM GLOBE",
      category: "Waveforms",
      icon: "🔮",
      camera: { x: 0, y: 16, z: 34, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        const sGeom = new THREE.SphereGeometry(6.5, 32, 32);
        const sMat = new THREE.MeshStandardMaterial({
          color: 0x060812,
          roughness: 0.2,
          metalness: 0.9,
          emissive: theme.primary,
          emissiveIntensity: 0.45,
          wireframe: true,
        });
        const sphere = new THREE.Mesh(sGeom, sMat);
        group.add(sphere);

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            sphere.rotation.y += delta * 0.4;
            sphere.rotation.x += delta * 0.25;
            const scale = 1.0 + (isPlaying ? Math.sin(beat * 2) * 0.2 + bass * 0.2 : 0);
            sphere.scale.set(scale, scale, scale);
            sMat.emissiveIntensity = isPlaying ? 0.6 + bass * 0.4 : 0.25;
          },
          recolor(t) {
            sMat.emissive.setHex(t.primary);
          },
        };
      },
    },

    // ══════════════════════════════════════════════════════════════════
    // CATEGORY 5: QUANTUM PHYSICS & ENERGY
    // ══════════════════════════════════════════════════════════════════
    {
      id: "atom_core",
      name: "BOHR ATOM",
      category: "Quantum",
      icon: "⚛️",
      camera: { x: 0, y: 16, z: 34, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        // Nucleus
        const nucGeom = new THREE.SphereGeometry(2.8, 16, 16);
        const nucMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: theme.primary,
          emissiveIntensity: 0.8,
        });
        const nuc = new THREE.Mesh(nucGeom, nucMat);
        group.add(nuc);

        // 3 Electron orbits
        const orbits = [];
        const ringGeom = new THREE.TorusGeometry(8.5, 0.12, 6, 36);
        for (let i = 0; i < 3; i++) {
          const rMat = new THREE.MeshBasicMaterial({ color: theme.secondary });
          const ring = new THREE.Mesh(ringGeom, rMat);
          ring.rotation.x = (i * Math.PI) / 3;
          ring.rotation.y = (i * Math.PI) / 4;
          group.add(ring);
          orbits.push(ring);
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            nuc.rotation.y += delta * 1.5;
            const nScale = 1.0 + (isPlaying ? Math.sin(beat * 2) * 0.2 : 0);
            nuc.scale.set(nScale, nScale, nScale);
            orbits.forEach((orb, i) => {
              orb.rotation.z += delta * (i + 1) * (isPlaying ? 1.5 : 0.5);
            });
            group.rotation.y += delta * 0.1;
          },
          recolor(t) {
            nucMat.emissive.setHex(t.primary);
            orbits.forEach((orb) => orb.material.color.setHex(t.secondary));
          },
        };
      },
    },

    {
      id: "tesla_coil",
      name: "TESLA PLASMA",
      category: "Quantum",
      icon: "⚡",
      camera: { x: 0, y: 16, z: 34, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 0, 0);

        // Toroid top
        const torGeom = new THREE.TorusGeometry(4.5, 1.2, 12, 24);
        const torMat = new THREE.MeshStandardMaterial({
          color: 0x05070a,
          emissive: theme.primary,
          emissiveIntensity: 0.7,
        });
        const tor = new THREE.Mesh(torGeom, torMat);
        tor.rotation.x = Math.PI / 2;
        tor.position.y = 12;
        group.add(tor);

        // Tower
        const tGeom = new THREE.CylinderGeometry(1.2, 2.5, 12, 12);
        tGeom.translate(0, 6, 0);
        const tMesh = new THREE.Mesh(tGeom, new THREE.MeshStandardMaterial({ color: 0x070912, roughness: 0.3, metalness: 0.9 }));
        group.add(tMesh);

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            tor.rotation.z += delta * (isPlaying ? 2.0 : 0.5);
            torMat.emissiveIntensity = isPlaying ? 0.6 + Math.sin(beat * 4) * 0.4 + bass * 0.3 : 0.3;
            group.rotation.y += delta * 0.1;
          },
          recolor(t) {
            torMat.emissive.setHex(t.primary);
          },
        };
      },
    },

    {
      id: "dna_helix",
      name: "DNA HELIX",
      category: "Quantum",
      icon: "🧬",
      camera: { x: 0, y: 16, z: 34, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 0, 0);

        const rungs = [];
        const rungCount = 28;
        const bGeom = new THREE.BoxGeometry(6.0, 0.3, 0.3);
        const sphereGeom = new THREE.SphereGeometry(0.4, 8, 8);

        for (let i = 0; i < rungCount; i++) {
          const rGroup = new THREE.Group();
          rGroup.position.y = i * 0.8;
          rGroup.rotation.y = i * 0.3;

          const rMat = new THREE.MeshStandardMaterial({
            color: 0x060810,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.6,
          });
          const bar = new THREE.Mesh(bGeom, rMat);
          rGroup.add(bar);

          const s1 = new THREE.Mesh(sphereGeom, rMat);
          s1.position.x = 3.0;
          rGroup.add(s1);

          const s2 = new THREE.Mesh(sphereGeom, rMat);
          s2.position.x = -3.0;
          rGroup.add(s2);

          group.add(rGroup);
          rungs.push(rGroup);
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            group.rotation.y += delta * (isPlaying ? 1.0 : 0.3);
            rungs.forEach((r, i) => {
              const pulse = 1.0 + (isPlaying ? Math.sin(beat * 2 + i * 0.2) * 0.2 : 0);
              r.scale.set(pulse, 1, pulse);
            });
          },
          recolor(t) {
            rungs.forEach((r, i) => {
              r.children.forEach((c) => c.material.emissive.setHex(i % 2 === 0 ? t.primary : t.secondary));
            });
          },
        };
      },
    },

    {
      id: "particle_beam",
      name: "HADRON COLLIDER",
      category: "Quantum",
      icon: "🔄",
      camera: { x: 0, y: 18, z: 32, targetY: 4 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 4, 0);

        const ringGeom = new THREE.TorusGeometry(14, 0.4, 8, 48);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0x05070a,
          emissive: theme.primary,
          emissiveIntensity: 0.5,
          wireframe: true,
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        // Opposed packets
        const p1 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 8), new THREE.MeshBasicMaterial({ color: theme.secondary }));
        const p2 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 8), new THREE.MeshBasicMaterial({ color: theme.primary }));
        group.add(p1);
        group.add(p2);

        group.visible = false;
        scene.add(group);

        let angle = 0;
        return {
          group,
          animate(delta, isPlaying, bass) {
            angle += delta * (isPlaying ? 6.0 + bass * 4 : 2.0);
            p1.position.set(Math.cos(angle) * 14, 0, Math.sin(angle) * 14);
            p2.position.set(Math.cos(-angle) * 14, 0, Math.sin(-angle) * 14);
          },
          recolor(t) {
            ringMat.emissive.setHex(t.primary);
            p1.material.color.setHex(t.secondary);
            p2.material.color.setHex(t.primary);
          },
        };
      },
    },

    {
      id: "magnetic_dipole",
      name: "MAGNETIC DIPOLE",
      category: "Quantum",
      icon: "🧲",
      camera: { x: 0, y: 16, z: 36, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        const loopCount = 8;
        const loops = [];
        for (let i = 0; i < loopCount; i++) {
          const lGeom = new THREE.TorusGeometry(8.0 + (i % 2) * 2, 0.15, 6, 32);
          const lMat = new THREE.MeshStandardMaterial({
            color: 0x05070a,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.6,
          });
          const lMesh = new THREE.Mesh(lGeom, lMat);
          lMesh.rotation.y = (i / loopCount) * Math.PI;
          group.add(lMesh);
          loops.push(lMesh);
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            group.rotation.y += delta * (isPlaying ? 0.4 : 0.1);
            loops.forEach((l, i) => {
              const scale = 1.0 + (isPlaying ? Math.sin(beat * 2 + i) * 0.15 : 0);
              l.scale.set(scale, scale, scale);
            });
          },
          recolor(t) {
            loops.forEach((l, i) => l.material.emissive.setHex(i % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },

    {
      id: "string_theory",
      name: "CALABI YAU",
      category: "Quantum",
      icon: "🕸️",
      camera: { x: 0, y: 16, z: 34, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        const kGeom = new THREE.TorusKnotGeometry(7, 1.0, 48, 8, 4, 9);
        const kMat = new THREE.MeshStandardMaterial({
          color: 0x05070a,
          emissive: theme.primary,
          emissiveIntensity: 0.6,
          wireframe: true,
        });
        const knot = new THREE.Mesh(kGeom, kMat);
        group.add(knot);

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            knot.rotation.x += delta * 0.4;
            knot.rotation.y += delta * 0.6;
            const scale = 1.0 + (isPlaying ? Math.sin(beat * 2.5) * 0.2 : 0);
            knot.scale.set(scale, scale, scale);
          },
          recolor(t) {
            kMat.emissive.setHex(t.primary);
          },
        };
      },
    },

    {
      id: "antimatter_trap",
      name: "ANTIMATTER TRAP",
      category: "Quantum",
      icon: "🧲",
      camera: { x: 0, y: 16, z: 34, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        // Core plasma orb
        const orbGeom = new THREE.SphereGeometry(3.5, 24, 24);
        const orbMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: theme.primary,
          emissiveIntensity: 0.9,
        });
        const orb = new THREE.Mesh(orbGeom, orbMat);
        group.add(orb);

        // Electrodes
        const elecGeom = new THREE.CylinderGeometry(1.2, 1.2, 4, 8);
        const elecs = [];
        for (let i = 0; i < 4; i++) {
          const eMesh = new THREE.Mesh(elecGeom, new THREE.MeshStandardMaterial({ color: 0x070912, metalness: 0.9 }));
          const angle = (i / 4) * Math.PI * 2;
          eMesh.position.set(Math.cos(angle) * 8, 0, Math.sin(angle) * 8);
          eMesh.rotation.z = Math.PI / 2;
          eMesh.rotation.y = -angle;
          group.add(eMesh);
          elecs.push(eMesh);
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            orb.rotation.y += delta * 2;
            const scale = 1.0 + (isPlaying ? Math.sin(beat * 3) * 0.25 + bass * 0.2 : 0);
            orb.scale.set(scale, scale, scale);
            group.rotation.y += delta * 0.15;
          },
          recolor(t) {
            orbMat.emissive.setHex(t.primary);
          },
        };
      },
    },

    {
      id: "chrono_dial",
      name: "CHRONO ENGINE",
      category: "Quantum",
      icon: "⏱️",
      camera: { x: 0, y: 16, z: 34, targetY: 8 },
      init(scene, theme) {
        const group = new THREE.Group();
        group.position.set(0, 8, 0);

        const gears = [];
        for (let i = 0; i < 3; i++) {
          const gGeom = new THREE.TorusGeometry(5 + i * 3, 0.3, 6, 24);
          const gMat = new THREE.MeshStandardMaterial({
            color: 0x05070a,
            emissive: i % 2 === 0 ? theme.primary : theme.secondary,
            emissiveIntensity: 0.6,
          });
          const gMesh = new THREE.Mesh(gGeom, gMat);
          group.add(gMesh);
          gears.push({ mesh: gMesh, speed: (i + 1) * 0.3 * (i % 2 === 0 ? 1 : -1) });
        }

        group.visible = false;
        scene.add(group);

        return {
          group,
          animate(delta, isPlaying, bass, beat) {
            gears.forEach((g) => {
              g.mesh.rotation.z += delta * g.speed * (isPlaying ? 2.0 : 0.5);
            });
            group.rotation.y += delta * 0.1;
          },
          recolor(t) {
            gears.forEach((g, i) => g.mesh.material.emissive.setHex(i % 2 === 0 ? t.primary : t.secondary));
          },
        };
      },
    },
  ];

  window.MODES_EXTRA = MODES_EXTRA;
})();

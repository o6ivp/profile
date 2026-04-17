use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct ParticleSystem {
    positions: Vec<f32>,
    velocities: Vec<f32>,
    count: usize,
    bounds_x: f32,
    bounds_y: f32,
    bounds_z: f32,
    time: f32,
}

#[wasm_bindgen]
impl ParticleSystem {
    #[wasm_bindgen(constructor)]
    pub fn new(count: usize, bounds_x: f32, bounds_y: f32, bounds_z: f32) -> ParticleSystem {
        let mut positions = vec![0.0f32; count * 3];
        let mut velocities = vec![0.0f32; count * 3];

        let mut seed: u32 = 12345;
        let rng = |s: &mut u32| -> f32 {
            *s = s.wrapping_mul(1103515245).wrapping_add(12345);
            ((*s >> 16) as f32 / 32768.0) - 1.0
        };

        for i in 0..count {
            positions[i * 3] = rng(&mut seed) * bounds_x * 0.8;
            positions[i * 3 + 1] = rng(&mut seed) * bounds_y * 0.7;
            positions[i * 3 + 2] = rng(&mut seed) * bounds_z * 0.8;

            let speed = 0.15 + rng(&mut seed).abs() * 0.25;
            let angle = rng(&mut seed) * std::f32::consts::PI;
            velocities[i * 3] = angle.cos() * speed;
            velocities[i * 3 + 1] = rng(&mut seed) * 0.05;
            velocities[i * 3 + 2] = angle.sin() * speed;
        }

        ParticleSystem {
            positions,
            velocities,
            count,
            bounds_x,
            bounds_y,
            bounds_z,
            time: 0.0,
        }
    }

    pub fn tick(&mut self, dt: f32, attractor_x: f32, attractor_y: f32, attractor_z: f32) {
        let dt = dt.min(0.05);
        self.time += dt;

        let bx = self.bounds_x;
        let by = self.bounds_y;
        let bz = self.bounds_z;
        let has_attractor = attractor_x.abs() > 0.01 || attractor_y.abs() > 0.01;

        for i in 0..self.count {
            let idx = i * 3;
            let px = self.positions[idx];
            let py = self.positions[idx + 1];
            let pz = self.positions[idx + 2];
            let mut vx = self.velocities[idx];
            let mut vy = self.velocities[idx + 1];
            let mut vz = self.velocities[idx + 2];

            // --- Attractor: gentle, per-fish curiosity ---
            if has_attractor {
                let dx = attractor_x - px;
                let dy = attractor_y - py;
                let dz = attractor_z - pz;
                let dist = (dx * dx + dy * dy + dz * dz).sqrt().max(0.4);
                // Each fish has a different curiosity level
                let curiosity = 0.08 + ((i as f32) * 0.37).sin().abs() * 0.12;
                let attract = curiosity / (dist * dist);
                vx += dx / dist * attract * dt;
                vy += dy / dist * attract * dt;
                vz += dz / dist * attract * dt;
            }

            // --- Gentle wandering (sine-based per fish) ---
            let phase = (i as f32) * 0.73 + self.time * 0.6;
            vx += phase.sin() * 0.1 * dt;
            vy += (phase * 1.3).cos() * 0.05 * dt;
            vz += (phase * 0.7).sin() * 0.1 * dt;

            // --- Buoyancy: very slight upward drift ---
            vy += 0.01 * dt;

            // --- Speed limits ---
            let speed = (vx * vx + vy * vy + vz * vz).sqrt();
            let min_speed = 0.06;
            let max_speed = 0.45;

            if speed > max_speed {
                let s = max_speed / speed;
                vx *= s;
                vy *= s;
                vz *= s;
            } else if speed < min_speed && speed > 0.001 {
                let s = min_speed / speed;
                vx *= s;
                vy *= s;
                vz *= s;
            }

            // --- Damping (water resistance) ---
            vx *= 0.992;
            vy *= 0.988;
            vz *= 0.992;

            // --- Update position ---
            self.positions[idx] = px + vx * dt;
            self.positions[idx + 1] = py + vy * dt;
            self.positions[idx + 2] = pz + vz * dt;

            // --- Soft wall avoidance (steer away before hitting) ---
            let margin_x = bx * 0.25;
            let margin_y = by * 0.30;
            let margin_z = bz * 0.25;
            let turn_force = 2.5;

            let p0 = self.positions[idx];
            if p0 > bx - margin_x {
                vx -= turn_force * dt * ((p0 - (bx - margin_x)) / margin_x);
            } else if p0 < -bx + margin_x {
                vx += turn_force * dt * ((-bx + margin_x - p0) / margin_x);
            }

            let p1 = self.positions[idx + 1];
            if p1 > by - margin_y {
                vy -= turn_force * dt * ((p1 - (by - margin_y)) / margin_y);
            } else if p1 < -by + margin_y {
                vy += turn_force * 1.5 * dt * ((-by + margin_y - p1) / margin_y);
            }

            let p2 = self.positions[idx + 2];
            if p2 > bz - margin_z {
                vz -= turn_force * dt * ((p2 - (bz - margin_z)) / margin_z);
            } else if p2 < -bz + margin_z {
                vz += turn_force * dt * ((-bz + margin_z - p2) / margin_z);
            }

            self.velocities[idx] = vx;
            self.velocities[idx + 1] = vy;
            self.velocities[idx + 2] = vz;
        }

        // --- Schooling: separation (strong, all pairs) + alignment ---
        // O(n^2) over all fish — fine for n<=200.
        let sep_radius: f32 = 0.48;
        let sep_radius_sq = sep_radius * sep_radius;
        let align_radius_sq: f32 = 1.0;

        for i in 0..self.count {
            let idx_i = i * 3;
            let xi = self.positions[idx_i];
            let yi = self.positions[idx_i + 1];
            let zi = self.positions[idx_i + 2];

            let mut avg_vx = 0.0f32;
            let mut avg_vy = 0.0f32;
            let mut avg_vz = 0.0f32;
            let mut neighbors = 0u32;

            let mut push_x = 0.0f32;
            let mut push_y = 0.0f32;
            let mut push_z = 0.0f32;

            for j in 0..self.count {
                if i == j { continue; }
                let idx_j = j * 3;
                let dx = xi - self.positions[idx_j];
                let dy = yi - self.positions[idx_j + 1];
                let dz = zi - self.positions[idx_j + 2];
                let d2 = dx * dx + dy * dy + dz * dz;

                // Separation: quadratic ramp so close neighbors push hard
                if d2 < sep_radius_sq && d2 > 0.0001 {
                    let d = d2.sqrt();
                    let k = (sep_radius - d) / sep_radius; // 0..1 (1 = touching)
                    let force = k * k * 3.2;
                    let inv_d = 1.0 / d;
                    push_x += dx * inv_d * force;
                    push_y += dy * inv_d * force;
                    push_z += dz * inv_d * force;
                }

                if d2 < align_radius_sq {
                    avg_vx += self.velocities[idx_j];
                    avg_vy += self.velocities[idx_j + 1];
                    avg_vz += self.velocities[idx_j + 2];
                    neighbors += 1;
                }
            }

            self.velocities[idx_i] += push_x * dt;
            self.velocities[idx_i + 1] += push_y * dt;
            self.velocities[idx_i + 2] += push_z * dt;

            if neighbors > 0 {
                let n = neighbors as f32;
                let align_strength = 0.45 * dt;
                self.velocities[idx_i] += (avg_vx / n - self.velocities[idx_i]) * align_strength;
                self.velocities[idx_i + 1] += (avg_vy / n - self.velocities[idx_i + 1]) * align_strength;
                self.velocities[idx_i + 2] += (avg_vz / n - self.velocities[idx_i + 2]) * align_strength;
            }
        }

        // --- Hard boundary clamp: no fish escapes the tank ---
        let fish_r: f32 = 0.12;
        let floor_r: f32 = 0.18; // extra clearance above floor
        for i in 0..self.count {
            let idx = i * 3;
            // X
            let lim_x = bx - fish_r;
            if self.positions[idx] > lim_x {
                self.positions[idx] = lim_x;
                self.velocities[idx] *= -0.25;
            } else if self.positions[idx] < -lim_x {
                self.positions[idx] = -lim_x;
                self.velocities[idx] *= -0.25;
            }
            // Y — floor gets extra margin so fish don't clip the ground
            let ceil = by - fish_r;
            let floor = -by + floor_r;
            if self.positions[idx + 1] > ceil {
                self.positions[idx + 1] = ceil;
                self.velocities[idx + 1] *= -0.25;
            } else if self.positions[idx + 1] < floor {
                self.positions[idx + 1] = floor;
                self.velocities[idx + 1] = self.velocities[idx + 1].abs() * 0.2;
            }
            // Z
            let lim_z = bz - fish_r;
            if self.positions[idx + 2] > lim_z {
                self.positions[idx + 2] = lim_z;
                self.velocities[idx + 2] *= -0.25;
            } else if self.positions[idx + 2] < -lim_z {
                self.positions[idx + 2] = -lim_z;
                self.velocities[idx + 2] *= -0.25;
            }
        }
    }

    pub fn positions_ptr(&self) -> *const f32 {
        self.positions.as_ptr()
    }

    pub fn velocities_ptr(&self) -> *const f32 {
        self.velocities.as_ptr()
    }

    pub fn count(&self) -> usize {
        self.count
    }

    pub fn reset(&mut self) {
        let mut seed: u32 = 54321;
        for i in 0..self.count {
            seed = seed.wrapping_mul(1103515245).wrapping_add(12345);
            let rx = ((seed >> 16) as f32 / 32768.0) - 1.0;
            seed = seed.wrapping_mul(1103515245).wrapping_add(12345);
            let ry = ((seed >> 16) as f32 / 32768.0) - 1.0;
            seed = seed.wrapping_mul(1103515245).wrapping_add(12345);
            let rz = ((seed >> 16) as f32 / 32768.0) - 1.0;

            self.positions[i * 3] = rx * self.bounds_x * 0.6;
            self.positions[i * 3 + 1] = ry * self.bounds_y * 0.6;
            self.positions[i * 3 + 2] = rz * self.bounds_z * 0.6;

            let speed = 0.2;
            seed = seed.wrapping_mul(1103515245).wrapping_add(12345);
            let angle = ((seed >> 16) as f32 / 32768.0) * std::f32::consts::PI * 2.0;
            self.velocities[i * 3] = angle.cos() * speed;
            self.velocities[i * 3 + 1] = 0.0;
            self.velocities[i * 3 + 2] = angle.sin() * speed;
        }
    }
}

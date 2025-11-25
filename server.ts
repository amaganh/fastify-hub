import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import fs from 'fs';
import path from 'path';
import cluster from 'node:cluster';
import os from 'node:os';
import dotenv from 'dotenv';
// NOTE: No imports from specific projects here. Complete isolation.

dotenv.config();
// RPi 3 has 4 cores. We will use them all.
// Warning: Each worker consumes its own RAM (approx 30-50MB idle).
// If you run out of RAM, change this to: const numCPUs = 2;
const totalCPUs = os.cpus().length;
const configuredWorkers = Number(process.env.FASTIFY_CLUSTER_WORKERS) || 0;
const numCPUs = (configuredWorkers > 0) ? configuredWorkers : totalCPUs;

// --- MAIN LOGIC ---
if (cluster.isPrimary) {
  // =========================================
  // PRIMARY PROCESS (MASTER)
  // =========================================
  console.log(`[Cluster] 🧠 Master process is running (PID: ${process.pid})`);
  console.log(`[Cluster] 🚀 Forking ${numCPUs} workers for maximum performance...`);

  // Fork workers (Create a copy of this program for each core)
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Resilience: If a worker dies (crash), create a new one automatically
  cluster.on('exit', (worker, code, signal) => {
    console.warn(`[Cluster] 💀 Worker ${worker.process.pid} died. Starting a new one...`);
    cluster.fork();
  });

} else {
  // =========================================
  // WORKER PROCESS (APP INSTANCE)
  // =========================================
  // This code runs inside EACH worker (4 times in total on RPi 3)

  const startWorker = async () => {
    const server: FastifyInstance = Fastify({
      logger: {
        level: 'error'
      }
    });
    server.register(cors, { origin: true });
    // Global JWT Register   (Accesible in all projects)
    server.register(jwt, {
      secret: process.env.JWT_SECRET || 'fallback_secret_dev'
    });

    try {
      const projectsBaseFolder = path.join(__dirname, 'projects');

      if (fs.existsSync(projectsBaseFolder)) {
        const projectFolders = fs.readdirSync(projectsBaseFolder);

        // --- PHASE 1: PROJECT INITIALIZATION ---
        for (const projectName of projectFolders) {
          const startupFile = path.join(projectsBaseFolder, projectName, 'startup.ts');

          if (fs.existsSync(startupFile)) {
            try {
              const module = await import(startupFile);
              if (module.default && typeof module.default === 'function') {
                // Execute startup script
                await module.default(server);
              }
            } catch (error) {
              console.error(`[Init] ❌ Error initializing project ${projectName}:`, error);
            }
          }
        }

        // --- PHASE 2: DYNAMIC ROUTE LOADING ---
        for (const projectName of projectFolders) {
          const projectRoutesFolder = path.join(projectsBaseFolder, projectName, 'routes');
          if (projectName !== 'template' && fs.existsSync(projectRoutesFolder) && fs.lstatSync(projectRoutesFolder).isDirectory()) {
            const routeFiles = fs.readdirSync(projectRoutesFolder);
            for (const file of routeFiles) {
              if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
                const fileName = file.replace('.ts', '');
                let routePrefix = `/${projectName}/${fileName}`;
                if (fileName === 'index') routePrefix = `/${projectName}`;

                const filePath = path.join(projectRoutesFolder, file);
                const routeModule = await import(filePath);

                server.register(routeModule.default, { prefix: routePrefix });
                // Minimal log per worker to avoid console spam
                // console.log(`[Worker ${process.pid}] Loaded: ${routePrefix}`); 
              }
            }
          }
        }
      }

      // --- SERVER START ---
      // All workers share port 3000! The OS balances the load.
      await server.listen({ port: 3000, host: '0.0.0.0' });
      console.log(`[Cluster] 👷 Worker ${process.pid} started & listening on port 3000`);

    } catch (err) {
      server.log.error(err);
      process.exit(1);
    }
  };

  startWorker();
}
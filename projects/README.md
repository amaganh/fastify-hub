# Fastify Modular Hub - Documentation

## 1. Overview
This Hub is designed as a lightweight, high-performance API Gateway running on **Fastify** with **Node.js Clustering**. It is optimized for hardware with limited resources (like a Raspberry Pi 3) by leveraging multi-core processing.

The architecture is **modular**: logic is separated into isolated "Projects" located in the `projects/` directory. The server automatically discovers, initializes, and routes traffic to these projects without modifying the main `server.ts`.

---

## 2. Directory Structure

The file system dictates the URL structure.

```text
/root
├── server.ts             # Main Entry Point (Do not modify for new projects)
├── package.json          # Global dependencies
├── .env                  # Global secrets (DB URLs, JWT Secret)
└── projects/             # Project Container
    ├── README.md         # This file
    ├── template/         # Boilerplate for new projects
    │
    ├── sso/              # Example Project: SSO
    │   ├── startup.ts    # Init script (DB connection)
    │   ├── utils/        # Helpers & DB Connection Logic
    │   ├── models/       # Mongoose Models
    │   └── routes/       # Endpoints
    │       └── auth.ts   # URL: /sso/auth
    │
    └── game/             # Example Project: Game
        ├── startup.ts
        └── routes/
            ├── index.ts  # URL: /game
            └── games.ts  # URL: /game/games
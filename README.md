# Fastify Modular Hub

## Description
Fastify Modular Hub is a high-performance API gateway designed for environments with limited resources, such as a Raspberry Pi 3. It leverages **Fastify** and **Node.js Clustering** to maximize CPU core utilization, offering a modular and scalable architecture.

## Key Features
- **Clustering**: Utilizes all available CPU cores to maximize performance.
- **Modularity**: Projects are isolated in the `projects/` folder, allowing new functionalities to be added without modifying the main `server.ts` file.
- **Dynamic Loading**: Automatically discovers and loads projects and their routes.
- **Optimization**: Designed for hardware with limited resources.

## Project Structure
```plaintext
/root
├── server.ts             # Main entry point
├── package.json          # Global dependencies
├── .env                  # Global environment variables
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Docker image configuration
└── projects/             # Project container
    ├── README.md         # Project documentation
    ├── template/         # Template for new projects
    ├── sso/              # Example project: SSO
    └── game/             # Example project: Game
```

## Requirements
- **Node.js**: Version 18 or higher.
- **Docker**: For deployment and containerized execution.

## Installation and Execution
1. Clone the repository:
   ```bash
   git clone <REPOSITORY_URL>
   cd fastify-hub
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in the `.env` file.
4. Run the project:
   - Development mode:
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm start
     ```

## Using Docker
1. Build the Docker image:
   ```bash
   docker-compose build
   ```
2. Start the container:
   ```bash
   docker-compose up
   ```

## License
This project is licensed under the MIT License.
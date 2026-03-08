# Trade App - BFF (Backend for Frontend) Architecture

## Overview

This project uses a **Backend for Frontend (BFF)** pattern where the BFF service acts as an intermediary layer between the frontend application and the backend microservices.

## Architecture

```
Frontend (React/Vite) (Port 5173)
        ↓
    BFF Service (Port 3000)
   ↙           ↘
Market Data    Realtime Service
Service        (Port 3002)
(Port 3001)
```

## Running the Services


### Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose up --build

# Stop services
docker-compose down
```

### Local Development
```bash
# Start each service in separate terminals

install and run all from root folder

npm i (install root)

// install all services (1 FE , 3 BE)
npm install:all

to run : npm run start:all
```

Visit: http://localhost:5173

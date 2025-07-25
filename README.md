# Node.js PostgreSQL Application (RDS Example)

This project showcases a Node.js application designed to connect with a PostgreSQL database. It's structured to be easily deployed using Docker and Docker Compose, leveraging a custom PostgreSQL Docker image.

## Table of Contents
- [About](#about)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running Locally](#running-locally)
  - [Running with Docker Compose](#running-with-docker-compose)
- [Docker Image](#docker-image)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## About
This is a demonstration project for a Node.js application that interacts with a PostgreSQL database. It's built with containerization in mind, providing a clear example of how to set up a development environment using Docker and Docker Compose, including a custom PostgreSQL image.

## Features
-   Connects to a PostgreSQL database.
-   Containerized application using `Dockerfile`.
-   Uses `mrbaka/postgres:latest` for the database service.
-   Configurable via environment variables.

## Getting Started

Follow these steps to get your development environment up and running.

### Prerequisites
Before you begin, ensure you have the following installed on your system:
-   **Node.js** (LTS recommended): [nodejs.org](https://nodejs.org/)
-   **npm** (comes with Node.js)
-   **Docker Desktop** (includes Docker Engine and Docker Compose): [docker.com/get-started](https://www.docker.com/get-started)

### Installation

1.  **Navigate to the project directory:**
    Assuming you are in the directory containing the `rds` folder:
    ```bash
    cd rds
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

## Project Structure
```
rds/
├── .gitignore                  # Specifies intentionally untracked files to ignore
├── Dockerfile                  # Dockerfile for building the Node.js application image
├── package.json                # Defines Node.js project metadata and dependencies
├── package-lock.json           # Locks dependency versions for consistent builds
├── server.js                   # The main application server logic
├── node_modules/               # Directory for Node.js installed modules (ignored by Git)
├── public/                     # Potentially for static assets or client-side code
└── README.md                   # This README file
```

### Configuration

The application expects certain environment variables for database connection. Create a `.env` file in the root of the `rds` directory (the same level as `package.json`) with the following content:

```
DB_HOST=host
DB_USER=user
DB_PASSWORD=password
DB_NAME=mydatabase
```

### Running Locally

To run the Node.js application directly on your machine (requires a local PostgreSQL instance or manual connection setup):

```bash
node server.js
```


## Docker Image

This project specifically utilizes the `mrbaka/postgres:latest` Docker image for its PostgreSQL database service. This image simplifies the setup of the database backend, providing a consistent environment for development and deployment.

You can run the PostgreSQL database directly using `docker run` with the following command:

```bash
docker run --name some-postgres -p 3000:3000 -e DB_HOST=host -e DB_USER=user -e DB_PASSWORD=password -e DB_NAME=mydatabase -d mrbaka/postgres:latest
```
This command will:
-   Start a new container named `some-postgres`.
-   Map port `3000` on your host to port `3000` inside the container.
-   Set the `DB_HOST` environment variable to `host`.
-   Set the `DB_USER` environment variable to `user`.
-   Set the `DB_PASSWORD` environment variable to `password`.
-   Set the `DB_NAME` environment variable to `mydatabase`.
-   Run the container in detached mode (`-d`).


    The application should now be running and accessible typically at `http://localhost:3000` (or the port you configured). The database will be running in a separate container, managed by Docker.

    After the services are up, you can:
    -   Access the application's UI in your web browser at `http://localhost:3000`. You can then interact with the application by adding details or performing operations.
    -   To view the real-time logs of your application container, use:
        ```bash
        docker ps
        ```

    - copy your container id

        ```bash
        docker logs -f <container-id>
        ```
        This command will stream the logs, allowing you to see database interactions or any other output from your Node.js application.

Thankyou...

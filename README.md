# Intergalactic Federation API

An API to manage the intergalactic fleet.

## TL;DR 

Make sure you have these installed:

- Docker
- Node
- OpenSSL

### Installation 

```sh
git clone https://github.com/henriqueinonhe/intergalactic-federation-api
cd intergalactic-federation-api
cd api && npm ci
```

### Configuration

Configure environment variables.

- Copy `./api/.env-sample` contents to `./api/.env`.
- Copy `./db/.env-sample` contents to `./db/.env`.

Generate TLS certificate:

Inside `api`:

```sh
mkdir certs && cd certs
openssl req -nodes -new -x509 -keyout server.key -out server.cert
```

### Running

Make sure ports 3001 and 3306 are available.

```sh
docker-compose up
```

Then run migrations and seeder:

```sh
docker exec -ti intergalactic_federation_api sh
```

```sh
#Inside container
npx typeorm migration:run
node ./scripts/seedDb.js
```

Reset service:
```sh
docker restart intergalactic_federation_api
```

API -> `https://localhost:3001`
DB -> `localhost:3306`

## Table of Contents
- [1 Stack](#1-stack)
  * [1.1 API](#11-api)
  * [1.2 DB](#12-db)
- [2 Pre Requisites](#2-pre-requisites)
- [3 Installation](#3-installation)
  * [3.1 Rationale](#31-rationale)
- [4 Configuration](#4-configuration)
  * [4.1 Environment Variables](#41-environment-variables)
    + [4.1.1 API](#411-api)
    + [4.1.2 DB](#412-db)
  * [4.2 SSL/TLS Certificate](#42-ssltls-certificate)
  * [4.3 Migrations and Seeder](#43-migrations-and-seeder)
- [5 Running](#5-running)
- [6 Linting](#6-linting)
- [7 Testing](#7-testing)
- [8 Documentation](#8-documentation)
- [9 Troubleshooting](#9-troubleshooting)


## 1 Stack

### 1.1 API

- Runtime: [Node](https://nodejs.org/en/)
- Language: [Typescript](https://www.typescriptlang.org/)
- Framework: [Express](https://expressjs.com/)
- ORM: [TypeORM](https://typeorm.io/#/)
- Linter: [ESLint](https://eslint.org)
- Testing: [Jest](https://jestjs.io/)

### 1.2 DB

- Database: [MySQL](https://www.mysql.com/)

## 2 Pre Requisites

- [Docker](https://www.docker.com/)
- [OpenSSL](https://www.openssl.org/) (optional, to enable HTTPS locally)
- [Node/NPM](https://nodejs.org/en/) (optional, but necessary for development)

## 3 Installation

Clone the project:

```sh
git clone https://github.com/henriqueinonhe/intergalactic-federation-api
```

As this projects uses Docker, most things will pretty much be set up automatically by `docker-compose`, but if you're going to setup a local development environment there's a few things that need to be done.

**TL;DR**

From inside the project's root directory, run:

```sh
cd api && npm ci
```
### Rationale

To make it possible for changes in code be reflected in the application without having to rebuild the containers images, the `api` directory is bind mounted within his containers.

However, this also means that dependencies (`node_modules` in this case) are mounted as well, which is not a good thing given that the host and the containers may run using different OSes/environments.

So to solve this issue, there's a normal volume that is mounted within the container that shadows `node_modules`, so the container still has access to the code located in your machine but also uses the depencies that the container itself has installed.

The downside is that each time you install a dependency you must do it twice, once inside the container (use `docker exec -ti <container-name> sh` to access it) and then once again in your machine (mostly to enable your code editor's Intellisense and make it stop complaining about missing dependencies).

## 4 Configuration


### 4.1 Environment Variables

You'll need to configure each service's environment variables.

To do so, create a `.env` file in each service folder (`api`, `db`).

For development purposes you may copy the content from `.env-sample` (present in each service folder) to the `.env` file, as it contains useful defaults that enables you to "just run it" using the provided `docker-compose.yaml`.

Nevertheless, should you need to tweak them, here's their documentation:

#### 4.1.1 API

- **PORT** - Port used by the server (if you're running the API inside a container don't forget that this refers to the port **inside** the container, not the one you're going to use to access the API).
- **USE_HTTPS** - Whether the server will run with https (in which case you'll need to generate the certificates)
- **TYPEORM_CONNECTION** - MUST BE SET TO `"mysql"`.
- **TYPEORM_HOST** -  Database URI.
- **TYPEORM_USERNAME** -  Username used to access DB.
- **TYPEORM_PASSWORD** -  Password used to access DB.
- **TYPEORM_DATABASE** -  Self explanatory.
- **TYPEORM_PORT** -  Database port.
- **TYPEORM_SYNCHRONIZE** -  MUST BE SET TO `"false"`
- **TYPEORM_LOGGING** -  Whether queries issued to the DB will be logged on the console.
- **TYPEORM_ENTITIES** -  MUST BE SET TO `"dist/entities/**/*.js"`
- **TYPEORM_MIGRATIONS** -  MUST BE SET TO `"dist/migrations/**/*.js"`
- **TYPEORM_MIGRATIONS_DIR** -  MUST BE SET TO `"src/migrations"`
- **TYPEORM_MIGRATIONS_TABLE_NAME** -  MUST BE SET TO `"Migrations"`

#### 4.1.2 DB

- **MYSQL_USER** - DB user.
- **MYSQL_PASSWORD** - DB password.
- **MYSQL_ROOT_PASSWORD** - DB root user password.
- **MYSQL_DATABASE** Self explanatory.

### 4.2 SSL/TLS Certificate

To serve the API using HTTPS instead of plain HTTP, you'll need to generate a self signed certificate, which is very simple using OpenSSL:

From inside `api` directory, run:

```sh
mkdir certs && cd certs
openssl req -nodes -new -x509 -keyout server.key -out server.cert
```

You will be prompted to answer a some questions, but you can just leave them blank/use the provided defaults if you wish.

And *voila*, you're all set.

P.S. As the certificate is self-signed, you'll probably need to access the API via browser first (`/` path leads to the API documentation), before consuming it via the frontend.

### 4.3 Migrations And Seeder

**After** running the application the first thing you'll need to do is to run the migrations to setup the DB tables.

The easiest way to do this, is to run the migrations from inside the API container:

```sh
docker exec -ti intergalactic_federation_api sh

#Now inside the container
npx typeorm migration:run
node ./scripts/seedDb.js
```

Then restart the container so TypeORM can pickup entities metadata.

```sh
docker restart intergalactic_federation_api
```

You may also run them from outside the container, you just need to compile the code and change `TYPEORM_HOST` environment variable so that it points to the DB from outside the container:

```sh
#Compile
npx tsc -p .

#Run migrations
npx typeorm migration:run
node ./scripts/seedDb.js
```

## 5 Running

If you used the configurations present in `.env-sample` for each service, you should be able run the application with:

```sh
docker-compose up
```

This will build the images, create an isolated network for the services, set up volumes and spin up the containers.

Containers default names and ports are:

- API - intergalactic_federation_api - 3001
- DB - intergalactic_federation_db - 3306

Make sure these ports are available, or change them to the ones you want in `docker-compose.yaml` and don't forget to also change environment variables accordingly.

To access a container via command line (useful for installing/removing dependencies, running migrations, debugging):

```sh
docker exec -ti <container-name> sh
```

**DON'T FORGET TO RUN [MIGRATIONS](#43-migrations-and-seeder)!**

## 6 Linting

To run the linter (either inside or outside the container):
```sh
npx eslint .
```

## 7 Testing

There are a few unit tests, several integrations tests and one fairily long E2E test

In order to run them you need to access the API container and then run jest:

```sh
docker exec -ti intergalactic_federation_api
npm run test
```
## 8 Documentation 

API is documented using Swagger UI and is accessible at the root path `/`.

## 9 Troubleshooting

### Required tables doesn't exist
```
QueryFailedError: Table '<DB_NAME>.IntergalacticFederation doesn't exist
```

Did you run the [migrations](#43-migrations-and-seeder)?


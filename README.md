## Description

A Simple Bank API 

## Requirements

- Node JS v18+
- Docker

## Environment variables

Create your personal `.env` file using the `.env.example` file as a guide.

## Dependencies

The program currently relies on the following dependencies

- Postgres
- Redis

Both Postgres and Redis are provisioned in the `docker-compose.yml` file at the root directory.
The postgres container exposes port `15432` instead of the defualt `5432`. This is to prevent clashes with any postgres instance that may be running on your machine.

## Installation

```bash
$ npm install
```

## Migrations and Seeds

This project uses Typeorm.

- #### Migrations:

  Typeorm allows you to generate a migration file based on the latest changes made to the entities in the project. Run the following command to generate a new migration:

  ```bash
  $ npm run migration:generate "src/database/migrations/NameFoYourNewMigration" 
  ```

  Replace `NameFoYourNewMigration` in the above command with a suitable name for your migration.
  <br>

  To run pending migrations, run the following command:

  ```bash
  $ npm run migration:run
  ```

## Running the app

Before you run the application, ensure to start the dependencies already setup in the docker-compose.yml file by running the following command:

```bash
$ docker-compose up -d
```

The `-d` flag runs starts the containers in detached mode. On a Linux and Unix-like machine, `sudo` may be required.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```
## Project Structure

```bash
src/
├── core/
|    ├── account/         # Account entity, service, controller
|    ├── auth/             # Auth service and controller and Authentication-related logic
|    ├── transfer/        # Transfer entity and services
|    ├── user/            # User entity, service, controller
├── database             # Migrations files 
├── shared               # filters, utils, middleware etc are contained here
├── app.module.ts     # Root module of the application
├── main.ts           # Application entry point
```



## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Endpoints Documentation

You can check all the API endpoints by visiting the following link:

[API Endpoints Documentation](https://documenter.getpostman.com/view/9562205/2sAXxY48eH)


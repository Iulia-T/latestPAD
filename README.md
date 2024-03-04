# FAF.PAD16.2 Winter 2024

## Lab extra: Create MVP using microservices

### Requirements

To be admitted to the re-re-examination it is mandatory to implements ALL requirements listed bellow:

- Create an simple API (any language, 6 endpoints in total) that will access 2 databases (3 endpoints (GET, POST and PUT) in each database);
- First database should be No-sql (any);
- Second database should be SQL (any);
- For at least one of databases implement any kind of replication (redundancy) minimum 4 replicas (each replica should be accessed and should be workable, NOT FOR BACKUP!!!);
- Implement Redis and make it consistent;
- In the first API create one endpoint (7th) that will implement microservice-based 2 Phase Commits for POST requests logic that will affect both databases;
- Upload project on Github, make link public, the teacher will check commits;
- Use Docker to deploy your project, the teacher will PULL images and will test all the project on his local machine;
- Swagger for api or provide Postman collection;

### Documentation

Swagger API docs

```
http://localhost:8000/api-docs/
```

#### How To Run

*If you run from Windows, please run this comands before building:
docker compose prune
docker image prune

1. Clone Remote Repo from Github / DockerHub.

   a. If needed, run `npm install`.

2. Start the application using the `start.bash` script or run:

```
docker compose up --build
```

3. Make a `GET` API call to the `/create` endpoint to create a new table in the PostgreSQL database.

4. Use API documentation to make requests. The API runs on `http://localhost:8000`.

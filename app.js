import express from "express";
import bodyParser from "body-parser";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import "./db/conn.js";
import posts from "./routes/posts.js";
import users from "./routes/users.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());

// Swagger
const swaggerDefinition = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API",
      version: "1.0.0",
      description: "API",
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerDefinition);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/status", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use(posts);
app.use(users);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

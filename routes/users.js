import express from "express";
import { pool } from "../db/conn.js";

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Get all users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/users", async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    res.status(200).json(users.rows);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: A new user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const newUser = await pool.query(
      "INSERT INTO users (name, email) VALUES($1, $2) RETURNING *",
      [name, email]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     description: Update a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: An updated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const updatedUser = await pool.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, id]
    );
    res.status(200).json(updatedUser.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/users/increase/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedUser = await pool.query(
      "UPDATE users SET reposts = reposts + 1 WHERE id = $1 RETURNING *",
      [id]
    );
    res.status(200).json(updatedUser.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create a table
router.get("/create", async (req, res) => {
  try {
    await pool.query(
      "CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(50), email VARCHAR(50), reposts INT DEFAULT 0)"
    );
    res.status(200).json({ message: "Table created" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

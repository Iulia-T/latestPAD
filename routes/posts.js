import express from "express";
import mongoose from "mongoose";

import Post from "../models/Post.js";
import { pool } from "../db/conn.js";
import redisClient from "../db/redis.js";

const router = express.Router();

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     description: Retrieve a list of all posts
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  type: object
 *       404:
 *         description: Error message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/posts", async (req, res) => {
  try {
    redisClient.get("posts", async (err, posts) => {
      if (err) throw err;

      if (posts) {
        res.json(JSON.parse(posts));
      } else {
        const posts = await Post.find();

        redisClient.set("posts", JSON.stringify(posts));

        res.json(posts);
      }
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     description: Create a new post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               type: object
 *     responses:
 *       201:
 *         description: A new post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       409:
 *         description: Error message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/posts", async (req, res) => {
  const post = req.body;
  const newPost = new Post(post);

  try {
    await newPost.save();
    res.status(201).json(newPost);

    redisClient.del("posts");
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     description: Update a post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the post
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               type: object
 *     responses:
 *       200:
 *         description: An updated post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Error message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, company, location, salary } = req.body;
  const updatedPost = { title, content, company, location, salary, _id: id };

  await Post.findByIdAndUpdate(id, updatedPost, { new: true });

  redisClient.del("posts");

  res.json(updatedPost);
});

/**
 * @swagger
 * /repost/{userId}/{id}:
 *   post:
 *     summary: Create a new post with two phase commits
 *     description: Create a new post with two phase commits
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               type: object
 *     responses:
 *       201:
 *         description: A new post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       409:
 *         description: Error message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/repost/:userId/:id", async (req, res) => {
  const session = await mongoose.startSession();
  let postgresTransactionClient;

  try {
    session.startTransaction();

    // MongoDB operation
    const { id } = req.params;
    const existingPost = await Post.findById(id).session(session);

    const postData = existingPost.toObject({ getters: false, virtuals: false });
    delete postData._id;

    const newPost = new Post(postData);
    await newPost.save({ session });

    // PostgreSQL operation
    postgresTransactionClient = await pool.connect();
    await postgresTransactionClient.query("BEGIN");
    const repostUpdateResult = await postgresTransactionClient.query(
      "UPDATE users SET reposts = reposts + 1 WHERE id = $1 RETURNING *",
      [req.params.userId]
    );
    await postgresTransactionClient.query("COMMIT");

    await session.commitTransaction();
    session.endSession();
    postgresTransactionClient.release();

    redisClient.del("posts");

    res
      .status(201)
      .json({ message: "Post created and repost count updated successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (postgresTransactionClient) {
      await postgresTransactionClient.query("ROLLBACK");
      postgresTransactionClient.release();
    }
    console.error("Error in creating post or updating repost count:", error);
    res.status(500).json({ message: "Error in processing your request" });
  }
});

export default router;

import { registerUser, loginUser, updateUser, deleteUser, getAllUsers, getProfile, getUserById } from "../controller/user.controller.js";
// import user from "../../schemas/user.js";
import authMiddleware from "../../midllewares/authMiddleware.js";
import express from "express";

const router = express.Router();


/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - departement
 *               - post
 *               - phone
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecurePass123
 *               departement:
 *                 type: string
 *                 example: IT
 *               post:
 *                 type: string
 *                 example: Developer
 *               phone:
 *                 type: string
 *                 example: "0612345678"
 *               Avatar:
 *                 type: string
 *                 example: https://example.com/avatar.jpg
 *               role:
 *                 type: string
 *                 enum: [user, manager, admin]
 *                 example: user
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *       400:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */

router.post("/register", registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login
 *               - password
 *             properties:
 *               login:
 *                 type: string
 *                 description: Email or phone
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecurePass123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 * 
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post("/login", loginUser);

/**
 * @swagger
 * /api/users/profile/{id}:
 *   get:
 *     summary: Get profile of a user by ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */

router.get("/profile/:id",authMiddleware(), getProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with optional filters, pagination and search
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         description: Search term (applies to firstName, lastName, email, phone)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *       - in: query
 *         name: departement
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: post
 *         schema:
 *           type: string
 *         description: Filter by post
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Filter by phone number
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email
 *       - in: query
 *         name: firstName
 *         schema:
 *           type: string
 *         description: Filter by first name
 *       - in: query
 *         name: lastName
 *         schema:
 *           type: string
 *         description: Filter by last name
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Server error
 */


router.get("/",authMiddleware(), getAllUsers);


/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */

router.get("/:id",authMiddleware(), getUserById);


/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
router.put("/:id",authMiddleware(), updateUser);


/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     security:
 *      - bearerAuth: []
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 *       500:
 *         description: Server error
 */
router.delete("/:id",authMiddleware(), deleteUser);

export default router;
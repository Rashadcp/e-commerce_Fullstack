import express from "express";
import {
    loginUser,
    getUsers,
    createUser,
    updateUser,
    deleteUser
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/", createUser);
router.get("/", protect, admin, getUsers);
router.patch("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser);


export default router;

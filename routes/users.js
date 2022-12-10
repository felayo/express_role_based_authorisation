import express from "express";
import {
  login,
  register,
  updateUser,
  deleteUser,
  getUser,
  getUsers,
  filterFields,
} from "../controllers/user.js";
import { verifyAdmin, verifyUser, verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

// Create User
router.post("/", register)

//login route
router.post("/login", login)

//UPDATE
router.put("/:id", verifyToken, verifyUser, updateUser);

//DELETE
router.delete("/:id", verifyToken, verifyUser, deleteUser);

//GET
router.get("/find/:id", verifyToken, verifyUser, getUser);

//GET ALL
router.get("/", verifyToken, verifyAdmin, getUsers);

router.get("/filter_field", filterFields);

export default router;

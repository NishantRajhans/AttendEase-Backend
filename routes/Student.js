import express from "express";
import { SignIn } from "../controller/Student.js"
const router = express.Router();
router.get("/SignIn", SignIn);
export default router;


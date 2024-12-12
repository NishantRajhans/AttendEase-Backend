import express from "express";
import { SignIn ,GetGradeSubject,GetGradeSubjectAttendance} from "../controller/Student.js"
import {AuthMiddleware } from "../middleware/StudentAuthMiddleware.js"
const router = express.Router();
router.post("/SignIn", SignIn);
router.get("/GetGradeSubject",AuthMiddleware,GetGradeSubject)
router.get("/GetGradeSubjectAttedance",AuthMiddleware,GetGradeSubjectAttendance)
export default router;


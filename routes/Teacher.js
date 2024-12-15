import express from "express";
import { PutAttendance,FetchAttendance,FetchSubject,FetchTotalPresent,FetchStudentOfParticularSubject} from "../controller/Teacher.js";
import { SignIn } from "../controller/Teacher.js";
import {AuthMiddleware} from "../middleware/TeacherAuthMiddleware.js"
const router = express.Router();
router.post("/SignIn", SignIn);
router.put("/PutAttendance",AuthMiddleware, PutAttendance);
router.get("/FetchSubject",AuthMiddleware, FetchSubject);
router.get("/FetchAttendance",AuthMiddleware,FetchAttendance);
router.get("/FetchTotalPresent",AuthMiddleware,FetchTotalPresent);
router.get("/FetchStudentOfParticularSubject",AuthMiddleware,FetchStudentOfParticularSubject);
export default router;


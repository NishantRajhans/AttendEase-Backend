import express from "express";
import { PutAttendance,FetchAttendance,FetchSubject,RemoveAttendance,FetchTotalPresent,FetchStudentOfParticularSubject,PutAttendanceFromBot} from "../controller/Teacher.js";
import { SignIn } from "../controller/Teacher.js";
import {AuthMiddleware} from "../middleware/TeacherAuthMiddleware.js"
const router = express.Router();
router.post("/SignIn", SignIn);
router.put("/PutAttendance",AuthMiddleware, PutAttendance);
router.put("/PutAttendanceFromBot",AuthMiddleware, PutAttendanceFromBot);
router.delete("/RemoveAttendance",AuthMiddleware,RemoveAttendance);
router.get("/FetchSubject",AuthMiddleware, FetchSubject);
router.get("/FetchAttendance",AuthMiddleware,FetchAttendance);
router.get("/FetchTotalPresent",AuthMiddleware,FetchTotalPresent);
router.get("/FetchStudentOfParticularSubject",AuthMiddleware,FetchStudentOfParticularSubject);
export default router;


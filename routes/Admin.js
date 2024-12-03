import express from "express";
import { AddStudent,AddSubject,AddTeacher,GetAllStudent,GetAllTeacher,EditTeacher,GetAllSubject, GetAllGrade,DeleteStudent ,EditStudent,EditSubject,DeletTeacher,DeleteSubject} from "../controller/Admin.js";
import {AuthMiddleware} from "../middleware/AdminAuthMiddleware.js"
import { SignIn } from "../controller/Admin.js";
const router = express.Router();
router.post("/SignIn",SignIn);
router.post("/AddStudent",AuthMiddleware,AddStudent);
router.post("/AddSubject",AuthMiddleware,AddSubject);
router.post("/AddTeacher",AuthMiddleware,AddTeacher);
router.put("/EditTeacher/:id",AuthMiddleware,EditTeacher);
router.put("/EditStudent/:id",AuthMiddleware,EditStudent);
router.put("/EditSubject/:id",AuthMiddleware,EditSubject);
router.delete("/DeleteStudent/:id",AuthMiddleware,DeleteStudent);
router.delete("/DeleteTeacher/:id",AuthMiddleware,DeletTeacher);
router.delete("/DeleteSubject",AuthMiddleware,DeleteSubject);
router.get("/GetAllStudent",AuthMiddleware,GetAllStudent);
router.get("/GetAllTeacher",AuthMiddleware,GetAllTeacher);
router.get("/GetAllSubject",AuthMiddleware,GetAllSubject);
router.get("/GetAllGrade",AuthMiddleware,GetAllGrade);
export default router;
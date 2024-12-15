import jwt from "jsonwebtoken";
import prisma from "../config/Database.js";
export const SignIn = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(401).json({
        message: "All fields are required",
        success: false,
      });
    }
    const user = await prisma.student.findFirst({
      where: { email: email, password: password },
    });
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }
    const token = jwt.sign(
      { email: user.email, studentId: user.studentId, role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    return res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      user:{...user,phoneNumber:Number(user.phoneNumber)},
      role: "Student",
      message: "Student login successful",
    });
  } catch (err) {
    console.error("Error in SignIn:", err);
    return res.status(500).json({
      message: "Error in SignIn",
      success: false,
    });
  }
};
export const GetGradeSubject = async (req, res) => {
  try {
    const { studentId } = req.user;
    if (!studentId) {
      return res.status(401).json({
        message: "All fields are required",
        success: false,
      });
    }
    const result = await prisma.$queryRaw`
          SELECT * FROM "Subject" 
          WHERE "subjectId" IN (
          SELECT "subjectId" 
          FROM "GradeSubject" 
          WHERE "gradeId" IN (
          SELECT "gradeId" 
          FROM "Grade" 
          WHERE "gradeName" IN (
          SELECT grade 
          FROM "Student" 
          WHERE "studentId" = ${Number(studentId)})))`;
    return res.status(200).json({
      response: result,
      message: "Get All Grade Subjects successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in GetGradeSubject:", err);
    return res.status(500).json({
      message: "Error in GetGradeSubject",
      success: false,
    });
  }
};
export const GetGradeSubjectAttendance = async (req, res) => {
  try {
    const { studentId } = req.user;
    const { month, subjectId, year } = req.query;
    if (!month || !subjectId || !year || !studentId) {
      return res.status(401).json({
        message: "All fields are required",
        success: false,
      });
    }
    const result = await prisma.$queryRaw`SELECT * 
                  FROM "Attendance" 
                  WHERE "studentId" = ${studentId} 
                  AND EXTRACT(MONTH FROM "attendanceDate") = ${Number(month)} 
                  AND EXTRACT(YEAR FROM "attendanceDate") = ${Number(year)} 
                  AND "subjectId" = ${Number(subjectId)} 
                  ORDER BY DATE("attendanceDate")`;
    return res.status(200).json({
      response: result,
      message: "Get Grade Subject Attendance successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in GetGradeSubjectAttendance:", err);
    return res.status(500).json({
      message: "Error in GetGradeSubjectAttendance",
      success: false,
    });
  }
};

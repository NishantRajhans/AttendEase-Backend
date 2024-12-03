import jwt from "jsonwebtoken";
import DbConnection from "../config/Database.js";
export const SignIn = async (req, res) => {
    try {
      const { EMAIL, PASSWORD ,ROLE} = req.body;
      const DB = await DbConnection();
      const SQL = `SELECT NAME,TEACHER_ID, EMAIL FROM TEACHER WHERE EMAIL = ? AND PASSWORD = ?;`;
      const [rows] = await DB.query(SQL, [EMAIL, PASSWORD]);
      if (rows.length === 0) {
        return res.status(400).json({
          message: "Invalid credentials",
          success: false,
        });
      }
      const user = rows[0];
      const token = jwt.sign(
        { EMAIL: user.EMAIL, TEACHER_ID: user.TEACHER_ID,ROLE:ROLE},
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
        user,
        role:"Teacher",
        message: "Admin login successful",
      });
    } catch (err) {
      console.log("Error in signin", err);
      return res.status(400).json({
        message: "Error in signin",
        success: false,
      });
    }
  };
export const PutAttendance = async (req, res) => {
  try {
    const { STUDENT_ID, SUBJECT_ID, PRESENT, ATTENDANCE_DATE } =
      req.body;
    const {TEACHER_ID}=req.user
    const DB = await DbConnection();
    const SQL = `INSERT INTO ATTENDANCE (STUDENT_ID, SUBJECT_ID, TEACHER_ID, PRESENT, ATTENDANCE_DATE)
VALUE(?,?,?,?,?)`;
    const response = await DB.query(SQL, [
      STUDENT_ID,
      SUBJECT_ID,
      TEACHER_ID,
      PRESENT,
      ATTENDANCE_DATE,
    ]);
    return res.json({
      response: response,
      message: "Put Attendance successful",
    });
  } catch (err) {
    console.log("Error in Put Attendance", err);
    return res.status(400).json({
      message: "Error in Put Attendance",
      success: false,
    });
  }
};
export const FetchAttendance = async (req, res) => {
  try {
    const { Subject, Month, Year } = req.query;
    const DB = await DbConnection();
    const SQL = `SELECT 
    STUDENT.*, 
    ATTENDANCE.ATTENDANCE_ID,
    ATTENDANCE.PRESENT,
    DAY(ATTENDANCE.ATTENDANCE_DATE) AS ATTENDANCE_DAY
FROM 
    STUDENT
LEFT JOIN 
    ATTENDANCE ON STUDENT.STUDENT_ID = ATTENDANCE.STUDENT_ID
    AND MONTH(ATTENDANCE.ATTENDANCE_DATE) =?  -- Replace 10 with the target month
    AND YEAR(ATTENDANCE.ATTENDANCE_DATE) = ?  -- Replace 2024 with the target year
    AND ATTENDANCE.SUBJECT_ID = ?  -- Ensure the subject ID matches
WHERE 
    STUDENT.GRADE IN (SELECT GRADE_ID FROM GRADE_SUBJECT WHERE SUBJECT_ID = ?);`;
    const [rows] = await DB.query(SQL, [Month, Year, Subject, Subject]);
    if (rows.length === 0) {
      return res.status(200).json({
        message: "Invalid credentials",
        success: false,
      });
    }
    return res.json({
      message: "Fetch Attendance successfully",
      response: rows,
      success: true,
    });
  } catch (err) {
    console.log("Error in signin", err);
    return res.status(400).json({
      message: "Error in signin",
      success: false,
    });
  }
};
export const FetchTotalPresent = async (req, res) => {
  try {
    const { Subject, Month, Year} = req.query;
    const {TEACHER_ID}=req.user
    const DB = await DbConnection();
    const SQL = `SELECT 
    DAY(ATTENDANCE.ATTENDANCE_DATE) AS ATTENDANCE_DAY,
    COUNT(ATTENDANCE.ATTENDANCE_ID) AS presentCount
FROM 
    ATTENDANCE
LEFT JOIN 
    STUDENT ON STUDENT.STUDENT_ID = ATTENDANCE.STUDENT_ID
WHERE 
    STUDENT.GRADE IN (SELECT GRADE_ID FROM GRADE_SUBJECT WHERE SUBJECT_ID = ?)
    AND MONTH(ATTENDANCE.ATTENDANCE_DATE) = ? 
    AND YEAR(ATTENDANCE.ATTENDANCE_DATE) = ? 
    AND ATTENDANCE.SUBJECT_ID = ?  
    AND TEACHER_ID=?
    AND ATTENDANCE.PRESENT = true 
GROUP BY 
    ATTENDANCE_DAY
ORDER BY 
    ATTENDANCE_DAY;`;
    const [rows] = await DB.query(SQL, [Subject,Month, Year,Subject,TEACHER_ID]);
    console.log(Month, Year,Subject,TEACHER_ID)
    console.log(rows);
    return res.json({
      message: "Fetch Attendance successfully",
      response: rows,
      success: true,
    });
  } catch (err) {
    console.log("Error in signin", err);
    return res.status(400).json({
      message: "Error in signin",
      success: false,
    });
  }
};
export const FetchStudents = async (req, res) => {
  try {
    const { SUBJECT_ID } = req.query;
    const DB = await DbConnection();
    const SQL = `SELECT * FROM STUDENT WHERE GRADE IN( SELECT GRADE_ID FROM GRADE_SUBJECT WHERE SUBJECT_ID=?);`;
    const response = await DB.query(SQL, [SUBJECT_ID]);
    return res.json({
      message: "Fetch Students successfully",
      response: response[0],
      success: true,
    });
  } catch (err) {
    console.log("Error in Fetch Students", err);
    return res.status(400).json({
      message: "Error in Fetch Students",
      success: false,
    });
  }
};
export const FetchSubject = async (req, res) => {
  try {
    const { TEACHER_ID } = req.user;
    const DB = await DbConnection();
    const SQL = `SELECT * FROM SUBJECT WHERE SUBJECT_ID IN(SELECT TEACHER_SUBJECT_ASSIGNMENT.SUBJECT_ID FROM TEACHER_SUBJECT_ASSIGNMENT WHERE TEACHER_ID=?);`;
    const response = await DB.query(SQL, [TEACHER_ID]);
    return res.json({
      message: "Fetch Subject successfully",
      response: response[0],
      success: true,
    });
  } catch (err) {
    console.log("Error in Fetch Subject", err);
    return res.status(400).json({
      message: "Error in Fetch Subject",
      success: false,
    });
  }
};

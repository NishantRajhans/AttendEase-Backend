import jwt from "jsonwebtoken";
import DbConnection from "../config/Database.js";
// Utility function for DB connection
const withDbConnection = async (callback) => {
  const pool = await DbConnection();
  const connection = await pool.getConnection();
  try {
    return await callback(connection);
  } finally {
    connection.release();
  }
};

export const SignIn = async (req, res) => {
  try {
    const { EMAIL, PASSWORD, ROLE } = req.body;
    const user = await withDbConnection(async (connection) => {
      const SQL = `SELECT NAME, TEACHER_ID, EMAIL FROM TEACHER WHERE EMAIL = ? AND PASSWORD = ?;`;
      const [rows] = await connection.query(SQL, [EMAIL, PASSWORD]);
      return rows.length > 0 ? rows[0] : null;
    });

    if (!user) {
      return res.status(200).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const token = jwt.sign(
      { EMAIL: user.EMAIL, TEACHER_ID: user.TEACHER_ID, ROLE: ROLE },
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
      role: "Teacher",
      message: "Teacher login successful",
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
    const { STUDENT_ID, SUBJECT_ID, PRESENT, ATTENDANCE_DATE } = req.body;
    const { TEACHER_ID } = req.user;

    const attendanceExists = await withDbConnection(async (connection) => {
      const FindSQL = `SELECT * FROM ATTENDANCE WHERE SUBJECT_ID=? AND TEACHER_ID=? AND ATTENDANCE_DATE=? AND STUDENT_ID=?;`;
      const [rows] = await connection.query(FindSQL, [SUBJECT_ID, TEACHER_ID, ATTENDANCE_DATE, STUDENT_ID]);
      return rows.length > 0;
    });

    if (attendanceExists) {
      return res.json({
        message: "Attendance of this date and subject is already taken.",
      });
    }

    await withDbConnection(async (connection) => {
      const SQL = `INSERT INTO ATTENDANCE (STUDENT_ID, SUBJECT_ID, TEACHER_ID, PRESENT, ATTENDANCE_DATE) VALUES (?, ?, ?, ?, ?);`;
      await connection.query(SQL, [STUDENT_ID, SUBJECT_ID, TEACHER_ID, PRESENT, ATTENDANCE_DATE]);
    });

    return res.json({
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

export const RemoveAttendance = async (req, res) => {
  try {
    const { STUDENT_ID, SUBJECT_ID, ATTENDANCE_DATE } = req.query;
    const { TEACHER_ID } = req.user;

    await withDbConnection(async (connection) => {
      const SQL = `DELETE FROM ATTENDANCE WHERE STUDENT_ID = ? AND SUBJECT_ID = ? AND TEACHER_ID = ? AND ATTENDANCE_DATE = ?;`;
      await connection.query(SQL, [STUDENT_ID, SUBJECT_ID, TEACHER_ID, ATTENDANCE_DATE]);
    });

    return res.json({
      message: "Remove Attendance successful",
    });
  } catch (err) {
    console.log("Error in Remove Attendance", err);
    return res.status(400).json({
      message: "Error in Remove Attendance",
      success: false,
    });
  }
};

export const FetchAttendance = async (req, res) => {
  try {
    const { Subject, Month, Year } = req.query;

    const rows = await withDbConnection(async (connection) => {
      const SQL = `SELECT * FROM ATTENDANCE WHERE SUBJECT_ID=? AND MONTH(ATTENDANCE_DATE)=? AND YEAR(ATTENDANCE_DATE)=? ORDER BY ATTENDANCE_DATE;`;
      const [rows] = await connection.query(SQL, [Subject, Month, Year]);
      return rows;
    });

    if (rows.length === 0) {
      return res.status(200).json({
        message: "No attendance records found",
        success: false,
      });
    }

    return res.json({
      message: "Fetch Attendance successfully",
      response: rows,
      success: true,
    });
  } catch (err) {
    console.log("Error in Fetch Attendance", err);
    return res.status(400).json({
      message: "Error in Fetch Attendance",
      success: false,
    });
  }
};

export const FetchTotalPresent = async (req, res) => {
  try {
    const { Subject, Month, Year } = req.query;
    const { TEACHER_ID } = req.user;

    const rows = await withDbConnection(async (connection) => {
      const SQL = `SELECT 
        DAY(ATTENDANCE.ATTENDANCE_DATE) AS ATTENDANCE_DAY,
        COUNT(ATTENDANCE.ATTENDANCE_ID) AS presentCount
        FROM ATTENDANCE
        LEFT JOIN STUDENT ON STUDENT.STUDENT_ID = ATTENDANCE.STUDENT_ID
        WHERE STUDENT.GRADE IN (SELECT GRADE_ID FROM GRADE_SUBJECT WHERE SUBJECT_ID = ?)
        AND MONTH(ATTENDANCE.ATTENDANCE_DATE) = ? 
        AND YEAR(ATTENDANCE.ATTENDANCE_DATE) = ? 
        AND ATTENDANCE.SUBJECT_ID = ?  
        AND TEACHER_ID = ?
        AND ATTENDANCE.PRESENT = true 
        GROUP BY ATTENDANCE_DAY
        ORDER BY ATTENDANCE_DAY;`;

      const [rows] = await connection.query(SQL, [Subject, Month, Year, Subject, TEACHER_ID]);
      return rows;
    });

    return res.json({
      message: "Fetch Attendance successfully",
      response: rows,
      success: true,
    });
  } catch (err) {
    console.log("Error in Fetch Total Present", err);
    return res.status(400).json({
      message: "Error in Fetch Total Present",
      success: false,
    });
  }
};

export const FetchSubject = async (req, res) => {
  try {
    const { TEACHER_ID } = req.user;

    const response = await withDbConnection(async (connection) => {
      const SQL = `SELECT * FROM SUBJECT WHERE SUBJECT_ID IN(SELECT TEACHER_SUBJECT_ASSIGNMENT.SUBJECT_ID FROM TEACHER_SUBJECT_ASSIGNMENT WHERE TEACHER_ID=?);`;
      const [rows] = await connection.query(SQL, [TEACHER_ID]);
      return rows;
    });

    return res.json({
      message: "Fetch Subject successfully",
      response: response,
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

export const FetchStudentOfParticularSubject = async (req, res) => {
  try {
    const { SUBJECT_ID } = req.query;

    const rows = await withDbConnection(async (connection) => {
      const SQL = `SELECT STUDENT_ID, NAME FROM STUDENT WHERE GRADE IN (SELECT GRADE_ID FROM GRADE_SUBJECT WHERE SUBJECT_ID=?) ORDER BY STUDENT_ID;`;
      const [rows] = await connection.query(SQL, [SUBJECT_ID]);
      return rows;
    });

    return res.status(200).json({
      response: rows,
      message: "Student fetch Successfully",
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error in FetchStudentOfParticularSubject",
      success: false,
    });
  }
};


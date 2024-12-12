import jwt from "jsonwebtoken";
import DbConnection from "../config/Database.js";
const withDbConnection = async (callback) => {
  const connection = await DbConnection(); 
  try {
    return await callback(connection);
  } finally {
    await connection.end();
  }
};
export const SignIn = async (req, res) => {
  try {
    const { EMAIL, PASSWORD, ROLE } = req.body;

    const result = await withDbConnection(async (DB) => {
      const SQL = `SELECT NAME, STUDENT_ID, EMAIL FROM STUDENT WHERE EMAIL = ? AND PASSWORD = ?;`;
      const [rows] = await DB.query(SQL, [EMAIL, PASSWORD]);
      return rows;
    });

    if (result.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const user = result[0];
    const token = jwt.sign(
      { EMAIL: user.EMAIL, STUDENT_ID: user.STUDENT_ID, ROLE },
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
    const { STUDENT_ID } = req.user;

    const result = await withDbConnection(async (DB) => {
      const SQL = `
        SELECT * 
        FROM SUBJECT 
        WHERE SUBJECT_ID IN (
          SELECT SUBJECT_ID 
          FROM GRADE_SUBJECT 
          WHERE GRADE_ID IN (
            SELECT GRADE_ID 
            FROM GRADE 
            WHERE GRADE_NAME IN (
              SELECT GRADE 
              FROM STUDENT 
              WHERE STUDENT_ID = ?
            )
          )
        );
      `;
      const [rows] = await DB.query(SQL, [STUDENT_ID]);
      return rows;
    });

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
    const { STUDENT_ID } = req.user;
    const { MONTH, SUBJECT_ID, YEAR } = req.query;

    const result = await withDbConnection(async (DB) => {
      const SQL = `
        SELECT * 
        FROM ATTENDANCE 
        WHERE STUDENT_ID = ? 
          AND MONTH(ATTENDANCE_DATE) = ? 
          AND YEAR(ATTENDANCE_DATE) = ? 
          AND SUBJECT_ID = ? 
        ORDER BY DAY(ATTENDANCE_DATE);
      `;
      const [rows] = await DB.query(SQL, [STUDENT_ID, MONTH, YEAR, SUBJECT_ID]);
      return rows;
    });

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

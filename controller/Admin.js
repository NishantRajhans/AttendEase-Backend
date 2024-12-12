import jwt from "jsonwebtoken";
import DbConnection from "../config/Database.js";
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

    const result = await withDbConnection(async (DB) => {
      const SQL = `SELECT NAME, ADMIN_ID, EMAIL FROM ADMINISTRATOR WHERE EMAIL = ? AND PASSWORD = ?;`;
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
      { EMAIL: user.EMAIL, ADMIN_ID: user.ADMIN_ID, ROLE },
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
      role: "Admin",
      message: "Admin login successful",
    });
  } catch (err) {
    console.error("Error in signin", err);
    return res.status(500).json({
      message: "Error in signin",
      success: false,
    });
  }
};

export const AddTeacher = async (req, res) => {
  try {
    const { NAME, EMAIL, PASSWORD } = req.body;

    await withDbConnection(async (DB) => {
      const SQL = `INSERT INTO TEACHER (NAME, EMAIL, PASSWORD) VALUES (?, ?, ?);`;
      await DB.query(SQL, [NAME, EMAIL, PASSWORD]);
    });

    return res.status(200).json({
      message: "Add Teacher successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in Add Teacher", err);
    return res.status(500).json({
      message: "Error in Add Teacher",
      success: false,
    });
  }
};

export const AddStudent = async (req, res) => {
  try {
    const { NAME, GRADE, ADDRESS, PHONENUMBER, EMAIL, PASSWORD } = req.body;

    await withDbConnection(async (DB) => {
      const SQL = `INSERT INTO STUDENT (NAME, GRADE, ADDRESS, PHONENUMBER, EMAIL, PASSWORD) VALUES (?, ?, ?, ?, ?, ?);`;
      await DB.query(SQL, [NAME, GRADE, ADDRESS, PHONENUMBER, EMAIL, PASSWORD]);
    });

    return res.status(200).json({
      message: "Add Student successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in Add Student", err);
    return res.status(500).json({
      message: "Error in Add Student",
      success: false,
    });
  }
};

export const AddSubject = async (req, res) => {
  try {
    const { SUBJECT_NAME, GRADE_ID, TEACHER_ID } = req.body;

    await withDbConnection(async (DB) => {
      await DB.beginTransaction();

      const SubjectSQL = `INSERT INTO SUBJECT (SUBJECT_NAME) VALUES (?);`;
      await DB.query(SubjectSQL, [SUBJECT_NAME]);

      const SubjectIdSQL = `SELECT SUBJECT_ID FROM SUBJECT WHERE SUBJECT_NAME = ?;`;
      const [response] = await DB.query(SubjectIdSQL, [SUBJECT_NAME]);
      const SUBJECT_ID = response[0].SUBJECT_ID;

      const GradeToSubjectSQL = `INSERT INTO GRADE_SUBJECT (GRADE_ID, SUBJECT_ID) VALUES (?, ?);`;
      await DB.query(GradeToSubjectSQL, [GRADE_ID, SUBJECT_ID]);

      const AssignSubjectToTeacherSQL = `
        INSERT INTO TEACHER_SUBJECT_ASSIGNMENT (TEACHER_ID, GRADE_ID, SUBJECT_ID) VALUES (?, ?, ?);
      `;
      await DB.query(AssignSubjectToTeacherSQL, [TEACHER_ID, GRADE_ID, SUBJECT_ID]);

      await DB.commit();
    });

    return res.status(200).json({
      message: "Add Subject successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in Add Subject", err);
    return res.status(500).json({
      message: "Error in Add Subject",
      success: false,
    });
  }
};

export const DeleteStudent = async (req, res) => {
  try {
    const { id: STUDENT_ID } = req.params;

    await withDbConnection(async (DB) => {
      const SQL = `DELETE FROM STUDENT WHERE STUDENT_ID = ?;`;
      await DB.query(SQL, [STUDENT_ID]);
    });

    return res.status(200).json({
      message: "Delete Student successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in Delete Student", err);
    return res.status(500).json({
      message: "Error in Delete Student",
      success: false,
    });
  }
};

export const DeleteTeacher = async (req, res) => {
  try {
    const { id: TEACHER_ID } = req.params;

    await withDbConnection(async (DB) => {
      const SQL = `DELETE FROM TEACHER WHERE TEACHER_ID = ?;`;
      await DB.query(SQL, [TEACHER_ID]);
    });

    return res.status(200).json({
      message: "Delete Teacher successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in Delete Teacher", err);
    return res.status(500).json({
      message: "Error in Delete Teacher",
      success: false,
    });
  }
};

export const DeleteSubject = async (req, res) => {
  try {
    const { Subject, Grade, Teacher } = req.query;

    await withDbConnection(async (DB) => {
      await DB.beginTransaction();

      const RemoveFromSubjectToTeacherSQL = `DELETE FROM TEACHER_SUBJECT_ASSIGNMENT WHERE SUBJECT_ID = ? AND GRADE_ID = ? AND TEACHER_ID = ?;`;
      await DB.query(RemoveFromSubjectToTeacherSQL, [Subject, Grade, Teacher]);

      const RemoveGradeToSubjectSQL = `DELETE FROM GRADE_SUBJECT WHERE GRADE_ID = ? AND SUBJECT_ID = ?;`;
      await DB.query(RemoveGradeToSubjectSQL, [Grade, Subject]);

      const RemoveSubjectSQL = `DELETE FROM SUBJECT WHERE SUBJECT_ID = ?;`;
      await DB.query(RemoveSubjectSQL, [Subject]);

      await DB.commit();
    });

    return res.status(200).json({
      message: "Delete Subject successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in Delete Subject", err);
    return res.status(500).json({
      message: "Error in Delete Subject",
      success: false,
    });
  }
};

export const GetAllStudents = async (req, res) => {
  try {
    const result = await withDbConnection(async (DB) => {
      const SQL = `SELECT * FROM STUDENT;`;
      const [rows] = await DB.query(SQL);
      return rows;
    });

    return res.status(200).json({
      response: result,
      message: "Get All Students successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in Get All Students", err);
    return res.status(500).json({
      message: "Error in Get All Students",
      success: false,
    });
  }
};

export const GetAllTeachers = async (req, res) => {
  try {
    const result = await withDbConnection(async (DB) => {
      const SQL = `SELECT * FROM TEACHER;`;
      const [rows] = await DB.query(SQL);
      return rows;
    });

    return res.status(200).json({
      response: result,
      message: "Get All Teachers successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in Get All Teachers", err);
    return res.status(500).json({
      message: "Error in Get All Teachers",
      success: false,
    });
  }
};

export const GetAllSubjects = async (req, res) => {
  try {
    const result = await withDbConnection(async (DB) => {
      const SQL = `
        SELECT 
          S.SUBJECT_NAME AS SUBJECT,
          S.SUBJECT_ID AS SUBJECT_ID, 
          G.GRADE_NAME AS GRADE,
          G.GRADE_ID AS GRADE_ID, 
          T.NAME AS TEACHER,
          T.TEACHER_ID AS TEACHER_ID
        FROM 
          GRADE_SUBJECT GS
        JOIN 
          SUBJECT S ON GS.SUBJECT_ID = S.SUBJECT_ID
        JOIN 
          GRADE G ON GS.GRADE_ID = G.GRADE_ID
        LEFT JOIN 
          TEACHER_SUBJECT_ASSIGNMENT TSA ON GS.GRADE_ID = TSA.GRADE_ID AND GS.SUBJECT_ID = TSA.SUBJECT_ID
        LEFT JOIN 
          TEACHER T ON TSA.TEACHER_ID = T.TEACHER_ID
        ORDER BY 
          S.SUBJECT_NAME, G.GRADE_NAME;
      `;
      const [rows] = await DB.query(SQL);
      return rows;
    });

    return res.status(200).json({
      response: result,
      message: "Get All Subjects with grades and teachers successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in Get All Subjects", err);
    return res.status(500).json({
      message: "Error in Get All Subjects",
      success: false,
    });
  }
};

export const GetAllGrades = async (req, res) => {
  try {
    const result = await withDbConnection(async (DB) => {
      const SQL = `SELECT * FROM GRADE;`;
      const [rows] = await DB.query(SQL);
      return rows;
    });

    return res.status(200).json({
      response: result,
      message: "Get All Grades successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in Get All Grades", err);
    return res.status(500).json({
      message: "Error in Get All Grades",
      success: false,
    });
  }
};

export const EditStudent = async (req, res) => {
  try {
    const { NAME, GRADE, ADDRESS, PHONENUMBER, EMAIL, PASSWORD } = req.body;
    const { id: STUDENT_ID } = req.params;

    await withDbConnection(async (DB) => {
      const SQL = `UPDATE STUDENT SET NAME = ?, GRADE = ?, ADDRESS = ?, PHONENUMBER = ?, EMAIL = ?, PASSWORD = ? WHERE STUDENT_ID = ?;`;
      await DB.query(SQL, [NAME, GRADE, ADDRESS, PHONENUMBER, EMAIL, PASSWORD, STUDENT_ID]);
    });

    return res.status(200).json({
      message: "Edit Student successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in Edit Student", err);
    return res.status(500).json({
      message: "Error in Edit Student",
      success: false,
    });
  }
};

export const EditTeacher = async (req, res) => {
  try {
    const { NAME, EMAIL, PASSWORD } = req.body;
    const { id: TEACHER_ID } = req.params;

    await withDbConnection(async (DB) => {
      const SQL = `UPDATE TEACHER SET NAME = ?, EMAIL = ?, PASSWORD = ? WHERE TEACHER_ID = ?;`;
      await DB.query(SQL, [NAME, EMAIL, PASSWORD, TEACHER_ID]);
    });

    return res.status(200).json({
      message: "Edit Teacher successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in Edit Teacher", err);
    return res.status(500).json({
      message: "Error in Edit Teacher",
      success: false,
    });
  }
};

export const EditSubject = async (req, res) => {
  try {
    const { TEACHER_ID, SUBJECT_NAME, GRADE_ID } = req.body;
    const { id: SUBJECT_ID } = req.params;

    await withDbConnection(async (DB) => {
      await DB.beginTransaction();

      const UpdateSubjectSQL = `UPDATE SUBJECT SET SUBJECT_NAME = ? WHERE SUBJECT_ID = ?;`;
      await DB.query(UpdateSubjectSQL, [SUBJECT_NAME, SUBJECT_ID]);

      const UpdateGradeSubjectSQL = `UPDATE GRADE_SUBJECT SET GRADE_ID = ? WHERE SUBJECT_ID = ?;`;
      await DB.query(UpdateGradeSubjectSQL, [GRADE_ID, SUBJECT_ID]);

      const UpdateTeacherAssignmentSQL = `UPDATE TEACHER_SUBJECT_ASSIGNMENT SET TEACHER_ID = ? WHERE SUBJECT_ID = ? AND GRADE_ID = ?;`;
      await DB.query(UpdateTeacherAssignmentSQL, [TEACHER_ID, SUBJECT_ID, GRADE_ID]);

      await DB.commit();
    });

    return res.status(200).json({
      message: "Edit Subject successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in Edit Subject", err);
    return res.status(500).json({
      message: "Error in Edit Subject",
      success: false,
    });
  }
};

import jwt from "jsonwebtoken";
import DbConnection from "../config/Database.js";
export const SignIn = async (req, res) => {
  try {
    const { EMAIL, PASSWORD, ROLE } = req.body;
    const DB = await DbConnection();
    const SQL = `SELECT NAME,ADMIN_ID, EMAIL FROM ADMINISTRATOR WHERE EMAIL = ? AND PASSWORD = ?;`;
    const [rows] = await DB.query(SQL, [EMAIL, PASSWORD]);
    console.log(EMAIL, PASSWORD, ROLE, rows);
    if (rows.length === 0) {
      return res.status(400).json({
        message: "Invalid credentials",
        success: false,
      });
    }
    const user = rows[0];
    const token = jwt.sign(
      { EMAIL: user.EMAIL, ADMIN_ID: user.ADMIN_ID, ROLE: ROLE },
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
    console.log("Error in signin", err);
    return res.status(400).json({
      message: "Error in signin",
      success: false,
    });
  }
};
export const AddTeacher = async (req, res) => {
  try {
    const { NAME, EMAIL, PASSWORD } = req.body;
    const DB = await DbConnection();
    const SQL = `INSERT INTO TEACHER (NAME, EMAIL, PASSWORD) VALUES (?, ?, ?);`;
    const response = await DB.query(SQL, [NAME, EMAIL, PASSWORD]);
    return res.json({
      response: response,
      message: "Add Teacher successful",
    });
  } catch (err) {
    console.log("Error in Add Teacher", err);
    return res.status(400).json({
      message: "Error in Add Teacher",
      success: false,
    });
  }
};
export const AddStudent = async (req, res) => {
  try {
    const { NAME, GRADE, ADDRESS, PHONENUMBER, EMAIL, PASSWORD } = req.body;
    const DB = await DbConnection();
    const SQL = `INSERT INTO STUDENT (NAME, GRADE, ADDRESS, PHONENUMBER, EMAIL, PASSWORD)
VALUE(?, ?, ?,?,?,?);`;
    const response = await DB.query(SQL, [
      NAME,
      GRADE,
      ADDRESS,
      PHONENUMBER,
      EMAIL,
      PASSWORD,
    ]);
    return res.json({
      message: "Add Student successful",
    });
  } catch (err) {
    console.log("Error in Add Student", err);
    return res.status(400).json({
      message: "Error in Add Student",
      success: false,
    });
  }
};
export const AddSubject = async (req, res) => {
  try {
    const { SUBJECT_NAME, GRADE_ID, TEACHER_ID } = req.body;
    const DB = await DbConnection();
    await DB.beginTransaction();
    const SubjectSQL = `INSERT INTO SUBJECT (SUBJECT_NAME) VALUE(?);`;
    await DB.query(SubjectSQL, [SUBJECT_NAME]);
    const SubjectIdSQL = `SELECT SUBJECT_ID FROM SUBJECT WHERE SUBJECT_NAME = ?;`;
    const [response] = await DB.query(SubjectIdSQL, [SUBJECT_NAME]);
    const SUBJECT_ID = response[0].SUBJECT_ID;
    const GradeToSubjectSQL = `INSERT INTO GRADE_SUBJECT (GRADE_ID, SUBJECT_ID) VALUE (?, ?);`;
    await DB.query(GradeToSubjectSQL, [GRADE_ID, SUBJECT_ID]);
    const AssignSubjectToTeacherSQL = `
      INSERT INTO TEACHER_SUBJECT_ASSIGNMENT (TEACHER_ID, GRADE_ID, SUBJECT_ID)
      VALUE (?, ?, ?);
    `;
    await DB.query(AssignSubjectToTeacherSQL, [
      TEACHER_ID,
      GRADE_ID,
      SUBJECT_ID,
    ]);
    await DB.commit();
    return res.json({
      message: "Add Subject successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in Add Subject", err);
    if (DbConnection && DbConnection.rollback) await DB.rollback();
    return res.status(400).json({
      message: "Error in Add Subject",
      success: false,
      error: err.message,
    });
  }
};
export const DeleteStudent = async (req, res) => {
  try {
    const STUDENT_ID = req.params.id;
    const DB = await DbConnection();
    const SQL = `DELETE FROM STUDENT WHERE STUDENT_ID=?;`;
    const response = await DB.query(SQL, [STUDENT_ID]);
    return res.json({
      message: "Delete Student successful",
    });
  } catch (err) {
    console.log("Error in Delete Student", err);
    return res.status(400).json({
      message: "Error in Delete Student",
      success: false,
    });
  }
};
export const DeletTeacher = async (req, res) => {
  try {
    const TEACHER_ID = req.params.id;
    const DB = await DbConnection();
    const SQL = `DELETE FROM TEACHER WHERE TEACHER_ID=?;`;
    const response = await DB.query(SQL, [TEACHER_ID]);
    return res.json({
      message: "Delete Student successful",
    });
  } catch (err) {
    console.log("Error in Delete Student", err);
    return res.status(400).json({
      message: "Error in Delete Student",
      success: false,
    });
  }
};
export const DeleteSubject = async (req, res) => {
  try {
    const { Subject, Grade, Teacher } = req.query;
    const DB=await DbConnection()
    await DB.beginTransaction();
    const RemoveFromSubjectToTeacherSQL=`DELETE FROM TEACHER_SUBJECT_ASSIGNMENT WHERE SUBJECT_ID=? AND GRADE_ID=? AND TEACHER_ID=?;`
    await DB.query(RemoveFromSubjectToTeacherSQL,[Subject, Grade, Teacher]);
    const RemoveGradeToSubjecSQL='DELETE FROM GRADE_SUBJECT WHERE GRADE_ID=? AND SUBJECT_ID=?;'
    await DB.query(RemoveGradeToSubjecSQL,[Grade,Subject])
    const RemoveSubjectSQL='DELETE FROM SUBJECT WHERE SUBJECT_ID=?;'
    await DB.query(RemoveSubjectSQL,[Subject]);
    await DB.commit()
    return res.json({
      message: "Delete Subject successful",
    });
  } catch (err) {
    console.log("Error in Delete Subject", err);
    if (DbConnection && DbConnection.rollback) await DB.rollback();
    return res.status(400).json({
      message: "Error in Delete Subject",
      success: false,
    });
  }
};
export const GetAllStudent = async (req, res) => {
  try {
    const { GRADE } = req.body;
    const DB = await DbConnection();
    const SQL = `SELECT * FROM STUDENT;`;
    const response = await DB.query(SQL, [GRADE]);
    return res.json({
      response: response[0],
      message: "Edit Student successful",
    });
  } catch (err) {
    console.log("Error in Edit Student", err);
    return res.status(400).json({
      message: "Error in Edit Student",
      success: false,
    });
  }
};
export const GetAllTeacher = async (req, res) => {
  try {
    const DB = await DbConnection();
    const SQL = `SELECT * FROM TEACHER;`;
    const response = await DB.query(SQL);
    return res.json({
      response: response[0],
      message: "Get All Teacher successful",
    });
  } catch (err) {
    console.log("Error in Get All Teacher", err);
    return res.status(400).json({
      message: "Error in Get All Teacher",
      success: false,
    });
  }
};
export const GetAllSubject = async (req, res) => {
  try {
    const DB = await DbConnection();
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
    const response = await DB.query(SQL);
    return res.json({
      response: response[0],
      message: "Get All Subjects with grades and teachers successful",
    });
  } catch (err) {
    console.log("Error in Get All Subject", err);
    return res.status(400).json({
      message: "Error in Get All Subject",
      success: false,
    });
  }
};
export const GetAllGrade = async (rq, res) => {
  try {
    const DB = await DbConnection();
    const SQL = `SELECT * FROM GRADE;`;
    const response = await DB.query(SQL);
    return res.json({
      response: response[0],
      message: "Get All Teacher successful",
    });
  } catch (err) {
    console.log("Error in Get All Teacher", err);
    return res.status(400).json({
      message: "Error in Get All Teacher",
      success: false,
    });
  }
};
export const EditStudent = async (req, res) => {
  try {
    const { NAME, GRADE, ADDRESS, PHONENUMBER, EMAIL, PASSWORD } = req.body;
    const STUDENT_ID = req.params.id;
    const DB = await DbConnection();
    const SQL = `UPDATE STUDENT SET NAME=?,GRADE=?,ADDRESS=?,PHONENUMBER=?,EMAIL=?,PASSWORD=? WHERE STUDENT_ID=?`;
    const response = await DB.query(SQL, [
      NAME,
      GRADE,
      ADDRESS,
      PHONENUMBER,
      EMAIL,
      PASSWORD,
      STUDENT_ID,
    ]);
    return res.json({
      message: "Edit Student successful",
    });
  } catch (err) {
    console.log("Error in Edit Student", err);
    return res.status(400).json({
      message: "Error in Edit Student",
      success: false,
    });
  }
};
export const EditTeacher = async (req, res) => {
  try {
    const { NAME, EMAIL, PASSWORD } = req.body;
    const TEACHER_ID = req.params.id;
    const DB = await DbConnection();
    const SQL = `UPDATE TEACHER SET NAME=?,EMAIL=?,PASSWORD=? WHERE TEACHER_ID=?`;
    const response = await DB.query(SQL, [NAME, EMAIL, PASSWORD, TEACHER_ID]);
    return res.json({
      message: "Edit Teacher successful",
    });
  } catch (err) {
    console.log("Error in Edit Teacher", err);
    return res.status(400).json({
      message: "Error in Edit Teacher",
      success: false,
    });
  }
};
export const EditSubject = async (req, res) => {
  try {
    const { TEACHER_ID, NAME, EMAIL, PASSWORD } = req.body;
    const DB = await DbConnection();
    const SQL = `UPDATE TEACHER SET NAME=?,EMAIL=?,PASSWORD=? WHERE TEACHER_ID=?`;
    const response = await DB.query(SQL, [NAME, EMAIL, PASSWORD, TEACHER_ID]);
    return res.json({
      response: response,
      message: "Edit Teacher successful",
    });
  } catch (err) {
    console.log("Error in Edit Teacher", err);
    return res.status(400).json({
      message: "Error in Edit Teacher",
      success: false,
    });
  }
};

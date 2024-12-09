import jwt from "jsonwebtoken";
import DbConnection from "../config/Database.js";
export const SignIn = async (req, res) => {
    try {
      const { EMAIL, PASSWORD ,ROLE} = req.body;
      const DB = await DbConnection();
      const SQL = `SELECT NAME,STUDENT_ID, EMAIL FROM STUDENT WHERE EMAIL = ? AND PASSWORD = ?;`;
      const [rows] = await DB.query(SQL, [EMAIL, PASSWORD]);
      if (rows.length === 0) {
        return res.status(200).json({
          message: "Invalid credentials",
          success: false,
        });
      }
      const user = rows[0];
      const token = jwt.sign(
        { EMAIL: user.EMAIL, STUDENT_ID: user.STUDENT_ID,ROLE:ROLE},
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
        role:"Student",
        message: "Student login successful",
      });
    } catch (err) {
      console.log("Error in signin", err);
      return res.status(400).json({
        message: "Error in signin",
        success: false,
      });
    }
  };
export const GetGradeSubject=async (req, res) => {
  try{
    const {STUDENT_ID}=req.user;
    const DB=await DbConnection()
    const SQL='SELECT * FROM SUBJECT WHERE SUBJECT_ID IN(SELECT SUBJECT_ID FROM GRADE_SUBJECT WHERE GRADE_ID IN (SELECT GRADE_ID FROM GRADE WHERE GRADE_NAME IN(SELECT GRADE FROM STUDENT WHERE STUDENT_ID=?)));'
    const [rows]=await DB.query(SQL,[STUDENT_ID])
    return res.status(200).json({
      response:rows,
      message:"Get All Grade Subject Successfully",
      status:true
    });
  }catch(error){
    console.log("Error in GetGradeSubject");
    return res.status(400).json({
      message:"Error in GetGradeSubject",
      success:false
    })
  }
}
export const GetGradeSubjectAttedance=async (req, res) => {
  try{
    const {STUDENT_ID}=req.user;
    const {MONTH,SUBJECT_ID,YEAR}=req.query;
    const DB=await DbConnection()
    const SQL='SELECT * FROM ATTENDANCE WHERE STUDENT_ID=? AND MONTH(ATTENDANCE_DATE)=? AND YEAR(ATTENDANCE_DATE)=? AND SUBJECT_ID=? ORDER BY DAY(ATTENDANCE_DATE);'
    const [rows]=await DB.query(SQL,[STUDENT_ID,MONTH,YEAR,SUBJECT_ID])
    console.log(rows)
    return res.status(200).json({
      response:rows,
      message:"Get Grade Subject Attendance Successfully",
      status:true
    });
  }catch(error){
    console.log("Error in GetGradeSubjectAttedance");
    return res.status(400).json({
      message:"Error in GetGradeSubjectAttedance",
      success:false
    })
  }
}
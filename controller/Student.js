import jwt from "jsonwebtoken";
import DbConnection from "../config/Database.js";
export const SignIn = async (req, res) => {
    try {
      const { EMAIL, PASSWORD ,ROLE} = req.body;
      const DB = await DbConnection();
      const SQL = `SELECT NAME,STUDENT_ID, EMAIL FROM STUDENT WHERE EMAIL = ? AND PASSWORD = ?;`;
      const [rows] = await DB.query(SQL, [EMAIL, PASSWORD]);
      if (rows.length === 0) {
        return res.status(400).json({
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
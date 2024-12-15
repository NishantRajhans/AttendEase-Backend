import jwt from "jsonwebtoken";
import prisma from "../config/Database.js";
export const SignIn = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if(!email||!password||!role){
      return res.status(200).json({
        message: "All fields are required",
        success: false,
      });
    }
    const user = await prisma.teacher.findFirst({
      where: { email: password, email: email },
    });
    if (!user) {
      return res.status(200).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const token = jwt.sign(
      { email: user.email, teacherId: user.teacherId, role: role },
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
    console.log("Error in signin");
    return res.status(200).json({
      message: "Error in signin",
      success: false,
    });
  }
};

export const PutAttendance = async (req, res) => {
  try {
    const { studentId, subjectId, present, attendanceDate } = req.body;
    const { teacherId } = req.user;
    if(!studentId||!subjectId||!present||!attendanceDate,!teacherId){
      return res.status(200).json({
        message: "All fields are required",
        success: false,
      });
    }
    const formattedDate = new Date(attendanceDate);
    if (isNaN(formattedDate)) {
      return res.status(400).json({
        message: "Invalid attendance date format.",
      });
    }
    const attendanceExists = await prisma.attendance.findFirst({
      where: {
        studentId: Number(studentId),
        teacherId: Number(teacherId),
        attendanceDate: formattedDate,
        subjectId: Number(subjectId),
      },
    });
    if (attendanceExists) {
      return res.status(400).json({
        message: "Attendance of this date and subject is already taken.",
        success:false
      });
    }
    await prisma.attendance.create({
      data: {
        studentId: Number(studentId),
        teacherId: Number(teacherId),
        present: Boolean(present),
        attendanceDate: formattedDate,
        subjectId: Number(subjectId),
      },
    });
    return res.status(200).json({
      message: "Put Attendance successful",
      success:true
    });
  } catch (err) {
    console.log("Error in Put Attendance", err);
    return res.status(200).json({
      message: "Error in Put Attendance",
      success: false,
    });
  }
};
export const FetchAttendance = async (req, res) => {
  try {
    const { subjectId, month, year } = req.query;
    if(!subjectId||!month||!year){
      return res.status(200).json({
        message: "All fields are required",
        success: false,
      });
    }
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const rows = await prisma.attendance.findMany({
      where: {
        subjectId: Number(subjectId),
        attendanceDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: {
        attendanceDate: "asc",
      },
    });
    if (!rows) {
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
    return res.status(200).json({
      message: "Error in Fetch Attendance",
      success: false,
    });
  }
};

export const FetchTotalPresent = async (req, res) => {
  try {
    const { subjectId, month, year } = req.query;
    const { teacherId } = req.user;
    if(!subjectId||!month||!year||!teacherId){
      return res.status(200).json({
        message: "All fields are required",
        success: false,
      });
    }
    const rows = await prisma.$queryRaw`
    SELECT 
    EXTRACT(DAY FROM "Attendance"."attendanceDate") AS attendanceDay,
        COUNT("Attendance"."attendanceId") AS presentCount
          FROM "Attendance"
            LEFT JOIN "Student" ON "Student"."studentId" = "Attendance"."studentId"
              WHERE "Student".grade IN (SELECT "gradeName" FROM "Grade" INNER JOIN "GradeSubject" ON "Grade"."gradeId" = "GradeSubject"."gradeId" WHERE "GradeSubject"."subjectId" = ${Number(subjectId)})
                  AND EXTRACT(MONTH FROM "Attendance"."attendanceDate") = ${Number(month)}
                      AND EXTRACT(YEAR FROM "Attendance"."attendanceDate") = ${Number(year)}
                          AND "Attendance"."subjectId" = ${Number(subjectId)}
                              AND "Attendance"."teacherId" = ${Number(teacherId)}
                                  AND "Attendance".present = true
                                    GROUP BY attendanceDay
                                      ORDER BY attendanceDay`;
    const rowsWithNumbers = rows.map((row) => ({
      attendanceDay: Number(row.attendanceday),
      presentCount: Number(row.presentcount),
    }));
    return res.json({
      message: "Fetch Attendance successfully",
      response: rowsWithNumbers,
      success: true,
    });
  } catch (err) {
    console.log("Error in Fetch Total present", err);
    return res.status(200).json({
      message: "Error in Fetch Total present",
      success: false,
    });
  }
};

export const FetchSubject = async (req, res) => {
  try {
    const { teacherId } = req.user;
    if(!teacherId){
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    const response = await prisma.subject.findMany({
      where: {
        teacherSubjectAssignments: {
          some: {
            teacherId: teacherId,
          },
        },
      },
    });
    return res.status(200).json({
      message: "Fetch Subject successfully",
      response: response,
      success: true,
    });
  } catch (err) {
    console.log("Error in Fetch Subject");
    return res.status(200).json({
      message: "Error in Fetch Subject",
      success: false,
    });
  }
};

export const FetchStudentOfParticularSubject = async (req, res) => {
  try {
    const { subjectId } = req.query;
    if(!subjectId){
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    const rows =
      await prisma.$queryRaw`SELECT "studentId", name FROM "Student" WHERE grade IN (SELECT "gradeName" FROM "Grade" INNER JOIN "GradeSubject" ON "Grade"."gradeId" = "GradeSubject"."gradeId" WHERE "GradeSubject"."subjectId" =${ Number(subjectId)}) ORDER BY "studentId"`;
    return res.status(200).json({
      response: rows,
      message: "Student fetch Successfully",
      success: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(200).json({
      message: "Error in FetchStudentOfParticularSubject",
      success: false,
    });
  }
};

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
    const result = await prisma.administrator.findFirst({
      where: { email: email, password: password },
    });
    if (!result) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }
    const user = result;
    const token = jwt.sign(
      { email: user.email, adminId: user.adminId, role },
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
      message: "Admin login successfully",
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
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(401).json({
        message: "All fields are required",
        success: false,
      });
    }
    await prisma.teacher.create({
      data: { name: name, email: email, password: password },
    });
    return res.status(200).json({
      message: "Add Teacher successfully",
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
    const { name, grade, address, phoneNumber, email, password } = req.body;
    if (!email || !password || !name || !phoneNumber || !grade || !address) {
      return res.status(401).json({
        message: "All fields are required",
        success: false,
      });
    }
    await prisma.student.create({
      data: {
        name: name,
        grade: grade,
        address: address,
        phoneNumber: phoneNumber,
        email: email,
        password: password,
      },
    });
    return res.status(200).json({
      message: "Add Student successfully",
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
    const { subjectName, gradeId, teacherId } = req.body;
    if (!subjectName || !gradeId || !teacherId) {
      return res.status(401).json({
        message: "All fields are required",
        success: false,
      });
    }
    await prisma.$transaction(async (prisma) => {
      const subject = await prisma.subject.create({
        data: { subjectName: subjectName },
      });
      await prisma.gradeSubject.create({
        data: {
          gradeId: Number(gradeId),
          subjectId: Number(subject.subjectId),
        },
      });
      await prisma.teacherSubjectAssignment.create({
        data: {
          teacherId: Number(teacherId),
          gradeId: Number(gradeId),
          subjectId: Number(subject.subjectId),
        },
      });
    });

    return res.status(200).json({
      message: "Add Subject successfully",
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
    const { id: studentId } = req.params;
    if (!studentId) {
      return res.status(200).json({
        message: "All fields are required",
        success: false,
      });
    }
    await prisma.student.delete({ where: { studentId: Number(studentId) } });
    return res.status(200).json({
      message: "Delete Student successfully",
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
    const { id: teacherId } = req.params;
    if (!teacherId) {
      return res.status(200).json({
        message: "All fields are required",
        success: false,
      });
    }
    await prisma.teacher.delete({ where: { teacherId: Number(teacherId) } });
    return res.status(200).json({
      message: "Delete Teacher successfully",
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
    const { subjectId, gradeId, teacherId } = req.query;
    if (!subjectId || !gradeId || !teacherId) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    await prisma.$transaction(async (prisma) => {
      await prisma.teacherSubjectAssignment.delete({
        where: {
          teacherId_subjectId_gradeId: {
            teacherId: Number(teacherId),
            subjectId: Number(subjectId),
            gradeId: Number(gradeId),
          },
        },
      });
      await prisma.gradeSubject.delete({
        where: {
          gradeId_subjectId: {
            gradeId: Number(gradeId),
            subjectId: Number(subjectId),
          },
        },
      });
      await prisma.subject.delete({
        where: {
          subjectId: Number(subjectId),
        },
      });
    });
    return res.status(200).json({
      message: "Delete Subject successfully",
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
    const result = await prisma.student.findMany({});
    const students = result.map((student) => ({
      ...student,
      phoneNumber: Number(student.phoneNumber),
    }));
    return res.status(200).json({
      response: students,
      message: "Get All Students successfully",
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
    const result = await prisma.teacher.findMany({});
    return res.status(200).json({
      response: result,
      message: "Get All Teachers successfully",
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
    const result = await prisma.$queryRaw`
        SELECT s."subjectName" AS subject,
        s."subjectId" AS "subjectId", 
        g."gradeName" AS grade,
        g."gradeId" AS "gradeId", 
        t.name AS teacher,
        t."teacherId" AS "teacherId"
        FROM 
        "GradeSubject" gs
        JOIN 
        "Subject" s ON gs."subjectId" = s."subjectId"
        JOIN 
        "Grade" g ON gs."gradeId" = g."gradeId"
        LEFT JOIN 
        "TeacherSubjectAssignment" tsa ON gs."gradeId" = tsa."gradeId" AND gs."subjectId" = tsa."subjectId"
        LEFT JOIN 
        "Teacher" t ON tsa."teacherId" = t."teacherId"
        ORDER BY 
        s."subjectName", g."gradeName"`;
    return res.status(200).json({
      response: result,
      message: "Get All Subjects with grades and teachers successfully",
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
    const result = await prisma.grade.findMany({});
    return res.status(200).json({
      response: result,
      message: "Get All grades successfully",
      success: true,
    });
  } catch (err) {
    console.error("Error in Get All grades", err);
    return res.status(500).json({
      message: "Error in Get All grades",
      success: false,
    });
  }
};

export const EditStudent = async (req, res) => {
  try {
    const { name, grade, address, phoneNumber, email, password } = req.body;
    const { id: studentId } = req.params;
    if (
      !name ||
      !grade ||
      !address ||
      !phoneNumber ||
      !email ||
      !password ||
      !studentId
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    await prisma.student.update({
      where: { studentId: Number(studentId) },
      data: {
        name: name,
        grade: grade,
        address: address,
        phoneNumber: phoneNumber,
        email: email,
        password: password,
      },
    });
    return res.status(200).json({
      message: "Edit Student successfully",
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
    const { name, email, password } = req.body;
    const { id: teacherId } = req.params;
    if (!name || !email || !password || !teacherId) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    await prisma.teacher.update({
      where: { teacherId: Number(teacherId) },
      data: { name: name, email: email, password: password },
    });
    return res.status(200).json({
      message: "Edit Teacher successfully",
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
    const { teacherId, subjectName, gradeId } = req.body;
    const { id: subjectId } = req.params;
    if (!teacherId || !subjectName || !gradeId || !subjectId) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Edit Subject successfully",
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

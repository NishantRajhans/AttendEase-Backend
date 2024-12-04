import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
dotenv.config()
export const AuthMiddleware = async (req, res, next) => {
	try {
		const token =req.header("authorization").split(" ")[1]
		if (!token) {
			return res.status(401).json({ success: false, message: `Token Missing` });
		}
		try {
			const decode = jwt.verify(token, process.env.JWT_SECRET);
			req.user = decode;
			if(req.user.ROLE!="Student"){
				return res.status(401).json({
					message:"This route is Student protected"
				})
			}
		} catch (error) {
			return res
				.status(401)
				.json({ success: false, message: "token is invalid" });
		}
		next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Student Token`,
		});
	}
};

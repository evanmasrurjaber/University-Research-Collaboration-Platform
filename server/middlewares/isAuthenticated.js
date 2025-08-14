import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try{
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({success: false, message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({success: false, message: "invalid token" });
        }
        req.user = { id: decoded.userId };
        next();
    } catch (error) {
        return res.status(500).json({success: false, message: error.message });
    }
}
export default isAuthenticated;
import jwt from "jsonwebtoken"
export const isAuthenticate = async(req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "Authentication failed",
                success: false
            });
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.id = decoded.userId;
        next();
    } catch (error) {
        console.log(error)
    }
}
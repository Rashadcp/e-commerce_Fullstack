import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    let token;
    console.log("Protect middleware hit. Auth header:", req.headers.authorization);

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Token decoded:", decoded);
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                console.log("User not found in DB for ID:", decoded.id);
                return res.status(401).json({ message: "Not authorized, user not found" });
            }

            if (req.user.blocked) {
                console.log("User is blocked:", req.user.email);
                return res.status(403).json({ message: "User is blocked" });
            }

            console.log("User authorized:", req.user.email);
            next();
        } catch (error) {
            console.error("Auth error:", error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        console.log("No token provided");
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

export const admin = (req, res, next) => {
    if (req.user && (req.user.isAdmin || req.user.email === "admin@refuel.com")) {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as an admin" });
    }
};

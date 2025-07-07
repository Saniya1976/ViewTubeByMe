import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/user.controller.js";
const router = Router();
import { upload } from "../middlewares/multer.middleware.js";

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
export default router; 

import { response } from "../utils/response.js";
import { AuthModel } from "../models/auth.model.js";
import { signToken } from "../middleware/auth.js";

/**
 * POST /api/auth/login  { userId, password }
 * Replaces: set_login.php
 */
export async function login(req, res) {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return response.error(res, "userId and password are required", 400);
    }

    const user = await AuthModel.findActiveUser(userId, password);

    if (!user) {
      return response.error(res, "Invalid Username or Password!", 401);
    }

    if (!["admin", "pcb", "real_estate"].includes(user.userType)) {
      return response.error(res, "You don't have login permission!", 403);
    }

    const token = signToken({
      userId: user.userId,
      username: user.userName,
      userType: user.userType,
      stateId: user.stateId,
    });

    return response.success(res, "Login successful", {
      token,
      userType: user.userType,
      username: user.userName,
    });
  } catch (err) {
    return response.error(res, `Login failed: ${err.message}`);
  }
}

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

/**
 * Replaces the legacy `connection/session_*_for_logout.php` includes,
 * which checked $_SESSION['user_type'] against the portal being accessed
 * and redirected to login otherwise, e.g.:
 *
 *   $us_type = $_SESSION['user_type'];
 *   if ($us_type != 'admin') { header('location:../index.php'); }
 *
 * Usage: router.use(requireAuth(['admin'])) or requireAuth(['pcb','admin'])
 * to allow more than one user_type through a route.
 */
export function requireAuth(allowedUserTypes = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ status: false, message: "Missing auth token", data: null });
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);

      if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(payload.userType)) {
        return res
          .status(403)
          .json({ status: false, message: "Not authorized for this portal", data: null });
      }

      req.user = {
        userId: payload.userId,
        username: payload.username,
        userType: payload.userType,
        stateId: payload.stateId ?? null,
      };

      next();
    } catch (err) {
      return res.status(401).json({ status: false, message: "Invalid or expired token", data: null });
    }
  };
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

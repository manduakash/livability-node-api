import { response } from "../utils/response.js";
import { UserMasterModel } from "../models/userMaster.model.js";
import { RealEstateMasterModel } from "../models/realEstateMaster.model.js";
import { logAudit } from "../utils/auditLog.js";

/** GET /api/:portal/users?userType=pcb&stateId=1 */
export async function listUsers(req, res) {
  try {
    const { userType, stateId } = req.query;

    let rows;
    if (userType && stateId) {
      rows = await UserMasterModel.listByTypeAndState(userType, Number(stateId));
    } else if (userType) {
      rows = await UserMasterModel.listByType(userType);
    } else {
      rows = await UserMasterModel.listAll();
    }

    return response.success(res, "Users fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch users: ${err.message}`);
  }
}

/** GET /api/:portal/users/:id */
export async function getUser(req, res) {
  try {
    const id = Number(req.params.id);
    const row = await UserMasterModel.getById(id);
    if (!row) return response.error(res, "User not found", 404);
    return response.success(res, "User fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch user: ${err.message}`);
  }
}

/** POST /api/:portal/users  { userName, userId, password, userType, stateId, phone, website, email } */
export async function createUser(req, res) {
  try {
    const { userName, userId, password } = req.body;
    if (!userName || !userId || !password) {
      return response.error(res, "userName, userId, and password are required", 400);
    }

    const existing = await UserMasterModel.getByUserId(userId);
    if (existing) {
      return response.error(res, "A user with this userId already exists", 409);
    }

    const id = await UserMasterModel.create(req.body);

    await logAudit(req, {
      type: "ADD",
      lnk: "add_user_master_admin.php",
      panel: req.portal.toUpperCase(),
      module: `Add_user_${userName}`,
    });

    return response.success(res, "User created", { id }, 201);
  } catch (err) {
    return response.error(res, `Failed to create user: ${err.message}`);
  }
}

/** PUT /api/:portal/users/:id  { userName, userId, password, userType } */
export async function updateUser(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await UserMasterModel.update(id, req.body);
    if (!result) return response.error(res, "User not found", 404);

    await logAudit(req, {
      type: "EDIT",
      lnk: "edit_user_master_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_user_master",
    });

    return response.success(res, "User updated", result);
  } catch (err) {
    return response.error(res, `Failed to update user: ${err.message}`);
  }
}
/** GET /api/:portal/users/:userId/profile */
export async function getProfile(req, res) {
  try {
    const { userId } = req.params;
    const row = await UserMasterModel.getByUserId(userId);
    if (!row) return response.error(res, "User not found", 404);

    const realEstateRow = await RealEstateMasterModel.getByUsername(row.userName);

    const profileData = {
      userName: row.userName,
      userId: row.userId,
      phone: row.phone,
      website: row.website,
      email: row.email,
      profilePhoto: realEstateRow?.profilePhoto || "",
    };

    return response.success(res, "Profile fetched", profileData);
  } catch (err) {
    return response.error(res, `Failed to fetch profile: ${err.message}`);
  }
}

/** PATCH /api/:portal/users/:userId/profile  { phone, website, email, password } */
export async function updateProfile(req, res) {
  try {
    const { userId } = req.params;
    const { phone, website, email, password } = req.body;

    const row = await UserMasterModel.getByUserId(userId);
    if (!row) return response.error(res, "User not found", 404);

    await UserMasterModel.updateProfile(row.userName, { phone, website, email });
    
    if (password) {
      await UserMasterModel.updatePassword(row.userName, password);
    }

    return response.success(res, "Profile updated successfully");
  } catch (err) {
    return response.error(res, `Failed to update profile: ${err.message}`);
  }
}

/** PATCH /api/:portal/users/:userName/password  { newPassword } */
export async function changePassword(req, res) {
  try {
    const { userName } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) return response.error(res, "newPassword is required", 400);

    await UserMasterModel.updatePassword(userName, newPassword);
    return response.success(res, "Password changed", { userName });
  } catch (err) {
    return response.error(res, `Failed to change password: ${err.message}`);
  }
}

/** DELETE /api/:portal/users/:id */
export async function removeUser(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await UserMasterModel.remove(id);
    if (!existing) return response.error(res, "User not found", 404);

    await logAudit(req, {
      type: "DELETE",
      lnk: "user_master_delete.php",
      panel: req.portal.toUpperCase(),
      module: `Delete_user_${existing.userName}`,
    });

    return response.success(res, "User deleted", existing);
  } catch (err) {
    return response.error(res, `Failed to delete user: ${err.message}`);
  }
}

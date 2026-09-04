import express from "express";
import { loginUser, registerUser } from "../controller/userController";
import requireAuth from "../middleware/auth";
import {
  checkSlugExist,
  createWorkspace,
  deleteWorkspace,
  getAllMembersAndRole,
  updateWorkspace,
} from "../controller/workspaceController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/createWorkspace", requireAuth, createWorkspace);
router.post("/checkSlug", requireAuth, checkSlugExist);
router.get("/workspace/:slug", requireAuth);
router.get("/workspace/:slug/join");
router.patch("/workspaces/:slug", updateWorkspace);
router.delete("/workspace/:slug", deleteWorkspace);

// Get all members & role
router.get("/workspace/:slug/members", getAllMembersAndRole);


// Channel routes

export default router;

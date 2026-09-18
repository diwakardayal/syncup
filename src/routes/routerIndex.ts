import express from "express";
import { loginUser, registerUser } from "../controller/userController";
import requireAuth from "../middleware/auth";
import {
  checkSlugExist,
  createWorkspace,
  deleteWorkspace,
  getAllMembersAndRole,
  getWorkspace,
  updateWorkspace,
} from "../controller/workspaceController";
import {
  createChannel,
  deleteChannel,
  getChannel,
  joinPrivateChannel,
  listChannels,
  listPrivateChannelMembers,
} from "../controller/channelController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/workspace", requireAuth, createWorkspace);
router.post("/checkSlug", requireAuth, checkSlugExist);
router.get("/workspace/:slug", requireAuth);
// router.get("/workspace/:slug/join");
router.patch("/workspaces/:slug", requireAuth, updateWorkspace);
router.delete("/workspaces/:slug", requireAuth, deleteWorkspace);

// Get all members & role
router.get("/workspaces/:slug/members", requireAuth, getAllMembersAndRole);
router.post(" /workspaces/:slug/channel", requireAuth, createChannel);
router.get("/workspaces/:slug/listChannel", requireAuth, listChannels);
router.get("/channel/:channelId", requireAuth, listChannels);
router.get("/workspace/:slug", requireAuth, getWorkspace);

// Channel routes
router.get("/channel/:channelId", requireAuth, getChannel);
router.get("/channel/:channelId/join", requireAuth, joinPrivateChannel);
router.get("/channel/:channelId/delete", requireAuth, deleteChannel);
router.get(
  "/channel/:channelId/members",
  requireAuth,
  listPrivateChannelMembers,
); //listPrivateChannelMembers

// Channel routes

export default router;

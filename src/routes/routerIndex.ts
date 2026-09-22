import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/userController";
import requireAuth from "../middleware/auth";
import {
  checkSlugExist,
  createWorkspace,
  deleteWorkspace,
  getAllMembersAndRole,
  getWorkspace,
  joinWorkspace,
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
import {
  deleteOwnMessage,
  getMessageHistory,
  sendMessage,
  threadReply,
} from "../controller/messageController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.post("/workspace", requireAuth, createWorkspace);
router.post("/checkSlug", requireAuth, checkSlugExist);
router.get("/workspace/:slug", requireAuth, getWorkspace);
router.patch("/workspace/:slug", requireAuth, updateWorkspace);
router.delete("/workspace/:slug", requireAuth, deleteWorkspace);
router.get("/workspace/:slug/members", requireAuth, getAllMembersAndRole);
router.post("/workspace/:slug/join", requireAuth, joinWorkspace);

router.post("/workspace/:slug/channel", requireAuth, createChannel);
router.get("/workspace/:slug/channels", requireAuth, listChannels);
router.get("/channel/:channelId", requireAuth, getChannel);
router.post("/channel/:channelId/join", requireAuth, joinPrivateChannel);
router.delete("/channel/:channelId", requireAuth, deleteChannel);
router.get("/channel/:channelId/members", requireAuth, listPrivateChannelMembers);

router.get("/channel/:channelId/messages", requireAuth, getMessageHistory);
router.post("/channel/:channelId/messages", requireAuth, sendMessage);
router.get("/message/:messageId/replies", requireAuth, threadReply);
router.delete("/message/:messageId", requireAuth, deleteOwnMessage);

export default router;
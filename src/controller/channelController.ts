import { z } from "zod";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import asyncHandler from "../middleware/asyncHandler";
import { slugify } from "../utils/slugify";
import {
  channelParamsSchema,
  createChannelBodySchema,
  slugParamsSchema,
} from "../schemas/channel.schema";

const createChannel = asyncHandler(async (req, res) => {
  const paramsResult = slugParamsSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({
      message: "Invalid slug",
      errors: z.treeifyError(paramsResult.error),
    });
    return;
  }

  const bodyResult = createChannelBodySchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({
      message: "Invalid input",
      errors: z.treeifyError(bodyResult.error),
    });
    return;
  }

  const { slug } = paramsResult.data;
  const { name, isPrivate } = bodyResult.data;

  const existingWorkspace = await prisma.workspace.findUnique({
    where: { slug: slug },
  });

  if (!existingWorkspace) {
    res.status(404).json({ message: "workspace not found" });
    return;
  }

  // next: find workspace by slug, auth check, create channel

  const channel = await prisma.channel.create({
    data: {
      name,
      isPrivate,
      workspaceId: existingWorkspace.id,
      userId: req.user!.id,
    },
  });

  res.status(201).json({ channel });
});

const listChannels = asyncHandler(async (req, res) => {
  const paramsResult = slugParamsSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({
      message: "Invalid slug",
      errors: z.treeifyError(paramsResult.error),
    });
    return;
  }

  const { slug } = paramsResult.data;

  const existingWorkspace = await prisma.workspace.findUnique({
    where: { slug },
  });

  if (!existingWorkspace) {
    res.status(404).json({ message: "Workspace not found" });
    return;
  }

  const channel = await prisma.channel.findMany({
    where: { workspaceId: existingWorkspace.id },
  });

  res.status(200).json({ channel });
});

const getChannel = asyncHandler(async (req, res) => {
  const channelParamsSchema = z.object({
    channelId: z.coerce.number(),
  });

  const paramsResult = channelParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    res.status(400).json({
      message: "Invalid channel id",
      errors: z.treeifyError(paramsResult.error),
    });
    return;
  }

  const { channelId } = req.params;

  const channel = await prisma.channel.findUnique({ where: { id: channelId } });

  if (!channel) {
    res.status(404).json({ message: "Channel not found" });
    return;
  }
  res.status(200).json({ channel });
});

const joinPrivateChannel = asyncHandler(async (req, res) => {
  const paramsResult = channelParamsSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({
      message: "Invalid channel id",
      errors: z.treeifyError(paramsResult.error),
    });
    return;
  }

  const { channelId } = paramsResult.data;

  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
  });

  if (!channel) {
    res.status(404).json({ message: "Channel not found" });
    return;
  }

  const workspaceMembership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: req.user.id,
        workspaceId: channel.workspaceId,
      },
    },
  });

  if (!workspaceMembership) {
    res
      .status(403)
      .json({ message: "You must be a workspace member to join this channel" });
    return;
  }

  const existingChannelMembership = await prisma.channelMembership.findUnique({
    where: {
      userId_channelId: {
        userId: req.user.id,
        channelId: channel.id,
      },
    },
  });

  if (existingChannelMembership) {
    res.status(409).json({ message: "Already a member of this channel" });
    return;
  }

  const channelMembership = await prisma.channelMembership.create({
    data: {
      userId: req.user.id,
      channelId: channel.id,
    },
  });

  res.status(201).json({ channelMembership });
});

const deleteChannel = asyncHandler(async (req, res) => {
  const paramsResult = channelParamsSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({
      message: "Invalid channel id",
      errors: z.treeifyError(paramsResult.error),
    });
    return;
  }

  const { channelId } = paramsResult.data;

  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
  });

  if (!channel) {
    res.status(404).json({ message: "Channel not found" });
  }

  await prisma.channel.delete({
    where: { id: channelId },
  });

  res.status(200).json({ message: "Channel is deleted" });
});

const listPrivateChannelMembers = asyncHandler(async (req, res) => {
  const paramsResult = channelParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    res.status(400).json({ message: "Please provide channel id" });
    return;
  }
  const { channelId } = paramsResult.data;

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
  });

  if (!channel) {
    res.status(404).json({ message: "Channel not found" });
    return;
  }

  // find the members from particular channel

  const members = await prisma.channelMembership.findMany({
    where: { channelId: channel.id },
    select: {
      joinedAt: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  res.status(200).json({ members });
});

export {
  createChannel,
  listChannels,
  getChannel,
  joinPrivateChannel,
  deleteChannel,
  listPrivateChannelMembers,
};

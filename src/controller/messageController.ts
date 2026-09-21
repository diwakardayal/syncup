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

const getMessagesParamsSchema = z.object({
  channelId: z.coerce.number(),
});

const getMessageHistory = asyncHandler(async (req, res) => {
  const paramsResult = getMessagesParamsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    res.status(400).json({
      message: "Invalid channel id",
      error: z.treeifyError(paramsResult.error),
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

  if (channel?.isPrivate) {
    const channelMembership = await prisma.channelMembership.findUnique({
      where: {
        userId_channelId: {
          userId: req.user.id,
          channelId: channel.id,
        },
      },
    });

    if (!channelMembership) {
      res
        .status(403)
        .json({ message: "You don't have access to this channel" });
    }
  }

  const message = await prisma.message.findMany({
    where: {
      channelId: channel.id,
      threadParentId: null,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: { id: true, name: true },
      },
    },
  });

  res.status(200).json({ message });
});

const sendMessageBodySchema = z.object({
  content: z.string().min(1),
  threadParentId: z.number().optional(),
});

const sendMessage = asyncHandler(async (req, res) => {
  const paramsResult = channelParamsSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({
      message: "Invalid channel id",
      errors: z.treeifyError(paramsResult.error),
    });
    return;
  }

  const bodyResult = sendMessageBodySchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({
      message: "Invalid message content",
      errors: z.treeifyError(bodyResult.error),
    });
    return;
  }

  const { channelId } = paramsResult.data;
  const { content, threadParentId } = bodyResult.data;

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

  if (channel.isPrivate) {
    const channelMembership = await prisma.channelMembership.findUnique({
      where: {
        userId_channelId: {
          userId: req.user.id,
          channelId: channel.id,
        },
      },
    });

    if (!channelMembership) {
      res.status(403).json({ message: "You don't have access to this channel" });
      return;
    }
  }

  const message = await prisma.message.create({
    data: {
      content,
      channelId: channel.id,
      userId: req.user.id,
      threadParentId: threadParentId ?? null,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      threadParentId: true,
      user: {
        select: { id: true, name: true },
      },
    },
  });

  res.status(201).json({ message });
});

const threadReplyParamsSchema = z.object({
  messageId: z.coerce.number(),
});

const threadReply = asyncHandler(async (req, res) => {
  const paramsResult = threadReplyParamsSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ message: "Invalid message id", errors: z.treeifyError(paramsResult.error) });
    return;
  }

  const { messageId } = paramsResult.data;

  const parentMessage = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!parentMessage) {
    res.status(404).json({ message: "Message not found" });
    return;
  }

  const replies = await prisma.message.findMany({
    where: { threadParentId: messageId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
    },
  });

  res.status(200).json({ replies });
});

const deleteOwnMessage = asyncHandler(async (req, res) => {
  const paramsResult = threadReplyParamsSchema.safeParse(req.params); // reuses same { messageId } shape
  if (!paramsResult.success) {
    res.status(400).json({ message: "Invalid message id", errors: z.treeifyError(paramsResult.error) });
    return;
  }

  const { messageId } = paramsResult.data;

  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    res.status(404).json({ message: "Message not found" });
    return;
  }

  if (message.userId !== req.user.id) {
    res.status(403).json({ message: "You can only delete your own messages" });
    return;
  }

  await prisma.message.delete({ where: { id: messageId } });

  res.status(204).send();
});

export { getMessageHistory, sendMessage, threadReply, deleteOwnMessage };

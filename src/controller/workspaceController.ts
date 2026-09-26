import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import asyncHandler from "../middleware/asyncHandler";
import { slugify } from "../utils/slugify";

const listWorkspaces = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const memberships = await prisma.membership.findMany({
    where: {
      userId: req.user.id,
    },
    select: {
      role: true,
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  res.status(200).json({
    memberships,
  });
});

const getWorkspaces = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const userSlug = req.body.slug;

  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // check if the userSlug exist in db
  const validatedSlug = slugify(userSlug);

  const existing = await prisma.workspace.findUnique({
    where: { slug: validatedSlug },
  });

  if (existing) {
    res.status(409).json({ message: "Choose new slug / Workspace exist" });
    return;
  }

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug: validatedSlug,
      ownerId: req.user?.id,
      memberships: {
        create: {
          userId: req.user?.id,
          role: "ADMIN",
        },
      },
    },
  });

  res.status(201).json({ workspace });
});

const createWorkspace = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const userSlug = req.body.slug;

  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // check if the userSlug exist in db
  const validatedSlug = slugify(userSlug);

  const existing = await prisma.workspace.findUnique({
    where: { slug: validatedSlug },
  });

  if (existing) {
    res.status(409).json({ message: "Choose new slug / Workspace exist" });
    return;
  }

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug: validatedSlug,
      ownerId: req.user?.id,
      memberships: {
        create: {
          userId: req.user?.id,
          role: "ADMIN",
        },
      },
    },
  });

  res.status(201).json({ workspace });
});

const checkSlugExist = asyncHandler(async (req, res) => {
  const slugName = req.body.slug;

  const validatedSlug = slugify(slugName);
  const existing = await prisma.workspace.findUnique({
    where: { slug: validatedSlug },
  });

  if (!existing) {
    res.status(200).json({ message: "This slug is avaiable" });
    return;
  }

  res.status(409).json({ message: "Choose new slug" });
});

const joinWorkspace = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!slug || typeof slug != "string") {
    res.status(400).json({ message: "Please provide input" });
    return;
  }

  const validatedSlug = slugify(slug);

  const workspace = await prisma.workspace.findUnique({
    where: { slug: validatedSlug },
  });

  if (!workspace) {
    res.status(404).json({ message: "Workspace doesn't exist" });
    return;
  }

  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const existingMembership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: req.user.id,
        workspaceId: workspace.id,
      },
    },
  });

  if (existingMembership) {
    res.status(409).json({ message: "Already a member of this workspace" });
  }

  const membership = await prisma.membership.create({
    data: {
      userId: req.user.id,
      workspaceId: workspace.id,
      role: "MEMBER",
    },
  });

  res.status(201).json({ membership });
});

const getWorkspace = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  // check if workspace exist

  if (!slug || typeof slug != "string") {
    res.status(400).json({ message: "Please provide input" });
    return;
  }

  const validatedSlug = slugify(slug);

  const existing = await prisma.workspace.findUnique({
    where: { slug: validatedSlug },
  });

  if (!existing) {
    res.status(404).json({ message: "Workspace doesnt exist" });
    return;
  }

  res.status(200).json({ workspace: existing });
});

const updateWorkspace = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { name } = req.body;

  if (!slug || typeof slug != "string" || !name) {
    res.status(400).json({ message: "Please provide input fields" });
    return;
  }

  const existingWorkspace = await prisma.workspace.findUnique({
    where: { slug: slug },
  });

  if (!existingWorkspace) {
    res.status(404).json({ Message: "Workspace not found" });
    return;
  }

  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: req.user.id,
        workspaceId: existingWorkspace.id,
      },
    },
  });

  if (!membership || membership.role !== "ADMIN") {
    res
      .status(403)
      .json({ message: "Only workspace admins can update this workspace" });
    return;
  }

  const updatedWorkspace = await prisma.workspace.update({
    where: { slug: slug },
    data: { name: name },
  });

  res.status(200).json({ message: "Workspace updated" });
});

const deleteWorkspace = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!slug || typeof slug != "string") {
    res.status(400).json({ message: "Please provide input fields" });
    return;
  }

  const existingWorkspace = await prisma.workspace.findUnique({
    where: { slug: slug },
  });

  if (!existingWorkspace) {
    res.status(404).json({ Message: "Workspace not found" });
    return;
  }

  if (existingWorkspace.ownerId !== req.user?.id) {
    res.status(403).json({ message: "Not authorized to delete workspace" });
    return;
  }

  const deletedWorkedspace = await prisma.workspace.delete({
    where: {
      slug: slug,
    },
  });

  res.status(200).json({ message: "Workspace has been deleted succesfully" });
});

const getAllMembersAndRole = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!slug || typeof slug !== "string") {
    res.status(400).json({ message: "Provide slug" });
    return;
  }

  const validatedSlug = slugify(slug);

  const existing = await prisma.workspace.findUnique({
    where: { slug: validatedSlug },
  });

  if (!existing) {
    res.status(404).json({ message: "Workspace not found" });
    return;
  }

  const members = await prisma.membership.findMany({
    where: { workspaceId: existing.id },
    select: {
      role: true,
      joinedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  res.status(200).json({ members });
});

export {
  getWorkspaces,
  createWorkspace,
  checkSlugExist,
  getWorkspace,
  joinWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getAllMembersAndRole,
};

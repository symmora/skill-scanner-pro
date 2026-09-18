import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { analyzeSkill } from "./analyzer";
import type { Finding, RiskLevel, SkillKind } from "./schema";

export const submitSkill = mutation({
  args: {
    name: v.string(),
    kind: v.union(
      v.literal("tool"),
      v.literal("mcp"),
      v.literal("prompt"),
      v.literal("extension"),
    ),
    description: v.optional(v.string()),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const name = args.name.trim();
    if (name.length === 0) {
      throw new Error("Skill name is required");
    }
    const body = args.body.trim();
    if (body.length === 0) {
      throw new Error("Skill content is required");
    }

    const analysis = analyzeSkill({
      name,
      description: args.description?.trim() || undefined,
      kind: args.kind,
      body,
    });

    const skillId = await ctx.db.insert("scannedSkills", {
      userId,
      name,
      description: args.description?.trim() || undefined,
      kind: args.kind,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel as RiskLevel,
      findings: analysis.findings as Finding[],
      analyzedAt: Date.now(),
    });

    return {
      id: skillId,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
    };
  },
});

export const listMySkills = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }
    // Risk score list: highest risk first, then newest.
    const docs = await ctx.db
      .query("scannedSkills")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return docs.sort(
      (a, b) => b.riskScore - a.riskScore || b.analyzedAt - a.analyzedAt,
    );
  },
});

export const removeSkill = mutation({
  args: { id: v.id("scannedSkills") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    const skill = await ctx.db.get(id);
    if (skill === null) {
      throw new Error("Skill not found");
    }
    if (skill.userId !== userId) {
      throw new Error("Not authorized");
    }
    await ctx.db.delete(id);
  },
});

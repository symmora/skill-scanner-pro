import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

export const SKILL_KINDS = {
  SKILL: "skill",
  MCP: "mcp",
  HOOK: "hook",
  SUBAGENT: "subagent",
} as const;

export const skillKindValidator = v.union(
  v.literal(SKILL_KINDS.SKILL),
  v.literal(SKILL_KINDS.MCP),
  v.literal(SKILL_KINDS.HOOK),
  v.literal(SKILL_KINDS.SUBAGENT),
);
export type SkillKind = Infer<typeof skillKindValidator>;

export const RISK_LEVELS = {
  NONE: "none",
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export const riskLevelValidator = v.union(
  v.literal(RISK_LEVELS.NONE),
  v.literal(RISK_LEVELS.LOW),
  v.literal(RISK_LEVELS.MEDIUM),
  v.literal(RISK_LEVELS.HIGH),
  v.literal(RISK_LEVELS.CRITICAL),
);
export type RiskLevel = Infer<typeof riskLevelValidator>;

export const findingValidator = v.object({
  ruleId: v.string(), // e.g. "CMD_OBFUSCATION"
  title: v.string(),
  detail: v.string(), // what matched and why it matters
  severity: v.number(), // 0-100 contribution to the risk score
  evidence: v.array(v.string()), // matched text snippets, quoted
});
export type Finding = Infer<typeof findingValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // add other tables here

    // Skills scanned by the user through the scanner.
    scannedSkills: defineTable({
      userId: v.id("users"),
      name: v.string(),
      description: v.optional(v.string()),
      kind: skillKindValidator,
      riskScore: v.number(), // 0-100
      riskLevel: riskLevelValidator,
      findings: v.array(findingValidator),
      analyzedAt: v.number(), // ms epoch
    })
      .index("by_user", ["userId"])
      .index("by_user_risk", ["userId", "riskScore"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;

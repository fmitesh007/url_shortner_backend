const { z } = require("zod");

const baseUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 chars"),
});

const userSchemaZod = baseUserSchema;
module.exports = {
  userSchemaZod,
};

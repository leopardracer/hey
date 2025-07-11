import { Status } from "@hey/data/enums";
import type { Context } from "hono";
import handleApiError from "../../utils/handleApiError";

const authorization = async (ctx: Context) => {
  try {
    const authHeader = ctx.req.raw.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ctx.json({ status: Status.Error, error: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1];

    if (token !== process.env.SHARED_SECRET) {
      return ctx.json(
        { status: Status.Error, error: "Invalid shared secret" },
        401
      );
    }

    return ctx.json({
      allowed: true,
      sponsored: true,
      signingKey: process.env.PRIVATE_KEY
    });
  } catch {
    return handleApiError(ctx);
  }
};

export default authorization;

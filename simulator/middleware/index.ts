import type { NextFunction, Request, Response } from "express";

function statusOf(error: unknown): number {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number" && Number.isInteger(status)) {
      return status;
    }
  }
  return 500;
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  const status = statusOf(error);
  if (status >= 500) {
    console.error(error);
  }

  const message =
    error instanceof Error ? error.message : "Internal server error.";
  res.status(status).json({ error: message });
}

import type { NextFunction, Request, Response } from "express";
import { deviceService } from "../services";

/** HTTP layer only: translate a request into a service call; errors go to next(). */
export class Controller {
  static list(_req: Request, res: Response, next: NextFunction): void {
    try {
      res.status(200).json(deviceService.list());
    } catch (error) {
      next(error);
    }
  }

  static show(req: Request, res: Response, next: NextFunction): void {
    try {
      res.status(200).json(deviceService.getState(req.params.id as string));
    } catch (error) {
      next(error);
    }
  }

  static setState(req: Request, res: Response, next: NextFunction): void {
    try {
      const state = deviceService.apply(req.params.id as string, req.body, {
        source: "app",
      });
      res.status(200).json(state);
    } catch (error) {
      next(error);
    }
  }

  static adminState(req: Request, res: Response, next: NextFunction): void {
    try {
      const state = deviceService.apply(req.params.id as string, req.body, {
        source: "admin",
      });
      res.status(200).json(state);
    } catch (error) {
      next(error);
    }
  }
}

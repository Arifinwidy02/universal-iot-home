import express from "express";
import { Controller } from "../controller";

export const router = express.Router();

router.get("/devices", Controller.list);
router.get("/devices/:id", Controller.show);
router.post("/devices/:id/set", Controller.setState);

router.post("/admin/devices/:id/state", Controller.adminState);

import { Router } from "express";
import { events } from "../models/event";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json(events);
});

export default router;

import express from "express";
import {
	downloadReport,
	generateReport,
	generateReportOnDashboard,
} from "../controller/salesReportController.js";
const router = express.Router();

router.get("/generate-report", generateReport);
router.get("/download-report", downloadReport);
router.get("/generate-dashboard-report", generateReportOnDashboard);

export default router;

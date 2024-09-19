import moment from "moment";
import Order from "../model/orderSchema.js";
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import { error } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getSalesReport = async (startDate, endDate, period) => {
	let start, end;

	if (period === "day") {
		start = moment().startOf("day");
		end = moment().endOf("day");
	} else if (period === "week") {
		start = moment().startOf("week");
		end = moment().endOf("week");
	} else if (period === "month") {
		start = moment().startOf("month");
		end = moment().endOf("month");
	} else if (period === "year") {
		start = moment().startOf("year");
		end = moment().endOf("year");
	} else if (startDate && endDate) {
		start = moment(startDate).startOf("day");
		end = moment(endDate).endOf("day");
	} else {
		throw new Error("Invalid date range");
	}

	const orders = await Order.find({
		createdAt: { $gte: start.toDate(), $lte: end.toDate() },
	});

	const overallSalesCount = orders.length;
	const overallOrderAmount = orders.reduce(
		(acc, order) => acc + order.theTotelAmount,
		0
	);
	const overallDiscount = orders.reduce(
		(acc, order) => acc + order.discount,
		0
	);
	const totalDiscountOnMRP = orders.reduce(
		(acc, order) => acc + order.discountedAmount,
		0
	);

	return {
		overallSalesCount,
		overallOrderAmount,
		overallDiscount,
		totalDiscountOnMRP,
		orders,
	};
};

const generateReport = async (req, res) => {
	try {
		const { startDate, endDate, period } = req.query;

		const reportData = await getSalesReport(startDate, endDate, period);

		res.status(200).json({
			message: "Order fetched successfully",
			report: reportData,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const downloadReport = async (req, res) => {
	try {
		const { format, startDate, endDate, period } = req.query;
		const reportData = await getSalesReport(startDate, endDate, period);

		if (format === "xlsx") {
			const workbook = new ExcelJS.Workbook();
			const worksheet = workbook.addWorksheet("Sales Report");

			worksheet.columns = [
				{ header: "Order ID", key: "_id", width: 30 },
				{ header: "Date", key: "createdAt", width: 25 },
				{ header: "Total Amount", key: "theTotelAmount", width: 20 },
				{ header: "Discount", key: "discount", width: 20 },
				{ header: "Discount on MRP", key: "discountedAmount", width: 25 },
			];

			reportData.orders.forEach((order) => {
				worksheet.addRow({
					_id: order._id,
					createdAt: moment(order.createdAt).format("YYYY-MM-DD HH:mm:ss"),
					theTotelAmount: order.theTotelAmount,
					discount: order.discount,
					discountedAmount: order.discountedAmount,
				});
			});

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			);
			res.setHeader(
				"Content-Disposition",
				"attachment; filename=sales_report.xlsx"
			);

			await workbook.xlsx.write(res);
			res.end();
		} else if (format === "pdf") {
			const doc = new PDFDocument({ margin: 40, size: "A4" });

			res.setHeader("Content-Type", "application/pdf");
			res.setHeader(
				"Content-Disposition",
				"attachment; filename=sales_report.pdf"
			);

			doc.pipe(res);

			doc
				.fontSize(22)
				.text("Sales Report", { align: "center", underline: true });
			doc.moveDown(2);

			doc.fontSize(12).text(`Sales Count: ${reportData.overallSalesCount}`);
			doc.fontSize(12).text(`Order Amount: ${reportData.overallOrderAmount}`);
			doc.fontSize(12).text(`Discount: ${reportData.overallDiscount}`);
			doc
				.fontSize(12)
				.text(`Discount on MRP: ${reportData.totalDiscountOnMRP}`);
			doc.moveDown(2);

			const tableTop = doc.y;
			const columnWidth = {
				_id: 80,
				createdAt: 130,
				theTotelAmount: 100,
				discount: 100,
				discountedAmount: 130,
			};
			const rowHeight = 25;
			const headerBgColor = "#f2f2f2";

			doc.rect(30, tableTop, 570, rowHeight).fill(headerBgColor).stroke();

			doc
				.fillColor("black")
				.fontSize(14)
				.text("Order ID", 35, tableTop + 10, {
					width: columnWidth._id,
					align: "left",
				})
				.text("Date", 35 + columnWidth._id, tableTop + 10, {
					width: columnWidth.createdAt,
					align: "left",
				})
				.text(
					"Total Amount",
					35 + columnWidth._id + columnWidth.createdAt,
					tableTop + 10,
					{ width: columnWidth.theTotelAmount, align: "right" }
				)
				.text(
					"Discount",
					35 +
						columnWidth._id +
						columnWidth.createdAt +
						columnWidth.theTotelAmount,
					tableTop + 10,
					{ width: columnWidth.discount, align: "right" }
				)
				.text(
					"Discount on MRP",
					35 +
						columnWidth._id +
						columnWidth.createdAt +
						columnWidth.theTotelAmount +
						columnWidth.discount,
					tableTop + 10,
					{ width: columnWidth.discountedAmount, align: "right" }
				);

			doc.moveDown(1);

			doc.moveTo(30, doc.y).lineTo(600, doc.y).stroke();
			doc.moveDown(1);

			reportData.orders.forEach((order, index) => {
				const y = doc.y;
				const rowColor = index % 2 === 0 ? "#f9f9f9" : "#ffffff";
				doc.rect(30, y, 570, rowHeight).fill(rowColor).stroke();
				doc
					.fillColor("black")
					.fontSize(12)
					.text(order._id, 35, y + 10, {
						width: columnWidth._id,
						align: "left",
					})
					.text(
						moment(order.createdAt).format("YYYY-MM-DD HH:mm:ss"),
						35 + columnWidth._id,
						y + 10,
						{ width: columnWidth.createdAt, align: "left" }
					)
					.text(
						order.theTotelAmount,
						35 + columnWidth._id + columnWidth.createdAt,
						y + 10,
						{ width: columnWidth.theTotelAmount, align: "right" }
					)
					.text(
						order.discount,
						35 +
							columnWidth._id +
							columnWidth.createdAt +
							columnWidth.theTotelAmount,
						y + 10,
						{ width: columnWidth.discount, align: "right" }
					)
					.text(
						order.discountedAmount,
						35 +
							columnWidth._id +
							columnWidth.createdAt +
							columnWidth.theTotelAmount +
							columnWidth.discount,
						y + 10,
						{ width: columnWidth.discountedAmount, align: "right" }
					);
				doc.moveDown(1);
			});

			doc.end();
		} else {
			res.status(400).send("Invalid format");
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: error.message });
	}
};

const getSalesReportOnDashboard = async (startDate, endDate, period) => {
	let start, end, groupFormat;

	period = period || "week";

	if (period === "day") {
		start = moment().startOf("day");
		end = moment().endOf("day");
		groupFormat = "%Y-%m-%d";
	} else if (period === "week") {
		start = moment().startOf("week");
		end = moment().endOf("week");
		groupFormat = "%Y-%m-%d";
	} else if (period === "month") {
		start = moment().startOf("month");
		end = moment().endOf("month");
		groupFormat = "%Y-%m-%d";
	} else if (period === "year") {
		start = moment().startOf("year");
		end = moment().endOf("year");
		groupFormat = "%Y-%m";
	} else if (startDate && endDate) {
		start = moment(startDate).startOf("day");
		end = moment(endDate).endOf("day");
		groupFormat = "%Y-%m-%d";
	} else {
		throw new Error("Invalid date range");
	}

	const orders = await Order.aggregate([
		{
			$match: {
				createdAt: { $gte: start.toDate(), $lte: end.toDate() },
			},
		},
		{
			$group: {
				_id: {
					$dateToString: { format: groupFormat, date: "$createdAt" },
				},
				totalAmount: { $sum: "$theTotelAmount" },
				orderCount: { $sum: 1 },
			},
		},
		{
			$sort: { _id: 1 },
		},
	]);

	let result = [];
	if (period === "day") {
		let date = start.clone();
		while (date <= end) {
			const key = date.format("YYYY-MM-DD");
			const existing = orders.find((order) => order._id === key);
			result.push({
				_id: key,
				totalAmount: existing ? existing.totalAmount : 0,
				orderCount: existing ? existing.orderCount : 0,
			});
			date.add(1, "day");
		}
	} else if (period === "week") {
		const weekDays = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		];
		for (let i = 0; i < 7; i++) {
			const date = start.clone().add(i, "days");
			const key = date.format("YYYY-MM-DD");
			const existing = orders.find((order) => order._id === key);
			result.push({
				_id: weekDays[date.day()],
				totalAmount: existing ? existing.totalAmount : 0,
				orderCount: existing ? existing.orderCount : 0,
			});
		}
	} else if (period === "month") {
		let currentWeekStart = start.clone();
		let currentWeekEnd = currentWeekStart.clone().endOf("week");
		while (currentWeekStart <= end) {
			const key = currentWeekStart.format("YYYY-MM-DD");
			const existing = orders.find((order) => order._id === key);
			result.push({
				_id: `Week ${currentWeekStart.week()}`,
				totalAmount: existing ? existing.totalAmount : 0,
				orderCount: existing ? existing.orderCount : 0,
			});
			currentWeekStart.add(1, "week");
			currentWeekEnd = currentWeekStart.clone().endOf("week");
		}
	} else if (period === "year") {
		const months = moment.months();
		result = months.map((month, index) => {
			const key = moment().month(index).format("YYYY-MM");
			const existing = orders.find((order) => order._id === key);
			return {
				_id: month,
				totalAmount: existing ? existing.totalAmount : 0,
				orderCount: existing ? existing.orderCount : 0,
			};
		});
	}

	const overallSalesCount = result.reduce(
		(acc, order) => acc + order.orderCount,
		0
	);
	const overallOrderAmount = result.reduce(
		(acc, order) => acc + order.totalAmount,
		0
	);
	let averageSales = 0;
	if (period === "week") {
		averageSales = Math.round(overallOrderAmount / 7);
	}
	if (period === "month") {
		averageSales = Math.round(overallOrderAmount / 4);
	}
	if (period === "year") {
		averageSales = Math.round(overallOrderAmount / 12);
	}

	return {
		overallSalesCount,
		overallOrderAmount,
		averageSales,
		orders: result,
	};
};

const generateReportOnDashboard = async (req, res) => {
	try {
		const { startDate, endDate, period } = req.query;
		const reportData = await getSalesReportOnDashboard(
			startDate,
			endDate,
			period
		);

		res.status(200).json({
			message: "Order fetched successfully",
			report: reportData,
		});
	} catch (error) {
		console.log(error);

		return res.status(500).json({ message: error.message });
	}
};

export {
	generateReport,
	downloadReport,
	getSalesReportOnDashboard,
	generateReportOnDashboard,
};

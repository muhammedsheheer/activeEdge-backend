import Products from "../model/productSchema.js";
import Order from "../model/orderSchema.js";
import Wallet from "../model/walletSchema.js";
import Return from "../model/returnSchema.js";
import Razorpay from "razorpay";
import { calculateOfferPrice } from "../utils/calculateOfferPrice.js";

const getOrderData = async (req, res) => {
	try {
		const userId = req.user.id;
		const order = await Order.find({ userId }).populate({
			path: "items.productId",
			populate: {
				path: "brand",
			},
		});

		if (!order) {
			return res.status(404).json({ message: "No orders found for this user" });
		}
		return res.status(200).json({ message: "Order get successfully", order });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const createOrder = async (req, res) => {
	const {
		userId,
		items,
		shippingAddress,
		paymentMethod,
		theTotelAmount,
		discount,
		discountedAmount,
	} = req.body;

	try {
		for (let item of items) {
			const product = await Products.findById(item.productId);

			if (!product) {
				return res
					.status(404)
					.json({ message: `Product not found: ${item.productId}` });
			}

			const sizeIndex = product.sizes.findIndex(
				(size) => size.size === item.size
			);

			if (sizeIndex === -1) {
				return res.status(400).json({
					message: `Size ${item.size} not available for product ${product.name}`,
				});
			}

			if (product.sizes[sizeIndex].stock < item.quantity) {
				return res.status(400).json({
					message: `Insufficient stock for product ${product.productName} in size ${item.size}. Available stock: ${product.sizes[sizeIndex].stock}`,
				});
			}
		}

		let finalAmount = theTotelAmount;

		if (paymentMethod === "Wallet") {
			const wallet = await Wallet.findOne({ user: userId });

			if (!wallet) {
				return res.status(404).json({ message: "Wallet not found" });
			}

			if (wallet.balance < finalAmount) {
				return res
					.status(400)
					.json({ message: "Insufficient balance in wallet" });
			}

			wallet.balance -= finalAmount;
			wallet.transactions.push({
				type: "debit",
				amount: finalAmount,
				description: `Payment for order`,
				date: Date.now(),
			});

			await wallet.save();

			finalAmount = 0;
		}

		const newOrder = new Order({
			userId,
			items,
			theTotelAmount,
			shippingAddress,
			paymentMethod,
			discount,
			discountedAmount,
			paymentStatus: paymentMethod === "Wallet" ? "Success" : "Pending",
		});

		const savedOrder = await newOrder.save();

		for (let item of items) {
			const product = await Products.findById(item.productId);

			const sizeIndex = product.sizes.findIndex(
				(size) => size.size === item.size
			);

			if (sizeIndex !== -1) {
				product.sizes[sizeIndex].stock -= item.quantity;
				await product.save();
			}
		}

		return res.status(201).json({
			message: "Order created successfully",
			order: savedOrder,
		});
	} catch (error) {
		console.log("Error confirming order:", error);
		res.status(500).json({ message: "Failed to create order" });
	}
};

const createOrderWithRazorPay = async (req, res) => {
	const {
		userId,
		items,
		shippingAddress,
		paymentMethod,
		theTotelAmount,
		discount,
		discountedAmount,
	} = req.body;

	try {
		for (let item of items) {
			const product = await Products.findById(item.productId);

			if (!product) {
				return res
					.status(404)
					.json({ message: `Product not found: ${item.productId}` });
			}

			const sizeIndex = product.sizes.findIndex(
				(size) => size.size === item.size
			);

			if (sizeIndex === -1) {
				return res.status(400).json({
					message: `Size ${item.size} not available for product ${product.name}`,
				});
			}

			if (product.sizes[sizeIndex].stock < item.quantity) {
				return res.status(400).json({
					message: `Insufficient stock for product ${product.productName} in size ${item.size}. Available stock: ${product.sizes[sizeIndex].stock}`,
				});
			}
		}

		let finalAmount = theTotelAmount;

		let razorpayOrder;
		if (finalAmount > 0) {
			const razorpay = new Razorpay({
				key_id: process.env.RAZORPAY_KEY_ID,
				key_secret: process.env.RAZORPAY_KEY_SECRET,
			});

			const options = {
				amount: Math.round(finalAmount * 100),
				currency: "INR",
				receipt: `receipt_order_${Date.now()}`,
			};

			razorpayOrder = await razorpay.orders.create(options);
		}

		return res.status(201).json({
			message: "Order created successfully",
			razorpayOrderId: razorpayOrder ? razorpayOrder.id : null,
			amount: razorpayOrder ? razorpayOrder.amount : 0,
			currency: razorpayOrder ? razorpayOrder.currency : "INR",
			key: razorpayOrder ? process.env.RAZORPAY_KEY_ID : null,
		});
	} catch (error) {
		console.log("Error confirming order:", error);
		res.status(500).json({ message: "Failed to create order" });
	}
};

const confirmOrderRazorpay = async (req, res) => {
	const {
		userId,
		items,
		shippingAddress,
		paymentMethod,
		theTotelAmount,
		discount,
		discountedAmount,
		razorpayPaymentId,
		razorpayOrderId,
	} = req.body;
	console.log("body:", req.body);

	try {
		if (paymentMethod !== "Wallet") {
			const razorpay = new Razorpay({
				key_id: process.env.RAZORPAY_KEY_ID,
				key_secret: process.env.RAZORPAY_KEY_SECRET,
			});

			const payment = await razorpay.payments.fetch(razorpayPaymentId);
			if (payment.status !== "captured") {
				return res.status(400).json({ message: "Payment verification failed" });
			}
		}

		const newOrder = new Order({
			userId,
			items,
			theTotelAmount,
			shippingAddress,
			paymentMethod,
			discount,
			discountedAmount,
			paymentStatus: "Success",
			razorpayOrderId,
		});

		const savedOrder = await newOrder.save();

		for (let item of items) {
			const product = await Products.findById(item.productId);
			const sizeIndex = product.sizes.findIndex(
				(size) => size.size === item.size
			);

			if (sizeIndex !== -1) {
				product.sizes[sizeIndex].stock -= item.quantity;
				await product.save();
			}
		}

		return res.status(201).json({
			message: "Order created and payment confirmed successfully",
			order: savedOrder,
		});
	} catch (error) {
		console.log("Error confirming order:", error);
		res.status(500).json({ message: "Failed to confirm order" });
	}
};

const getAllOrderData = async (req, res) => {
	try {
		const order = await Order.find().populate({
			path: "items.productId",
			populate: {
				path: "brand",
			},
		});
		return res
			.status(200)
			.json({ message: "Data fetched successfully ", order });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getOrderDetailsById = async (req, res) => {
	try {
		const { id } = req.params;
		const order = await Order.findById(id).populate({
			path: "items.productId",
			populate: { path: "brand" },
		});
		return res
			.status(200)
			.json({ message: "Order fetched successfully", order });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const updateProductStatus = async (req, res) => {
	const { id } = req.params;
	const { productId, newStatus } = req.body;

	try {
		const order = await Order.findById(id);
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		const itemIndex = order.items.findIndex(
			(item) => item.productId.toString() === productId
		);
		if (itemIndex === -1) {
			return res.status(404).json({ message: "Product not found in order" });
		}

		order.items[itemIndex].status = newStatus;

		if (order.items[itemIndex].status === "Delivered") {
			order.paymentStatus = "Success";
		}

		const statuses = order.items
			.filter((item) => item.status !== "Cancelled")
			.map((item) => item.status);

		const statusCount = statuses.reduce((count, status) => {
			count[status] = (count[status] || 0) + 1;
			return count;
		}, {});

		const highestStatus = Object.entries(statusCount).reduce(
			(max, [status, count]) => (count > max.count ? { status, count } : max),
			{ status: null, count: 0 }
		);

		if (highestStatus.status) {
			order.orderStatus = highestStatus.status;
		} else if (statuses.length === 0) {
			order.orderStatus = "Cancelled";
		}

		await order.save();

		console.log("Updated order:", order);

		return res
			.status(200)
			.json({ message: "Product status updated successfully", order });
	} catch (error) {
		console.error("Error updating product status:", error);
		return res.status(500).json({ message: "Failed to update product status" });
	}
};

const cancelOrder = async (req, res) => {
	try {
		const { orderId, itemId } = req.body;

		const order = await Order.findOneAndUpdate(
			{ "items._id": itemId },
			{ $set: { "items.$.status": "Cancelled" } },
			{ new: true }
		);

		if (order) {
			const orderItem = order.items.find(
				(item) => item._id.toString() === itemId
			);

			const { productId, quantity, size } = orderItem;

			const product = await Products.findById(productId);

			if (product) {
				const sizeIndex = product.sizes.findIndex((s) => s.size === size);

				if (sizeIndex !== -1) {
					product.sizes[sizeIndex].stock += quantity;
					await product.save();
				}
			}

			const price = product.salePrice * quantity;

			const wallet = await Wallet.findOne({ user: order.userId });

			if (order.paymentMethod !== "Cash on delivery") {
				wallet.balance += price;

				wallet.transactions.push({
					type: "credit",
					amount: price,
					description: `Refund for cancelled item ${itemId} in order ${orderId}`,
					date: Date.now(),
				});

				await wallet.save();
			}

			const statuses = order.items
				.filter((item) => item.status !== "Cancelled")
				.map((item) => item.status);

			const statusCount = statuses.reduce((count, status) => {
				count[status] = (count[status] || 0) + 1;
				return count;
			}, {});

			const highestStatus = Object.entries(statusCount).reduce(
				(max, [status, count]) => (count > max.count ? { status, count } : max),
				{ status: null, count: 0 }
			);

			if (highestStatus.status) {
				order.orderStatus = highestStatus.status;
			} else if (statuses.length === 0) {
				order.orderStatus = "Cancelled";
			}

			await order.save();

			return res.status(200).json({
				message: "Order item cancelled and amount refunded successfully",
				order,
			});
		} else {
			return res.status(404).json({ message: "Order item not found" });
		}
	} catch (error) {
		console.log("The log body", error);
		return res.status(500).json({ message: error.message });
	}
};

const singleOrderDetails = async (req, res) => {
	try {
		const { orderId, itemId } = req.query;
		console.log("Query parameters:", req.query);

		const order = await Order.findById(orderId).populate({
			path: "items.productId",
			populate: [
				{ path: "offer" },
				{ path: "category", populate: "offer" },
				{ path: "brand" },
			],
		});

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		const item = order.items.find((i) => i._id.toString() === itemId);
		if (!item) {
			return res.status(404).json({ message: "Item not found in the order" });
		}

		const product = item.productId;
		if (!product) {
			return res.status(404).json({ message: "Product not found in the item" });
		}

		const productOffer = product.offer?.discountPercentage || 0;
		const categoryOffer = product.category?.offer?.discountPercentage || 0;
		const offerExpirationDate =
			product.offer?.endDate || product.category?.offer?.endDate;

		const priceDetails = calculateOfferPrice(
			product.salePrice,
			productOffer,
			categoryOffer,
			offerExpirationDate
		);

		return res.status(200).json({
			message: "Product fetched successfully",
			item: {
				...item.toObject(),
				priceDetails,
				offerValid: priceDetails.offerPercentage > 0,
			},
			order,
		});
	} catch (error) {
		console.log(error);

		return res.status(500).json({ message: error.message });
	}
};

const returnOrderRequest = async (req, res) => {
	try {
		const { orderId, itemId, reason } = req.body;

		let order = await Order.findById(orderId);

		let orderItem = order.items.find((item) => item._id.toString() === itemId);

		if (!orderItem) {
			return res.status(404).json({ message: "Order item not found" });
		}

		let { productId, quantity, size } = orderItem;

		const returnRequest = new Return({
			orderId,
			userId: req.user.id,
			productId,
			quantity,
			size,
			reason,
			itemId,
		});

		await returnRequest.save();

		orderItem.status = "ReturnInitialized";
		const allItemsReturned = order.items.every(
			(item) => item.status === "ReturnInitialized"
		);
		order.orderStatus = "ReturnInitialized";
		if (allItemsReturned) {
			order.status = "ReturnInitialized";
		}

		await order.save();

		return res
			.status(200)
			.json({ message: "Return request created successfully", returnRequest });
	} catch (error) {
		console.log("Error:", error);
		return res.status(500).json({ message: error.message });
	}
};

const getReturnDetails = async (req, res) => {
	try {
		const returnRequest = await Return.find()
			.populate("orderId")
			.populate("productId");
		res.status(200).json({
			message: "Return request details retrieved successfully",
			returnRequest,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const acceptReturn = async (req, res) => {
	try {
		const { returnId } = req.body;
		console.log("the id", req.body);

		const returnRequest = await Return.findById(returnId)
			.populate("productId")
			.populate("orderId");
		if (!returnRequest) {
			return res.status(404).json({ message: "Return request not found" });
		}
		returnRequest.status = "Accepted";

		await returnRequest.save();
		const productId = returnRequest.productId;
		const quantity = returnRequest.quantity;
		const size = returnRequest.size;
		const user = returnRequest.userId;
		const itemId = returnRequest.itemId;
		const orderId = returnRequest.orderId;
		const product = await Products.findById(productId);

		let order = await Order.findById(orderId);

		let orderItem = order.items.find((item) => item._id.toString() === itemId);

		if (returnRequest.reason !== "Damaged product") {
			const sizeIndex = product.sizes.findIndex((s) => s.size === size);

			if (sizeIndex !== -1) {
				product.sizes[sizeIndex].stock += quantity;
				await product.save();
			}
		}

		const price = product.salePrice * quantity;

		const wallet = await Wallet.findOne({ user });

		wallet.balance += price;

		wallet.transactions.push({
			type: "credit",
			amount: price,
			description: `Refund for cancelled item ${itemId}`,
			date: Date.now(),
		});

		await wallet.save();

		orderItem.status = "ReturnAccepted";
		const allItemsReturned = order.items.every(
			(item) => item.status === "ReturnAccepted"
		);
		order.orderStatus = "ReturnAccepted";
		if (allItemsReturned) {
			order.status = "ReturnAccepted";
		}

		await order.save();

		return res.status(200).json({ message: "Return accepted", returnRequest });
	} catch (error) {
		console.log("medsssddd", error);

		return res.status(500).json({ message: error.message });
	}
};

const rejectReturn = async (req, res) => {
	try {
		const { returnId } = req.body;
		const returnRequest = await Return.findById(returnId)
			.populate("productId")
			.populate("orderId");

		if (!returnRequest) {
			return res.status(404).json({ message: "Return request not found" });
		}

		returnRequest.status = "Rejected";
		await returnRequest.save();

		const orderId = returnRequest.orderId;
		const itemId = returnRequest.itemId;

		let order = await Order.findById(orderId);
		let orderItem = order.items.find((item) => item._id.toString() === itemId);

		orderItem.status = "ReturnRejected";
		const allItemsReturned = order.items.every(
			(item) => item.status === "ReturnRejected"
		);
		order.orderStatus = "ReturnRejected";
		if (allItemsReturned) {
			order.status = "ReturnRejected";
		}

		await order.save();

		return res
			.status(200)
			.json({ message: "Return request rejected", returnRequest });
	} catch (error) {
		console.log("Error:", error);
		return res.status(500).json({ message: error.message });
	}
};

export {
	createOrder,
	getOrderData,
	getAllOrderData,
	getOrderDetailsById,
	updateProductStatus,
	cancelOrder,
	returnOrderRequest,
	getReturnDetails,
	acceptReturn,
	rejectReturn,
	singleOrderDetails,
	createOrderWithRazorPay,
	confirmOrderRazorpay,
};

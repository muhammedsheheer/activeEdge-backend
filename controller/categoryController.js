import Category from "../model/categorySchema.js";

const createCategory = async (req, res) => {
	try {
		const { categoryName, description, status } = req.body;
		if (!categoryName) {
			return res.status(400).json({ message: "Categoryname is required" });
		}
		const existingCategory = await Category.findOne({ categoryName });
		if (existingCategory) {
			return res.status(400).json({ message: "Category already existing" });
		}
		const category = new Category({
			categoryName,
			description,
			status,
		});
		const categoryData = await category.save();
		return res
			.status(200)
			.json({ message: "Category added successfully", categoryData });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getAllCategory = async (req, res) => {
	try {
		const categoryData = await Category.find();
		return res
			.status(200)
			.json({ message: "Data fetched successfully", categoryData });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const deleteCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const category = await Category.findByIdAndDelete(id);
		return res.status(200).json({ message: "Category deleted successfully" });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const editCategory = async (req, res) => {
	try {
		const { categoryName, description, status } = req.body;
		const { id } = req.params;
		const category = await Category.findById(id);
		if (!category) {
			return res.status(400).json({ message: "Category not founded" });
		}
		// const existinCategory = await Category.findOne({ categoryName });
		// if (existinCategory) {
		// 	return res.status(400).json({ message: " Existing category" });
		// }

		const categoryData = await Category.findByIdAndUpdate(
			id,
			{
				categoryName,
				description,
				status,
			},
			{ new: true }
		);
		return res
			.status(200)
			.json({ message: "Updated successfully", categoryData });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export { createCategory, getAllCategory, deleteCategory, editCategory };

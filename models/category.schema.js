const { Schema, model } = require("mongoose");

const categorySchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Category name is Required"],
			trim: true,
			unique: true,
		},
		image: {
			type: String,
			required: [true, "Image Url is Required"],
		},
		imageId: {
			type: String,
			required: [true, "Image Id is Required"],
		},
	},
	{
		timestamps: true,
	}
);

const Category = model("Category", categorySchema);
module.exports = Category;

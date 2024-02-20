import { model, Schema } from "mongoose";

// Dados que compoem o produto
const postSchema = new Schema(
  {
    id: { type: String },
    nameImage: { type: String },
    size: { type: Number },
    key: { type: String },
    url: { type: String },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.pre("save", function () {
  if (!this.url) {
    this.url = `http://localhost:4000/files/${this.key}`; //
  }
});

export const ImageModel = model("Image", postSchema, "images");

import { model, Schema } from "mongoose";

// Dados que compoem o post
const postSchema = new Schema(
  {
    id: { type: String, required: false  },
    title: { type: String, required: false },
    content: { type: String, required: false },
    category: { type: String, required: false},
    tags: { type: Array, required: false },
    urlPost: { type: String },
    nameImage: { type: String },
    size: { type: Number },
    key: { type: String },
    url: { type: String },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: { type: Date },
    createdBy: { type: String },
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

export const PostModel = model("Post", postSchema, "posts");

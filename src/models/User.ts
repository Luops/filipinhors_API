import { model, Schema } from "mongoose";

// Dados que compoem o usuário
const userSchema = new Schema(
  {
    id: { type: String },
    name: { type: String },
    lastName: { type: String },
    age: { type: Number },
    cep: { type: Number },
    email: { type: String },
    password: { type: String },
    nameImage: { type: String },
    size: { type: Number },
    key: { type: String },
    url: { type: String },
    role: { type: Number },
    uuid: { type: String },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model("User", userSchema, "users"); // Após o useSchema é o nome da collection (pasta dentro do banco)

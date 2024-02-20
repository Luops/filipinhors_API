// Lógica do backend
import { Request, Response } from "express";

// Model
import { PostModel } from "../models/Post";

// MongoDB
import { Types } from "mongoose"; // Importe Types de mongoose para trabalhar com ObjectId

// Logger
import Logger from "../../config/logger";

export async function createPost(req: Request, res: Response) {
  // return res.status(200).send("Deu certo o controller"); // Retornar a mensagem quando entrar na rota pelo POSTMAN
  try {
    /**
     * renomear os arquivos que foram enviados
     */
    const { originalname: nameImage, size, key, location: url = "" } = req.file;

    /**
     * Coletar dados do que foi escrito e dos arquivos e enviar para o mongoDB
     */

    const postTitle = req.body.title;
    const createdAt = new Date(); // Obter a data de criação atual
    const updatedAt = new Date();

    // Formatar a data de criação como parte da URL do post
    const formattedDate = `${createdAt.getDate()}-${
      createdAt.getMonth() + 1
    }-${createdAt.getFullYear()}`;

    const urlPost = `${postTitle
      .replace(/\s+/g, "-")
      .toLowerCase()}-${formattedDate}`;

    // Formatar as tags
    const tagsArray = req.body.tags.split(",").map((tag: string) => tag.trim());

    const post = await PostModel.create({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      tags: tagsArray,
      urlPost,
      createdAt,
      updatedAt,
      createdBy: req.body.createdBy,
      nameImage,
      size,
      key,
      url,
    }); // Aguardando um input do model, e criar o usuário com os dados da requisição

    return res.status(201).json(post); // Retornar o status 201 (algo criado no sistema) e mandar os dados via json
  } catch (e: any) {
    Logger.error(`Erro no sistema: ${e.message}`);
  }
}

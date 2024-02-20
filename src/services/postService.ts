import { Request, Response } from "express";

// Model
import { PostModel } from "../models/Post";
import { ImageModel } from "../models/Image";

// Logger
import Logger from "../../config/logger";

// AWS
const aws = require("aws-sdk");
const s3 = new aws.S3();
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
  region: process.env.AWS_DEFAULT_REGION, // Substitua pela sua região
});

const STORAGE_TYPE = process.env.STORAGE_TYPE;

// Node
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

// Buscar todos os posts ordenados pela data de publicação
export async function findPostsDesc(req: Request, res: Response) {
  try {
    // Encontre os posts ordenados pela data de publicação em ordem decrescente
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .select("urlPost title category url createdAt updatedAt");

    if (!posts || posts.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhuma publicação encontrada!" });
    }

    return res.status(200).json(posts);
  } catch (e: any) {
    Logger.error(`Erro no sistema: ${e.message}`);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

// Buscar os últimos 10 posts ordenados pela data de publicação
export async function findPostsDesc10(req: Request, res: Response) {
  try {
    // Encontre os posts ordenados pela data de publicação em ordem decrescente
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("urlPost title category url createdAt updatedAt");

    if (!posts || posts.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhuma publicação encontrada!" });
    }

    return res.status(200).json(posts);
  } catch (e: any) {
    Logger.error(`Erro no sistema: ${e.message}`);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

// Buscar 4 posts sugeridos pela categoria que contém no post atual
export async function getSuggestedPosts(req: Request, res: Response) {
  try {
    // Obtenha o ID da publicação atualmente visualizada pelo usuário
    const id: string = req.params.id;

    // Encontre a categoria da publicação atual
    const currentPost = await PostModel.findById(id);
    if (!currentPost) {
      return res.status(404).json({ message: "Publicação não encontrada" });
    }
    const category = currentPost.category;

    // Encontre as últimas 4 publicações na mesma categoria, exceto a publicação atual
    const suggestedPosts = await PostModel.find({
      category,
      _id: { $ne: id },
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .select("urlPost title category url createdAt updatedAt");

    return res.status(200).json(suggestedPosts);
  } catch (e: any) {
    Logger.error(`Erro no sistema: ${e.message}`);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

// Busca de posts por categoria
export async function findPostsByCategory(req: Request, res: Response) {
  try {
    const category: string = req.params.category;

    if (!category) {
      return res.status(400).json({ message: "Categoria não informada" });
    }

    const posts = await PostModel.find({ category: category }).select(
      "urlPost title category url createdAt"
    );

    if (!posts || posts.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum post encontrado para esta categoria" });
    }

    return res.status(200).json(posts);
  } catch (e: any) {
    Logger.error(`Erro no sistema: ${e.message}`);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

// Mostrar post por sua urlPost
export async function findPostByUrlPost(req: Request, res: Response) {
  try {
    // Coletar a id pelo parametro passado pela url (/api/post/xxxxxxxxxx)
    const urlPost: string = req.params.urlPost;

    // Buscar os dados do usuário no banco de dados
    const post = await PostModel.findOne({ urlPost: urlPost });

    if (!post) {
      return res.status(404).json({ message: "Publicação não encontrada!" });
    }

    return res.status(200).json(post);
  } catch (e: any) {
    Logger.error(`Erro no sistema: ${e.message}`);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

// Buscar posts pelo campo de pesquisa
export async function searchPosts(req: Request, res: Response) {
  try {
    const searchTerm: string = req.query.q as string;

    if (!searchTerm) {
      return res
        .status(400)
        .json({ message: "Termo de pesquisa não fornecido" });
    }

    const posts = await PostModel.find({
      $or: [
        { title: { $regex: searchTerm, $options: "i" } }, // Procurar por título insensível a maiúsculas/minúsculas
        { category: { $regex: searchTerm, $options: "i" } }, // Procurar por conteúdo insensível a maiúsculas/minúsculas
        { tags: { $regex: searchTerm, $options: "i" } }, // Procurar por tags insensíveis a maiúsculas/minúsculas
        { content: { $regex: searchTerm, $options: "i" } }, // Procurar por tags insensíveis a maiúsculas/minúsculas
      ],
    }).sort({ createdAt: -1 });

    if (!posts || posts.length === 0) {
      return res.status(404).json({
        message: "Nenhum post encontrado para o termo de pesquisa fornecido",
      });
    }

    return res.status(200).json(posts);
  } catch (e: any) {
    Logger.error(`Erro no sistema: ${e.message}`);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

// Deletar um post pelo ID
export async function deletePostById(req: Request, res: Response) {
  try {
    const id: string = req.params.id;

    const post = await PostModel.findOne({ _id: id });

    if (!post) {
      return res.status(404).json({ message: "Produto não encontrado!" });
    }

    // Execute o código de exclusão antes de chamar deleteOne, caso seja no S3
    if (STORAGE_TYPE === "s3") {
      await s3
        .deleteObject({
          Bucket: "uploadimagesfilipinhors",
          Key: post.key, // Use a chave do produto
        })
        .promise();
    } else {
      await promisify(fs.unlink)(
        path.resolve(__dirname, "..", "..", "tmp", "uploads", post.key)
      );
    }
    await post.deleteOne();
    return res.status(204).send(); // 204 No Content, indicando que o produto foi removido com sucesso.
  } catch (e: any) {
    Logger.error(`Erro no sistema ${e.message}`);
  }
}

// Deletar imagem de um post
export async function deleteImageByPost(req: Request, res: Response) {
  try {
    const id: string = req.params.id;

    const post = await PostModel.findOne({ _id: id });

    if (!post) {
      return res.status(404).json({ message: "Produto não encontrado!" });
    }

    // Execute o código de exclusão antes de chamar deleteOne, caso seja no S3
    if (process.env.STORAGE_TYPE === "s3") {
      await s3
        .deleteObject({
          Bucket: "uploadimagesfilipinhors",
          Key: post.key, // Use a chave do produto
        })
        .promise();
    } else {
      await promisify(fs.unlink)(
        path.resolve(__dirname, "..", "..", "tmp", "uploads", post.key)
      );
    }

    // Deletar somente a url do banco
    post.url = " ";
    // Preciso com que não fique o local host no banco

    await post.save();

    return res.status(204).send(); // 204 No Content, indicando que o produto foi removido com sucesso.
  } catch (e: any) {
    Logger.error(`Erro no sistema ${e.message}`);
  }
}

// Atualizar um post
export async function updatePost(req: Request, res: Response) {
  try {
    const id: string = req.params.id;

    // Verifique se o produto existe no banco de dados
    const post = await PostModel.findOne({ _id: id });

    if (!post) {
      return res.status(404).json({ message: "Produto não encontrado!" });
    }

    // Obtenha os novos valores do corpo da solicitação
    const { title, content, category, tags, url } = req.body;
    // Atualize os campos do produto existente com os novos valores

    post.title = title;
    post.content = content;
    post.tags = tags;
    post.category = category;
    post.url = url;

    // Salve as alterações no banco de dados
    await post.save();

    return res.status(200).json(post);
  } catch (e: any) {
    Logger.error(`Erro no sistema: ${e.message}`);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}

// Upload de imagem
export async function uploadImage(req: Request, res: Response) {
  try {
    /**
     * renomear os arquivos que foram enviados
     */
    const { originalname: nameImage, size, key, location: url = "" } = req.file;

    /**
     * Coletar dados do que foi escrito e dos arquivos e enviar para o mongoDB
     */
    const image = await ImageModel.create({
      nameImage,
      size,
      key,
      url,
    }); // Aguardando um input do model, e criar o usuário com os dados da requisição

    return res.status(201).json(image);
  } catch (e: any) {}
}

import { Router, Request, Response } from "express";

// Multer
const multer = require("multer");
const multerConfig = require("../config/multer");

// Controller
import { createUser } from "./controllers/userController";
import { createPost } from "./controllers/postController";
import { uploadImage } from "./controllers/imageController";

// Services
import { findUserById, login, setCookie } from "./services/userServices";
import {
  findPostsDesc,
  findPostsDesc10,
  findPostByUrlPost,
  getSuggestedPosts,
  findPostsByCategory,
  searchPosts,
  deletePostById,
  deleteImageByPost,
  updatePost,
} from "./services/postService";

const router = Router();

export default router
  .get("/test", (req: Request, res: Response) => {
    res.status(200).send("API Working!!!"); // Resposta no POSTMAN quando der certo (200), ou seja, entrar na rota de test
  })
  // Rota para usuários
  .post("/user", multer(multerConfig).single("file"), createUser) // Criar usuário de acordo com a função do createUser do controller.
  .post("/login", login) // Login do usuário.
  .get("/user/:id", findUserById) // Mostrar informações usuário.
  .get("/setCookie", setCookie)

  /*
   * Rotas para os produtos
   */
  .post("/post", multer(multerConfig).single("file"), createPost) // Criar um post
  .post("/image", multer(multerConfig).single("file"), uploadImage)
  .get("/post/search", searchPosts) // Buscar publicações por palavras
  .get("/post", findPostsDesc) // Listar todos os posts com a ordem decrescente (data de publicação)
  .get("/post10", findPostsDesc10) // As últimas 10 publicações com a ordem decrescente (data de publicação)
  .get("/post/:urlPost", findPostByUrlPost) // Mostrar post pela sua urlPost
  .get("/post/category/suggested/:id", getSuggestedPosts) // Buscar 4 publicações que sejam da mesma categoria
  .get("/post/category/:category", findPostsByCategory) // Buscar publicações por categoria
  .delete("/post/:id", deletePostById) // Deletar post.
  .delete("/post/image/:id", deleteImageByPost) // Deletar post.
  .put("/post/:id", updatePost); // Atualizar post.

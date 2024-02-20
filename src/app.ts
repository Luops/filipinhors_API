// ENV variaveis
require("dotenv").config();

import express from "express";
import config from "config";
import cors = require("cors");
const path = require("path");

const app = express();

// Habilita o CORS para todas as solicitações
const corsOptions = {
  origin: "http://localhost:3000/", // Substitua pela origem correta do seu frontend
  credentials: true, // Permite o envio de cookies e credenciais
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
};
app.use(cors(corsOptions));

// JSON middleware
app.use(express.json());

// Conexão do DB
import db from "../config/db";

// Routes
import router from "./router";

// Logger
import Logger from "../config/logger";

// Middlewares
import morganMiddleware from "./middleware/morganMiddleware";
// Toda vez que tiver requisição será acionado o middleware, imprimindo no console
app.use(morganMiddleware);

// Prefixo de URL. Todas as URLs conterão /api/ como algo fixado, e após isto será algo variado (tudo de função do router)
app.use("/api/", router); // Isso é importante para utilizar o POSTMAN

// Variável para a porta da API
const port = config.get<number>("port"); // Pegar o número do "port"

// Gravar arquivos no servidor do node
app.use(
  "/files",
  express.static(path.resolve(__dirname, "..", "tmp", "uploads"))
);

// Configuração da porta do express
app.listen(port, async () => {
  await db(); // Aguardar a conexão com o banco

  Logger.info(`Aplicação rodando na porta: ${port}.`);
});

// Lógica do backend
import { Request, Response } from "express";

// Model
import { UserModel } from "../models/User";

// Logger
import Logger from "../../config/logger";

// Token JWT
import tokenService from "../services/tokenService";

import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export async function createUser(req: Request, res: Response) {
  // return res.status(200).send("Deu certo o controller"); // Retornar a mensagem quando entrar na rota pelo POSTMAN
  try {
    /**
     * renomear os arquivos que foram enviados
     */
    const { originalname: nameImage, size, key, location: url = "" } = req.file;

    /**
     * Coletar dados do que foi escrito e dos arquivos e enviar para o mongoDB
     */

    // Criar um novo usuário
    const data = req.body; // Receber todos dados da requisição http (tudo em relação aos dados do usuário)
    // Gerar o hash da senha
    const salt = bcrypt.genSaltSync(10);
    const hash = await bcrypt.hashSync(data.password, salt);

    // Substituir a senha original pelo hash
    data.password = hash;

    // Linkar o id do usuário com o uuidv4
    data.id;
    data.uuid = uuidv4();

    const user = await UserModel.create({ ...data, nameImage, size, key, url }); // Aguardando um input do model, e criar o usuário com os dados da requisição
    return res.status(201).json(user); // Retornar o status 201 (algo criado no sistema) e mandar os dados via json
  } catch (e: any) {
    Logger.error(`Erro no sistema: ${e.message}`);
  }
}

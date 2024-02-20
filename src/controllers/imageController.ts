import { Request, Response } from "express";

// Model
import { ImageModel } from "../models/Image";

// Logger
import Logger from "../../config/logger";

// Multer
const multer = require("multer");
const multerConfig = require("../../config/multer");

// AWS
const aws = require("aws-sdk");
const s3 = new aws.S3();
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
  region: process.env.AWS_DEFAULT_REGION, // Substitua pela sua região
});

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

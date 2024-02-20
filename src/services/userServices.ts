import { Request, Response } from "express";

// Model
import { UserModel } from "../models/User";

// Logger
import Logger from "../../config/logger";

// Token JWT
import tokenService from "../services/tokenService";
import { serialize } from "cookie";

// Outros
import { destroyCookie } from "nookies";
import bcrypt from "bcrypt";

export async function findUserById(req: Request, res: Response) {
  try {
    // Coletar a id pelo parametro passado pela url (/api/user/xxxxxxxxxx)
    const id: string = req.params.id;

    // Buscar os dados do usuário no banco de dados
    const user = await UserModel.findOne({ uuid: id });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json(user);
  } catch (e: any) {
    Logger.error(`Erro no sistema: ${e.message}`);
  }
}

export async function login(req: Request, res: Response) {
  try {
    // Coletar dados
    const { email, password } = req.body; // Receber os dados da requisição http do POSTMAN(email e senha)

    // Verificar se o email existe no banco de dados de acordo com a requisição, levando a requisição para o email do model
    const checkUser = await UserModel.findOne({ email: email }); // Tenta encontrar oq foi digitado nos emails do model

    // Primeiro, checkar se existe o email
    if (checkUser) {
      // Segundo, checkar se existe o password
      if (checkUser.password) {
        // Comparar as senhas com o hash
        const isPasswordValid = bcrypt.compareSync(
          password, // Senha digitada no POSTMAN (requisição)
          checkUser.password // Senha do model / Banco de dados
        );
        if (isPasswordValid) {
          // A senha é válida
          const userId = checkUser.uuid; // Pegar o id do usuário que está logando
          if (userId) {
            const token = tokenService.generateToken(userId); // Gerar o token de acordo com o id do usuário
            // envia o cookie
            /*res.cookie("userId", userId, {
              httpOnly: true,
              maxAge: 100,
              sameSite: "none",
              secure: true,
            });
            res.cookie("JWT", token, {
              httpOnly: true,
              maxAge: 100,
              sameSite: "none",
              secure: true,
            });*/

            // Configura os cookies na resposta (res) enviada para o cliente
            res.setHeader("Set-Cookie", [
              serialize("userId", userId, {
                httpOnly: true,
                maxAge: 100, // Define a expiração do cookie (em segundos)
                sameSite: "none", // Define a política SameSite para cross-site cookies
                secure: true, // Somente envia o cookie em conexões HTTPS
              }),
              serialize("JWT", token, {
                httpOnly: true,
                maxAge: 100, // Define a expiração do cookie (em segundos)
                sameSite: "none", // Define a política SameSite para cross-site cookies
                secure: true, // Somente envia o cookie em conexões HTTPS
              }),
            ]);

            return res
              .status(201)
              .json({ message: "Login bem-sucedido!", userId, token }); // Retorna o login com o token
          }
        } else {
          return res.status(401).json({ message: "Senha inválida!" });
        }
      } else {
        return res.status(404).json({ message: "Senha inválida!" });
      }
    } else {
      return res.status(404).json({ message: "Email inválido!" });
    }
  } catch (error) {
    Logger.error("Erro no login:", error);
    return res.status(500).json({ message: "Erro no servidor." });
  }
}

export async function setCookie(req: Request, res: Response) {
  try {
    res.cookie("cookieName", "cookieValue", {
      sameSite: "strict", // SameSite pode ser 'strict', 'lax', 'none', etc.
      secure: true, // Define como true para enviar apenas por conexões HTTPS
      httpOnly: false, // Evita que o cookie seja acessado por scripts do lado do cliente
    });
    res.send("Cookie configurado com sucesso!");
  } catch (error) {
    Logger.error("Erro no logout:", error);
    return res.status(500).json({ message: "Erro no servidor." });
  }
}

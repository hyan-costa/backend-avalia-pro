# Avalia-PRO

API para gerenciar a lógica de negócio de avaliação de projetos. Com autenticação e construída com Express, Prisma ORM, TypeScript e PostgreSQL. Suporta criação de usuários, login com senha criptografada e autenticação via token JWT.

---

## 🚀 Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [dotenv](https://github.com/motdotla/dotenv)

---

## 📁 Estrutura de Pastas

```
src/
├── controllers/        # Lógica dos controladores HTTP
├── middlewares/        # Middlewares (ex: autenticação)
├── repositories/       # Comunicação com o banco (Prisma)
├── routes/             # Definição das rotas Express
├── services/           # Regras de negócio
├── prisma/             # Schema e migrations do Prisma
├── app.ts           # Configuração do Express
├── server.ts        # Ponto de entrada da aplicação
```

---

## ⚙️ Configuração Inicial

1. **Clone o projeto**

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz com o seguinte conteúdo:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/avaliapro"
JWT_SECRET="sua_chave_secreta_aqui"
JWT_EXPIRES_IN="1d"
```

> Substitua os valores pelos corretos para seu ambiente.

---

## 🗃️ Banco de Dados com Prisma

### Criar a primeira migração

```bash
npx prisma migrate dev --name init
```

### Gerar client do Prisma (sempre após mudar o schema)

```bash
npx prisma generate
```

### Ver banco em UI (opcional)

```bash
npx prisma studio
```

---

## 🔁 Fazendo mudanças no schema Prisma

1. Edite o arquivo `prisma/schema.prisma`.
2. Execute o comando abaixo para criar e aplicar a nova migração:

```bash
npx prisma migrate dev --name sua-alteracao
```

3. Atualize o client do Prisma:

```bash
npx prisma generate
```

---

## ▶️ Rodando o Projeto

### Em desenvolvimento (hot reload com ts-node-dev)

```bash
npm run dev
```

> Certifique-se que o PostgreSQL está rodando e a `.env` está configurada corretamente.

---

## 🔐 Autenticação com JWT

### Enviar o token no header:

```http
Authorization: Bearer <seu-token-aqui>
```

O middleware `authenticateToken` será usado para proteger as rotas, por exemplo:

```ts
router.post("/users", authenticateToken, (req, res) =>
  userController.create(req, res)
);
```

---

## 🧪 Exemplos de Requisição

### Criar usuário

```http
POST /api/users
Content-Type: application/json

{
  "nome": "João",
  "email": "joao@email.com",
  "senha": "senha123"
}
```

### Login

```http
POST /api/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Resposta:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

---

## 📜 Scripts disponíveis no `package.json`

```json
"scripts": {
  "dev": "ts-node-dev --respawn src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "prisma:migrate": "npx prisma migrate dev",
  "prisma:generate": "npx prisma generate",
  "prisma:studio": "npx prisma studio"
}
```

---

## 📄 Licença

Este projeto está sob a licença MIT.

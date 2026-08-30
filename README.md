# 🍔 CapyFood

Backend de um aplicativo de delivery de comida inspirado no iFood, construído com **Node.js**, **TypeScript**, **Fastify** e **Prisma ORM**, seguindo os princípios de **Clean Architecture**, **Domain-Driven Design (DDD)** e **SOLID**.

O projeto conta com autenticação JWT para dois perfis de usuário (donos de restaurante e clientes), gerenciamento completo de cardápio com seções, ciclo de vida de pedidos com máquina de estados, sistema de avaliações e integração com um gateway de pagamento próprio (**PayFlow**) para processar transações e carteiras digitais.

---

## ✨ Funcionalidades

- 🔐 Autenticação JWT com dois perfis (`RestaurantOwner` e `Customer`)
- 🏪 Cadastro e gerenciamento de restaurantes, com upload de fotos via Cloudinary
- 🕒 Configuração de horários de funcionamento por dia da semana
- 📋 Cardápio organizado em **seções** (ex: "Combos do Momento", "Lançamentos")
- 🍕 CRUD completo de itens do cardápio, com disponibilidade e preço
- 🛒 Criação de pedidos com cálculo automático de total
- 🔄 Máquina de estados para o ciclo de vida do pedido (`PENDING → CONFIRMED → PREPARING → READY → DELIVERING → DELIVERED`)
- ⭐ Sistema de avaliações (nota de 1 a 5 + comentário) por restaurante
- 💳 Integração com o **PayFlow** — gateway de pagamento fictício com carteiras digitais, depósitos, transações e estornos automáticos
- 🔔 Webhooks para sincronização assíncrona de status de pagamento
- ✅ Cobertura de testes unitários na camada de domínio e aplicação com Vitest

---

## Stack do projeto

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20+ |
| Linguagem | TypeScript |
| Framework HTTP | Fastify |
| ORM | Prisma |
| Banco de dados | PostgreSQL |
| Validação | Zod |
| Autenticação | JWT (`@fastify/jwt` + `jsonwebtoken`) |
| Hash de senha | bcryptjs |
| Upload de imagens | Cloudinary |
| Testes | Vitest |
| Containerização | Docker + Docker Compose |

---

## Arquitetura

O projeto segue Clean Architecture com quatro camadas bem definidas:

```
src/
├── domain/            → Entidades, Value Objects, interfaces de repositório e erros de negócio
├── application/       → Casos de uso (regras de negócio orquestradas) e contratos de serviços externos (ports)
├── infrastructure/    → Implementações concretas: Prisma, Cloudinary, JWT, HTTP (Fastify)
└── shared/            → Utilitários compartilhados (Either, validação de env)
```

**Regra de dependência:** as camadas internas (`domain`, `application`) nunca importam de `infrastructure`. A infraestrutura implementa as interfaces definidas pelo domínio, mantendo o núcleo da aplicação independente de frameworks e bibliotecas externas.

Erros de regra de negócio são tratados com o padrão **`Either<Left, Right>`**, evitando exceções cruzando camadas.

---

## Pré-requisitos

- Node.js 20 ou superior
- Docker e Docker Compose (recomendado) **ou** PostgreSQL instalado localmente
- Uma conta no [Cloudinary](https://cloudinary.com) para upload de imagens
- Uma instância do PayFlow rodando (gateway de pagamento) — veja o repositório separado (https://github.com/foxzinnx/payment-gateway)

---

## Como rodar o projeto

### 1. Clone o repositório e instale as dependências

```bash
git clone https://github.com/foxzinnx/capyfood-backend.git
cd capyfood-backend
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Preencha o `.env` com seus valores (veja a tabela completa [abaixo](#-variáveis-de-ambiente)).

### 3. Suba o banco de dados

**Opção A — Docker (recomendado):**

```bash
npm run docker:dev
```

**Opção B — PostgreSQL local:** configure a `DATABASE_URL` no `.env` apontando para sua instância.

### 4. Rode as migrations do Prisma

```bash
npm run prisma:migrate
```

### 5. Inicie o servidor

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3333`.

---

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `NODE_ENV` | `development`, `production` ou `test` |
| `PORT` | Porta do servidor (padrão: `3333`) |
| `DATABASE_URL` | String de conexão do PostgreSQL |
| `JWT_SECRET` | Chave secreta para assinatura dos tokens (mínimo 32 caracteres) |
| `JWT_EXPIRES_IN` | Tempo de expiração do token (padrão: `7d`) |
| `BCRYPT_SALT_ROUNDS` | Rounds do bcrypt para hash de senha (padrão: `10`) |
| `CLOUDINARY_CLOUD_NAME` | Nome da conta Cloudinary |
| `CLOUDINARY_API_KEY` | API Key do Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret do Cloudinary |
| `PAYFLOW_URL` | URL base da instância do PayFlow |
| `PAYFLOW_API_KEY` | API Key para autenticar no PayFlow |
| `PAYFLOW_WEBHOOK_SECRET` | Secret para validar a assinatura dos webhooks recebidos |
| `PAYFLOW_PASSWORD_SECRET` | Secret usado para gerar senhas determinísticas de integração — **nunca altere em produção** |

> ⚠️ A aplicação valida todas as variáveis de ambiente no startup usando Zod. Se alguma estiver ausente ou inválida, o servidor não sobe e exibe uma mensagem indicando exatamente qual variável corrigir.

---

## Scripts disponíveis

```bash
npm run dev                # inicia o servidor em modo desenvolvimento (hot reload)
npm run build               # compila o TypeScript para produção
npm run start                # inicia o servidor já compilado

npm run prisma:migrate       # roda as migrations em desenvolvimento
npm run prisma:migrate:prod  # aplica as migrations em produção
npm run prisma:studio        # abre o Prisma Studio

npm run test                 # roda os testes unitários
npm run test:watch           # roda os testes em modo watch
npm run test:coverage        # gera relatório de cobertura

npm run docker:dev           # sobe apenas o banco de dados (desenvolvimento)
npm run docker:up            # sobe banco + aplicação (produção)
npm run docker:down          # derruba os containers
npm run docker:logs          # acompanha os logs da aplicação
```

---

## Principais Endpoints

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/owners/register` | — | Cadastra um dono de restaurante |
| `POST` | `/owners/sessions` | — | Autentica o dono |
| `POST` | `/customers/register` | — | Cadastra um cliente |
| `POST` | `/customers/sessions` | — | Autentica o cliente |
| `GET` | `/restaurants` | — | Lista restaurantes com filtros |
| `POST` | `/restaurants` | Owner | Cria o restaurante do dono autenticado |
| `PATCH` | `/restaurants/:id/status` | Owner | Alterna aberto/fechado |
| `PUT` | `/restaurants/:id/hours` | Owner | Define horários de funcionamento |
| `POST` | `/restaurants/:id/sections` | Owner | Cria uma seção do cardápio |
| `POST` | `/restaurants/:id/menu-items` | Owner | Cria um item do cardápio |
| `POST` | `/orders` | Customer | Cria um pedido (processa pagamento via PayFlow) |
| `PATCH` | `/orders/:id/status` | Owner | Avança o status do pedido |
| `PATCH` | `/orders/:id/cancel` | Customer | Cancela o pedido (com estorno automático) |
| `POST` | `/restaurants/:id/reviews` | Customer | Avalia um restaurante |
| `GET` | `/customers/wallet` | Customer | Consulta o saldo da carteira |
| `POST` | `/customers/wallet/deposit` | Customer | Deposita saldo na carteira |
| `GET` | `/restaurant-owners/wallet` | Owner | Consulta o saldo recebido |
| `POST` | `/webhooks/payflow` | — | Recebe notificações assíncronas do PayFlow |

---

## Testes

O projeto usa **Vitest** com repositórios em memória e *fakes* de serviços externos, permitindo testar toda a camada de domínio e aplicação sem depender de banco de dados ou chamadas HTTP reais.

```bash
npm run test
```

---

## Docker

O projeto inclui um `Dockerfile` com **multi-stage build** — a imagem final de produção não carrega `devDependencies` nem código-fonte, apenas o build compilado.

```bash
npm run docker:up      # sobe banco + aplicação
npm run docker:logs    # acompanha os logs
npm run docker:down    # derruba os containers
```

---

## Autor

Desenvolvido por **Bryan Gomes**

- GitHub: [github.com/foxzinnx](https://github.com/foxzinnx)
- LinkedIn: [linkedin.com/in/bryangomes](https://www.linkedin.com/in/bryangomes)

---

## Licença

Este projeto está sob a licença MIT.

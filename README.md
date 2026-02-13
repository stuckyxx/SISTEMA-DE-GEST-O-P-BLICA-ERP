<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/17WyA9-RoVBOHJI1Nan88YXtClhLwWRoH

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   ```bash
   npm run dev
   ```

## API / Backend

O backend expõe **duas APIs** com documentações separadas:

| API | Doc (Swagger) | Base URL | Uso no app |
|-----|----------------|----------|------------|
| **Admin** | [backgestao.../apidoc/swagger/](https://backgestao.pythonanywhere.com/apidoc/swagger/) | `https://backgestao.pythonanywhere.com` (prod) ou `/api-admin` (dev) | Painel Master: **clientes** (listar, criar, editar, excluir) |
| **Banco do cliente** | [backgestao.../docs/swagger/](https://backgestao.pythonanywhere.com/docs/swagger/) | `https://backgestao.pythonanywhere.com` (prod) ou `/api` (dev) | Login, **usuários**, entidades, fornecedores, atas, contratos, etc. |

**Nota**: Os endpoints da API Admin estão na raiz do servidor (não em `/apidoc/`). O `/apidoc/` é apenas para a documentação Swagger.

- Os **usuários** de cada instância são salvos na **API do banco do cliente** (`/usuarios/`), não na API Admin.
- No Painel Master, "Configurar banco e usuários" → lista/cria usuários via API do banco do cliente; a lista de **clientes** e o CRUD de clientes usam a API Admin.

### Credenciais de acesso (login na API)

O login do Painel Master usa as credenciais abaixo. Os usuários de cada instância são criados no Gerenciador (Painel Master → Configurar Banco → Usuários) e salvos no backend; o login na instância usa o usuário e senha criados para aquela entidade.

| Campo    | Valor               |
|----------|---------------------|
| Username | `admin`             |
| Senha    | `[CONSULTE O ADMINISTRADOR DO SISTEMA]`  |

Para acessar uma instância (ex.: `/#/pm-anajatuba-ma`), use o usuário e senha criados no Gerenciador para essa entidade (ou as credenciais acima se ainda não houver usuário por entidade).

### API de usuários (conforme Swagger)

Na documentação (Swagger) o backend expõe:

| Método | Endpoint        | Descrição        |
|--------|-----------------|------------------|
| GET    | `/usuarios/`    | Listar usuários  |
| POST   | `/usuarios/`    | Criar usuário    |
| GET    | `/usuarios/{id}`| Obter usuário    |
| PUT    | `/usuarios/{id}`| Atualizar usuário|
| DELETE | `/usuarios/{id}`| Excluir usuário  |

**Schema de criação (POST /usuarios/):** o backend espera JSON com:

- `nome` (string)
- `username` (string)
- `senha` (string)
- `role` (string, ex.: `admin` ou `viewer`)
- `entidade_id` (number, id da entidade/cliente)

Para conferir os campos exatos e obrigatórios, abra o Swagger, vá em **Usuários → POST /usuarios/** e expanda o schema **UsuarioCreate**.

### Conformidade do app com a doc backend

O front usa **react-hook-form** nos formulários de login e do Painel Master. Os payloads seguem a documentação:

| API | Endpoint | Método | Uso no app |
|-----|----------|--------|------------|
| Banco do cliente | `/auth/login` | POST `{ "username", "password" }` | Login e Painel Master |
| **Admin** | `/clientes/` | GET, POST, PUT, DELETE | Lista e CRUD de clientes (Painel Master) |
| Banco do cliente | `/usuarios/` | GET, POST, PUT, DELETE | Lista e CRUD de usuários da instância (Gerenciador) |

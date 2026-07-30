# Rotina & Trading

Agenda pessoal (calendário + rotina semanal) e diário de trading, com login único e banco SQLite local. Feito para uso individual.

## Stack

- **Next.js 16** (App Router) — as rotas em `src/app/api/**/route.js` fazem o papel de **Controller**, os componentes em `src/components/**` são a **View**, e `src/lib/models/**` é o **Model** (acesso ao SQLite).
- **SQLite** via `node:sqlite` (módulo nativo do Node, sem dependência de build) — arquivo em `data/app.db`, criado automaticamente na primeira execução.
- **Tailwind CSS v4** para estilo, tema escuro fixo baseado no protótipo original (`reference/agenda-rotina-trading.html`).
- **lucide-react** para ícones.
- **Radix Dialog** para os modais.
- Login único (usuário/senha) com sessão em cookie assinado (JWT via `jose`), protegido por `src/proxy.js` (o antigo `middleware.js`, renomeado conforme a nova convenção do Next 16).

## Rodando localmente

Requer **Node.js 22.5+** (por causa do `node:sqlite`). Você tem o Node 24 instalado.

```bash
npm install
```

Crie o `.env.local` (copie `.env.example`) e gere suas credenciais:

```bash
# hash da senha (em base64 — veja o comentário no .env.example sobre o motivo)
node scripts/hash-password.js "SUA_SENHA_AQUI"

# segredo da sessão
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Cole os dois valores no `.env.local`, junto com `AUTH_USERNAME`.

```bash
npm run dev
```

Acesse `http://localhost:3000/login`.

> Um `.env.local` de teste já foi deixado configurado com usuário `gustavo` e senha `trocar123` — **troque essa senha** gerando um novo hash e substituindo `AUTH_PASSWORD_HASH_B64`.

## Banco de dados

O SQLite fica em `data/app.db` (ignorado pelo git). Para levar seus dados para outra máquina, basta copiar esse arquivo — é tudo que existe, sem migrações externas.

## Estrutura

```
src/
  app/
    login/            tela de login
    api/               controllers (route handlers)
    page.js            página protegida (renderiza o AppShell)
  components/
    ui/                Modal, Button, ConfirmModal (primitivos reutilizados nos modais)
    calendar/          aba "Calendário principal"
    weekly/            aba "Rotina semanal"
    trading/           aba "Trading"
  lib/
    db.js              conexão SQLite + schema/migração
    models/            funções de acesso a dados (M do MVC)
    auth.js, session.js autenticação e cookie de sessão
  proxy.js              guarda de autenticação (roda antes de toda rota)
```

## Deploy

Este projeto foi montado para **SQLite de arquivo real**, então não é compatível com o runtime serverless da Vercel (disco efêmero). Para colocar no ar, use uma máquina/VPS com disco persistente (ex.: Railway, Fly.io, uma VM própria) rodando `npm run build && npm run start`, com o `.env.local` (ou variáveis de ambiente equivalentes) configurado no servidor.

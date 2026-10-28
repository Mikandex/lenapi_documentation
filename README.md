# LenAPI Developer Documentation

This Next.js site contains step-by-step guides for the LenAPI Python framework. It is designed to be opened and edited as a project in PyCharm.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The dev script pins the port to 3000.

## Build

```bash
npm run build
npm start
```

Guide text and examples live in `src/app/docs-data.ts`. The interactive documentation layout is in `src/app/page.tsx` and its styles are in `src/app/page.module.css`.

## Coverage

The guides cover the introduction and quickstart, HTTP routing, independent project mounting, Pydantic validation, SQL models and migrations, CRUD/search/pagination, async database access, authentication, social login, middleware and security, public/private uploads, WebSockets, cache, webhooks, durable background jobs, AI/Faker, testing, deployment, and the optional model admin console. The admin guide explains model/field allow-lists, per-model permissions, resource monitoring, and the single admin entry point for mounted projects. Examples reflect the framework README and call out MongoDB's beta status and other documented limits.

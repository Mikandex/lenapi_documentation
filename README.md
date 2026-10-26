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

The guides cover the introduction and quickstart, routing, Pydantic validation, dependencies, SQL models and migrations, CRUD/search/pagination, async database access, authentication, social login, middleware and security, uploads, WebSockets, cache, background jobs, AI/Faker, testing, and deployment. Examples reflect the framework's current README and note documented process-local and provider support limits where applicable.

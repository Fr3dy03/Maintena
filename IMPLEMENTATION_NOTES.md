# Maintena implementation plan

The workspace was empty, so this implementation starts a Next.js App Router + TypeScript application.

## MVP slices

1. Establish the Maintena visual system and responsive operations/mobile shell.
2. Add PostgreSQL Prisma schema for organisations, memberships, sites, assets, warranties, work orders, service evidence, claims, attachments and chain proofs.
3. Provide demo persistence through Prisma seed data and server-side domain helpers; production authentication/storage adapters are explicit extension points.
4. Implement overview, assets, work orders, technician today, QR/manual asset lookup, and public requester routes.
5. Add warranty coverage logic and Vitest tests for coverage and role rules.
6. Add PWA manifest/service worker shell and document environment/run commands.

## Deliberate limitations

The initial empty-repository build does not claim a live database, email provider, S3 bucket, real camera scan, PDF rendering service, or BOT Chain transaction. Those are represented by typed boundaries and feature flags; they require local environment credentials to exercise.
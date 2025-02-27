# multi-lang-docs-service

The API services for Multi Lang Docs project.

```
npm install
```

## To run, dev and try

```
npm run dev
```

To try the prod environment:

```
npm run prod
```

## To deploy

```
npm run deploy -- -e dev
npm run deploy -- -e prod
```

## SQL migrations

### Create migrations

To create a new migration in dev:

```
wrangler d1 migrations create multi-lang-docs-service-dev-db init_schema -e dev
```

To create a new migration in prod:

```
wrangler d1 migrations create multi-lang-docs-service-db init_schema -e prod
```

### Apply migrations

To apply the migration in dev locally:

```
npx wrangler d1 migrations apply multi-lang-docs-service-dev-db --local -e dev
```

To apply the migration in prod locally:

```
npx wrangler d1 migrations apply multi-lang-docs-service-db --local -e prod
```

To apply the migrations remotely: it will be applied automatically in the GitHub action.

### List migrations

To list pending migrations:

```
npx wrangler d1 migrations list multi-lang-docs-service-dev-db --local -e dev
npx wrangler d1 migrations list multi-lang-docs-service-db --local -e prod
```

```
npx wrangler d1 migrations list multi-lang-docs-service-dev-db -e dev
npx wrangler d1 migrations list multi-lang-docs-service-db -e prod
```

(I don't tried it yet)
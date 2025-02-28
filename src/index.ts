import app from '@presentation/routes';

export default {
  async fetch(request: Request, env: { DB: D1Database }, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
};
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid'; // Use uuid package for UUID generation

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware for Bearer Token Authentication (excluding public endpoints)
app.use('*', async (c, next) => {
  const publicEndpoints = ['/users', '/users/token'];
  if (publicEndpoints.includes(c.req.path) && c.req.method === 'POST') {
    return next();
  }
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Bearer Token required' }, 401);
  }
  const token = authHeader.split(' ')[1];
  const user = await c.env.DB.prepare('SELECT * FROM Users WHERE token = ?')
    .bind(token)
    .first();
  if (!user) return c.json({ error: 'Invalid token' }, 401);
  await next();
});

// --- Users Routes ---

// Create a new user and generate a Bearer Token
app.post(
  '/users',
  zValidator('json', z.object({ username: z.string().min(1) })),
  async (c) => {
    const { username } = c.req.valid('json');
    const existingUser = await c.env.DB.prepare('SELECT id FROM Users WHERE username = ?')
      .bind(username)
      .first();
    if (existingUser) return c.json({ error: 'Username already exists' }, 409);
    const id = uuidv4(); // Use uuidv4 instead of randomUUID
    const token = uuidv4();
    await c.env.DB.prepare('INSERT INTO Users (id, username, token) VALUES (?, ?, ?)')
      .bind(id, username, token)
      .run();
    return c.json({ id, username, token }, 201);
  }
);

// Retrieve a user by ID (excludes token)
app.get('/users/:id', async (c) => {
  const id = c.req.param('id');
  const user = await c.env.DB.prepare('SELECT id, username FROM Users WHERE id = ?')
    .bind(id)
    .first();
  if (!user) return c.json({ error: 'User not found' }, 404);
  return c.json(user);
});

// Update a user's username
app.put(
  '/users/:id',
  zValidator('json', z.object({ username: z.string().min(1) })),
  async (c) => {
    const id = c.req.param('id');
    const { username } = c.req.valid('json');
    const existingUser = await c.env.DB.prepare('SELECT id FROM Users WHERE id = ?')
      .bind(id)
      .first();
    if (!existingUser) return c.json({ error: 'User not found' }, 404);
    const usernameExists = await c.env.DB.prepare('SELECT id FROM Users WHERE username = ? AND id != ?')
      .bind(username, id)
      .first();
    if (usernameExists) return c.json({ error: 'Username already exists' }, 409);
    await c.env.DB.prepare('UPDATE Users SET username = ? WHERE id = ?')
      .bind(username, id)
      .run();
    return c.json({ id, username });
  }
);

// Delete a user by ID
app.delete('/users/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare('DELETE FROM Users WHERE id = ?')
    .bind(id)
    .run();
  if (result.meta.rows_written === 0) return c.json({ error: 'User not found' }, 404);
  return c.json({ message: 'User deleted' });
});

// List all users (excludes tokens)
app.get('/users', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT id, username FROM Users').all();
  return c.json(results);
});

// Generate a new Bearer Token for a user
app.post(
  '/users/token',
  zValidator('json', z.object({ username: z.string().min(1) })),
  async (c) => {
    const { username } = c.req.valid('json');
    const user = await c.env.DB.prepare('SELECT id, username FROM Users WHERE username = ?')
      .bind(username)
      .first();
    if (!user) return c.json({ error: 'User not found' }, 404);
    const newToken = uuidv4();
    await c.env.DB.prepare('UPDATE Users SET token = ? WHERE id = ?')
      .bind(newToken, user.id)
      .run();
    return c.json({ id: user.id, username, token: newToken });
  }
);

// --- Websites Routes ---

// Create a new website for processing
app.post(
  '/websites',
  zValidator('json', z.object({
    url: z.string().url(),
    name: z.string().min(1),
    check_interval: z.string().optional()
  })),
  async (c) => {
    const { url, name, check_interval } = c.req.valid('json');
    const id = uuidv4(); // Use uuidv4 instead of randomUUID
    await c.env.DB.prepare('INSERT INTO Websites (id, url, name, check_interval) VALUES (?, ?, ?, ?)')
      .bind(id, url, name, check_interval || null)
      .run();
    return c.json({ id }, 201);
  }
);

// Retrieve a website by ID
app.get('/websites/:id', async (c) => {
  const id = c.req.param('id');
  const website = await c.env.DB.prepare('SELECT * FROM Websites WHERE id = ?')
    .bind(id)
    .first();
  if (!website) return c.json({ error: 'Website not found' }, 404);
  return c.json(website);
});

// Update a website's details
app.put(
  '/websites/:id',
  zValidator('json', z.object({
    url: z.string().url().optional(),
    name: z.string().min(1).optional(),
    check_interval: z.string().optional()
  })),
  async (c) => {
    const id = c.req.param('id');
    const { url, name, check_interval } = c.req.valid('json');
    const website = await c.env.DB.prepare('SELECT * FROM Websites WHERE id = ?')
      .bind(id)
      .first();
    if (!website) return c.json({ error: 'Website not found' }, 404);
    await c.env.DB.prepare('UPDATE Websites SET url = ?, name = ?, check_interval = ? WHERE id = ?')
      .bind(url || website.url, name || website.name, check_interval || website.check_interval, id)
      .run();
    return c.json({ id, url: url || website.url, name: name || website.name, check_interval: check_interval || website.check_interval });
  }
);

// Delete a website by ID
app.delete('/websites/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare('DELETE FROM Websites WHERE id = ?')
    .bind(id)
    .run();
  if (result.meta.rows_written === 0) return c.json({ error: 'Website not found' }, 404);
  return c.json({ message: 'Website deleted' });
});

// List all websites
app.get('/websites', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM Websites').all();
  return c.json(results);
});

// --- Translations Routes ---

// Create a translation for a website
app.post(
  '/websites/:website_id/translations',
  zValidator('json', z.object({
    language: z.string().min(1),
    formality: z.string().optional(),
    custom_terms: z.string().optional()
  })),
  async (c) => {
    const website_id = c.req.param('website_id');
    const { language, formality, custom_terms } = c.req.valid('json');
    const website = await c.env.DB.prepare('SELECT id FROM Websites WHERE id = ?')
      .bind(website_id)
      .first();
    if (!website) return c.json({ error: 'Website not found' }, 404);
    const id = uuidv4(); // Use uuidv4 instead of randomUUID
    await c.env.DB.prepare('INSERT INTO Translations (id, website_id, language, formality, custom_terms) VALUES (?, ?, ?, ?, ?)')
      .bind(id, website_id, language, formality || null, custom_terms || null)
      .run();
    return c.json({ id }, 201);
  }
);

// Retrieve a translation by ID
app.get('/websites/:website_id/translations/:translation_id', async (c) => {
  const translation_id = c.req.param('translation_id');
  const translation = await c.env.DB.prepare('SELECT * FROM Translations WHERE id = ?')
    .bind(translation_id)
    .first();
  if (!translation) return c.json({ error: 'Translation not found' }, 404);
  return c.json(translation);
});

// Update a translation's details
app.put(
  '/websites/:website_id/translations/:translation_id',
  zValidator('json', z.object({
    language: z.string().min(1).optional(),
    formality: z.string().optional(),
    custom_terms: z.string().optional()
  })),
  async (c) => {
    const translation_id = c.req.param('translation_id');
    const { language, formality, custom_terms } = c.req.valid('json');
    const translation = await c.env.DB.prepare('SELECT * FROM Translations WHERE id = ?')
      .bind(translation_id)
      .first();
    if (!translation) return c.json({ error: 'Translation not found' }, 404);
    await c.env.DB.prepare('UPDATE Translations SET language = ?, formality = ?, custom_terms = ? WHERE id = ?')
      .bind(language || translation.language, formality || translation.formality, custom_terms || translation.custom_terms, translation_id)
      .run();
    return c.json({ id: translation_id, language: language || translation.language, formality: formality || translation.formality, custom_terms: custom_terms || translation.custom_terms });
  }
);

// Delete a translation by ID
app.delete('/websites/:website_id/translations/:translation_id', async (c) => {
  const translation_id = c.req.param('translation_id');
  const result = await c.env.DB.prepare('DELETE FROM Translations WHERE id = ?')
    .bind(translation_id)
    .run();
  if (result.meta.rows_written === 0) return c.json({ error: 'Translation not found' }, 404);
  return c.json({ message: 'Translation deleted' });
});

// List all translations for a website
app.get('/websites/:website_id/translations', async (c) => {
  const website_id = c.req.param('website_id');
  const { results } = await c.env.DB.prepare('SELECT * FROM Translations WHERE website_id = ?')
    .bind(website_id)
    .all();
  return c.json(results);
});

// --- Articles Routes ---

// Create an article for a website
app.post(
  '/websites/:website_id/articles',
  zValidator('json', z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    affiliate_programs: z.array(z.string()).optional()
  })),
  async (c) => {
    const website_id = c.req.param('website_id');
    const { title, content, affiliate_programs } = c.req.valid('json');
    const website = await c.env.DB.prepare('SELECT id FROM Websites WHERE id = ?')
      .bind(website_id)
      .first();
    if (!website) return c.json({ error: 'Website not found' }, 404);
    const id = uuidv4(); // Use uuidv4 instead of randomUUID
    await c.env.DB.prepare('INSERT INTO Articles (id, website_id, title, content) VALUES (?, ?, ?, ?)')
      .bind(id, website_id, title, content)
      .run();
    if (affiliate_programs && affiliate_programs.length > 0) {
      const values = affiliate_programs.map(ap => [id, ap]);
      await c.env.DB.batch(
        values.map(([article_id, affiliate_program_id]) =>
          c.env.DB.prepare('INSERT INTO ArticleAffiliatePrograms (article_id, affiliate_program_id) VALUES (?, ?)')
            .bind(article_id, affiliate_program_id)
        )
      );
    }
    return c.json({ id }, 201);
  }
);

// Retrieve an article by ID
app.get('/articles/:article_id', async (c) => {
  const article_id = c.req.param('article_id');
  const article = await c.env.DB.prepare('SELECT * FROM Articles WHERE id = ?')
    .bind(article_id)
    .first();
  if (!article) return c.json({ error: 'Article not found' }, 404);
  const affiliatePrograms = await c.env.DB.prepare('SELECT affiliate_program_id FROM ArticleAffiliatePrograms WHERE article_id = ?')
    .bind(article_id)
    .all();
  return c.json({ ...article, affiliate_programs: affiliatePrograms.results.map(ap => ap.affiliate_program_id) });
});

// Update an article's details
app.put(
  '/articles/:article_id',
  zValidator('json', z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    affiliate_programs: z.array(z.string()).optional()
  })),
  async (c) => {
    const article_id = c.req.param('article_id');
    const { title, content, affiliate_programs } = c.req.valid('json');
    const article = await c.env.DB.prepare('SELECT * FROM Articles WHERE id = ?')
      .bind(article_id)
      .first();
    if (!article) return c.json({ error: 'Article not found' }, 404);
    await c.env.DB.prepare('UPDATE Articles SET title = ?, content = ? WHERE id = ?')
      .bind(title || article.title, content || article.content, article_id)
      .run();
    if (affiliate_programs) {
      await c.env.DB.prepare('DELETE FROM ArticleAffiliatePrograms WHERE article_id = ?')
        .bind(article_id)
        .run();
      if (affiliate_programs.length > 0) {
        const values = affiliate_programs.map(ap => [article_id, ap]);
        await c.env.DB.batch(
          values.map(([article_id, affiliate_program_id]) =>
            c.env.DB.prepare('INSERT INTO ArticleAffiliatePrograms (article_id, affiliate_program_id) VALUES (?, ?)')
              .bind(article_id, affiliate_program_id)
          )
        );
      }
    }
    return c.json({ id: article_id, title: title || article.title, content: content || article.content });
  }
);

// Delete an article by ID
app.delete('/articles/:article_id', async (c) => {
  const article_id = c.req.param('article_id');
  await c.env.DB.prepare('DELETE FROM ArticleAffiliatePrograms WHERE article_id = ?')
    .bind(article_id)
    .run();
  const result = await c.env.DB.prepare('DELETE FROM Articles WHERE id = ?')
    .bind(article_id)
    .run();
  if (result.meta.rows_written === 0) return c.json({ error: 'Article not found' }, 404);
  return c.json({ message: 'Article deleted' });
});

// List all articles for a website
app.get('/websites/:website_id/articles', async (c) => {
  const website_id = c.req.param('website_id');
  const { results } = await c.env.DB.prepare('SELECT * FROM Articles WHERE website_id = ?')
    .bind(website_id)
    .all();
  return c.json(results);
});

// --- Affiliate Programs Routes ---

// Create a new affiliate program
app.post(
  '/affiliate-programs',
  zValidator('json', z.object({
    name: z.string().min(1),
    details: z.string().optional()
  })),
  async (c) => {
    const { name, details } = c.req.valid('json');
    const id = uuidv4(); // Use uuidv4 instead of randomUUID
    await c.env.DB.prepare('INSERT INTO AffiliatePrograms (id, name, details) VALUES (?, ?, ?)')
      .bind(id, name, details || null)
      .run();
    return c.json({ id }, 201);
  }
);

// Retrieve an affiliate program by ID
app.get('/affiliate-programs/:id', async (c) => {
  const id = c.req.param('id');
  const program = await c.env.DB.prepare('SELECT * FROM AffiliatePrograms WHERE id = ?')
    .bind(id)
    .first();
  if (!program) return c.json({ error: 'Affiliate program not found' }, 404);
  return c.json(program);
});

// Update an affiliate program's details
app.put(
  '/affiliate-programs/:id',
  zValidator('json', z.object({
    name: z.string().min(1).optional(),
    details: z.string().optional()
  })),
  async (c) => {
    const id = c.req.param('id');
    const { name, details } = c.req.valid('json');
    const program = await c.env.DB.prepare('SELECT * FROM AffiliatePrograms WHERE id = ?')
      .bind(id)
      .first();
    if (!program) return c.json({ error: 'Affiliate program not found' }, 404);
    await c.env.DB.prepare('UPDATE AffiliatePrograms SET name = ?, details = ? WHERE id = ?')
      .bind(name || program.name, details || program.details, id)
      .run();
    return c.json({ id, name: name || program.name, details: details || program.details });
  }
);

// Delete an affiliate program by ID
app.delete('/affiliate-programs/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM ArticleAffiliatePrograms WHERE affiliate_program_id = ?')
    .bind(id)
    .run();
  const result = await c.env.DB.prepare('DELETE FROM AffiliatePrograms WHERE id = ?')
    .bind(id)
    .run();
  if (result.meta.rows_written === 0) return c.json({ error: 'Affiliate program not found' }, 404);
  return c.json({ message: 'Affiliate program deleted' });
});

// List all affiliate programs
app.get('/affiliate-programs', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM AffiliatePrograms').all();
  return c.json(results);
});

// --- Stats Routes (Placeholder) ---

// Retrieve profits per website per affiliate program (mock data)
app.get('/stats/websites-profits', async (c) => {
  return c.json({
    website1: { affiliate_program1: 100.0, affiliate_program2: 50.0 },
    website2: { affiliate_program1: 75.0 }
  });
});

// Retrieve total profits per affiliate program (mock data)
app.get('/stats/affiliate-programs-profits', async (c) => {
  return c.json({
    affiliate_program1: 175.0,
    affiliate_program2: 50.0
  });
});

export default app;
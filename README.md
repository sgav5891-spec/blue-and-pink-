# Stories site (Cloudflare Pages + D1, free)

1. Create a free Cloudflare account and a GitHub account.
2. Upload this folder to a new GitHub repo.
3. Cloudflare dashboard > Storage & Databases > D1 > Create database "stories-db".
   Open it > Console > paste everything from schema.sql > Execute.
4. Copy the database ID into wrangler.toml (database_id), commit.
5. Workers & Pages > Create > Pages > Connect to Git > pick the repo.
   Build command: (leave empty). Output directory: public. Deploy.
6. Project > Settings > Bindings > Add > D1 database: variable name DB, pick stories-db.
7. Project > Settings > Variables and Secrets > add secret ADMIN_PASSWORD (your password).
8. Redeploy (Deployments > Retry). Done.

Readers: https://YOUR-PROJECT.pages.dev
Admin:   https://YOUR-PROJECT.pages.dev/admin.html

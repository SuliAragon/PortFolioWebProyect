import { defineConfig } from 'astro/config';

const [owner, repository] = (process.env.GITHUB_REPOSITORY || '').split('/');
const isUserSite = repository?.toLowerCase() === `${owner?.toLowerCase()}.github.io`;

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || (owner ? `https://${owner}.github.io` : undefined),
  base: process.env.BASE_PATH || (repository && !isUserSite ? `/${repository}` : '/'),
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});

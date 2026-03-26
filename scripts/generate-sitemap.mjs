import fs from 'fs';
import { resolve } from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://salmara.com';
const PUBLIC_DIR = resolve(process.cwd(), 'public');

const staticRoutes = [
  '',
  '/shop',
  '/about',
  '/clinics',
  '/contact',
  '/login',
  '/wishlist',
];

async function getProductHandles() {
  const storeDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN || 'salmara-5.myshopify.com';
  const apiVersion = process.env.VITE_SHOPIFY_API_VERSION || '2024-01';
  const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

  if (!adminToken) {
    console.warn('⚠️ SHOPIFY_ADMIN_API_ACCESS_TOKEN not found. Skipping dynamic products.');
    return [];
  }

  const query = `
    {
      products(first: 250) {
        edges {
          node {
            handle
            updatedAt
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(`https://${storeDomain}/admin/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    return data.data.products.edges.map(edge => ({
      url: `/product/${edge.node.handle}`,
      lastmod: edge.node.updatedAt.split('T')[0],
    }));
  } catch (error) {
    console.error('❌ Failed to fetch products:', error);
    return [];
  }
}

async function generate() {
  console.log('🚀 Generating sitemap...');
  
  const productRoutes = await getProductHandles();
  
  const allRoutes = [
    ...staticRoutes.map(route => ({ url: route, lastmod: new Date().toISOString().split('T')[0] })),
    ...productRoutes,
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(route => `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${route.url === '' ? '1.0' : '0.8'}</priority>
  </url>`)
  .join('\n')}
</urlset>`;

  fs.writeFileSync(resolve(PUBLIC_DIR, 'sitemap.xml'), sitemap);
  console.log('✅ Sitemap generated successfully at public/sitemap.xml');
}

generate();

import type { NextConfig } from 'next';

const pages = process.env.HYDRAULIC_PAGES === 'true';
const nextConfig: NextConfig = pages
  ? { output: 'export', basePath: '/hydraulic-lab', trailingSlash: true }
  : {};
export default nextConfig;

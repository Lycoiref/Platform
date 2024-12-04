/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 注意: 这会在生产构建期间忽略所有 ESLint 错误!
    ignoreDuringBuilds: true,
  },
  transpilePackages: [
    '@douyinfe/semi-ui',
    '@douyinfe/semi-icons',
    '@douyinfe/semi-illustrations',
  ],
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/, // 仅处理 JS/TS 文件中导入的 SVG
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: true, // 使用 SVGO 优化 SVG（可根据需求禁用）
            titleProp: true,
            ref: true,
          },
        },
      ],
    })

    return config
  },
}

export default nextConfig
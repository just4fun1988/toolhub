# ToolHub

一个人工筛选、移动端友好的在线工具目录。当前版本包含 24 个工具、6 个分类，支持中英双语、深浅主题、即时搜索和键盘操作。

- 线上站点：<https://tool.tools365.it.com/>
- Worker 地址：<https://toolhub.tpeng880616.workers.dev/>
- 部署平台：Cloudflare Workers Static Assets（不是 Cloudflare Pages）

## 本地开发

```bash
npm install
npm run dev
```

Wrangler 会输出本地预览地址。提交前运行：

```bash
npm run check
```

## GitHub → Cloudflare Workers 自动部署

本项目使用 Cloudflare Workers Builds 的 GitHub 原生集成。推送到生产分支后，由 Cloudflare 自动执行部署；不使用 Pages，也不需要在 GitHub 保存 Cloudflare Token。

Cloudflare 中的推荐设置：

| 设置 | 值 |
| --- | --- |
| Git repository | `tpeng880616-hub/toolhub` |
| Production branch | `master` |
| Root directory | `/` |
| Build command | `npm run check` |
| Deploy command | `npm run deploy` |
| Non-production deploy command | `npx wrangler versions upload` |

配置位置：Cloudflare 控制台 → Workers → `toolhub` → Settings → Builds → Connect repository。现有自定义域名继续绑定到 `toolhub` Worker 即可。

部署的唯一配置源是 [`wrangler.jsonc`](./wrangler.jsonc)：静态文件来自 `public/`，`src/index.js` 负责响应安全头和缓存策略。

## 项目结构

```text
public/               网站 HTML、CSS、JavaScript 与 SEO 文件
src/index.js          Cloudflare Worker 入口
scripts/check-site.mjs 结构和部署前检查
wrangler.jsonc        Workers Static Assets 配置
```

## 收录新工具

使用 GitHub 的 **Suggest a tool** Issue 模板。收录标准：浏览器可用、用途明确、链接可信，且不会用误导式按钮诱导下载。

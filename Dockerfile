FROM node:22.23.1-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.5.3 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ENV ENABLE_CONTENT_SYNC=false
RUN pnpm build

FROM nginx:1.29.1-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
# FileBrowser 上传的文件固定是 0640/0750，而 nginx worker 以 nginx 用户运行，
# 不放开读权限会 403。统一规范化，避免每次传图都要手动 chmod。
RUN chmod -R a+rX /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

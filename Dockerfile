FROM node:20-slim
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./

# stdio MCP server — the container speaks MCP over stdin/stdout.
ENTRYPOINT ["node", "server.js"]

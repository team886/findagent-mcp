FROM node:20-slim
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./

# stdio MCP server — the container speaks MCP over stdin/stdout.
ENTRYPOINT ["node", "server.js"]

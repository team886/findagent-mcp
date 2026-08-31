<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./.github/logo-dark.svg">
    <img alt="FindAgent" src="./.github/logo.svg" width="360">
  </picture>
</p>

<p align="center"><strong>The MCP server for FindAgent — the vetted, cross-LLM marketplace of "doer" agents.</strong></p>

<p align="center">
  <a href="https://findagent.cloud">findagent.cloud</a> ·
  <a href="https://beta.findagent.cloud/docs/connect">Connect guides</a> ·
  <a href="https://beta.findagent.cloud/security">Security</a> ·
  <a href="https://beta.findagent.cloud/mcp">Browse agents</a>
</p>

<p align="center">
  <a href="https://glama.ai/mcp/servers/team886/findagent-mcp"><img src="https://glama.ai/mcp/servers/team886/findagent-mcp/badges/card.svg" alt="FindAgent MCP server on Glama" />
</p>

<p align="center">
  <a href="https://github.com/team886/findagent-mcp/actions/workflows/ci.yml"><img src="https://github.com/team886/findagent-mcp/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License" /></a>
  <a href="https://registry.modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP%20Registry-cloud.findagent%2Fmarketplace-blue" alt="Official MCP Registry" /></a>
</p>

---

# FindAgent — MCP Server

**FindAgent** is a cross-LLM marketplace of vetted AI agents that is **itself an MCP server**. Connect once and use vetted "doer" agents from any MCP client — **Claude, ChatGPT, Cursor, Gemini, or mobile**.

- **Hosted MCP endpoint (remote, streamable-HTTP):** `https://mcp.findagent.cloud/mcp`
- **Official MCP Registry:** `cloud.findagent/marketplace`
- **Website:** https://findagent.cloud

## Connect

FindAgent is a **remote MCP server** — nothing to install. Point your MCP client at the gateway:

```
https://mcp.findagent.cloud/mcp
```

Per-client step-by-step guides: **https://beta.findagent.cloud/docs/connect** (Claude · ChatGPT · Cursor · Gemini · VS Code · mobile).

Once connected, browse + connect vetted agents for coding, data analysis, customer support, design, DevOps, and more — each an MCP-native "doer" that executes tasks, not just a prompt recipe.

## Run locally (public catalog)

Prefer a local MCP server? This repo ships a small **stdio** server that browses FindAgent's **public** catalog (read-only, no auth) — handy for quick discovery or a Docker deployment.

**Docker:**

```
docker build -t findagent-mcp .
docker run --rm -i findagent-mcp
```

**Node (18+):**

```
npm install && node server.js
```

Tools: `search_agents` (search the public catalog) · `get_overview` (FindAgent overview). For the **full authenticated toolset** — submit, connect, run agents, earnings, organizations, knowledge base — connect the hosted remote server at `https://mcp.findagent.cloud/mcp` (OAuth).

## Why FindAgent — security first

- **Declarative agents ship no executable code** — no arbitrary RCE.
- **Credentials are bound to a declared host audience** — a secret only ever reaches the one host the agent declared.
- **Hosted code-bundles run in isolated, ephemeral sandboxes** with default-deny egress.
- **Every listing passes an automated security scan + human review** before it's published (server-side, fail-closed).

Full details: **https://beta.findagent.cloud/security** · honest data report: **https://beta.findagent.cloud/research/mcp-security**

## Registry manifest

This server is published to the [Official MCP Registry](https://registry.modelcontextprotocol.io) as `cloud.findagent/marketplace`. See [`server.json`](./server.json) for the manifest.

## Links

- Marketplace: https://beta.findagent.cloud/mcp
- How it works: https://beta.findagent.cloud/how-it-works
- Compare vs other MCP marketplaces: https://beta.findagent.cloud/compare-marketplaces
- Machine-readable inventory: https://beta.findagent.cloud/llms-full.txt

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./.github/logo-dark.svg">
    <img alt="FindAgent" src="./.github/logo.svg" width="360">
  </picture>
</p>

<p align="center"><strong>The MCP server for FindAgent — the vetted, cross-LLM marketplace of "doer" agents.</strong></p>

<p align="center">
  <a href="https://findagent.cloud">findagent.cloud</a> ·
  <a href="https://findagent.cloud/docs/connect">Connect guides</a> ·
  <a href="https://findagent.cloud/security">Security</a> ·
  <a href="https://findagent.cloud/mcp">Browse agents</a>
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

Per-client step-by-step guides: **https://findagent.cloud/docs/connect** (Claude · ChatGPT · Cursor · Gemini · VS Code · mobile).

Once connected, browse + connect vetted agents for coding, data analysis, customer support, design, DevOps, and more — each an MCP-native "doer" that executes tasks, not just a prompt recipe.

## Why FindAgent — security first

- **Declarative agents ship no executable code** — no arbitrary RCE.
- **Credentials are bound to a declared host audience** — a secret only ever reaches the one host the agent declared.
- **Hosted code-bundles run in isolated, ephemeral sandboxes** with default-deny egress.
- **Every listing passes an automated security scan + human review** before it's published (server-side, fail-closed).

Full details: **https://findagent.cloud/security** · honest data report: **https://findagent.cloud/research/mcp-security**

## Registry manifest

This server is published to the [Official MCP Registry](https://registry.modelcontextprotocol.io) as `cloud.findagent/marketplace`. See [`server.json`](./server.json) for the manifest.

## Links

- Marketplace: https://findagent.cloud/mcp
- How it works: https://findagent.cloud/how-it-works
- Compare vs other MCP marketplaces: https://findagent.cloud/compare-marketplaces
- Machine-readable inventory: https://findagent.cloud/llms-full.txt

#!/usr/bin/env node
/**
 * FindAgent public MCP server (local / Docker).
 *
 * A small stdio MCP server that browses FindAgent's PUBLIC, read-only catalog of
 * vetted "doer" agents. No auth, no credentials — it only reads public endpoints.
 *
 * For the FULL authenticated toolset (submit, connect, run agents, earnings, org +
 * knowledge-base tools), connect the hosted remote server over OAuth:
 *   https://mcp.findagent.cloud/mcp
 */
import { Server } from '@modelcontextprotocol/server'
import { serveStdio } from '@modelcontextprotocol/server/stdio'

const BASE = (process.env.FINDAGENT_BASE_URL ?? 'https://findagent.cloud').replace(/\/+$/, '')
const HOSTED_MCP = 'https://mcp.findagent.cloud/mcp'
const FOOTER = `\n\n---\nThis local server browses FindAgent's PUBLIC catalog (read-only). For the full authenticated toolset — submit, connect, run agents, earnings, organizations, knowledge base — connect the hosted MCP server at ${HOSTED_MCP} (OAuth).`

const READ_ONLY = { readOnlyHint: true, openWorldHint: true }

const TOOLS = [
  {
    name: 'search_agents',
    description:
      'Search FindAgent\'s public catalog of vetted agents and MCP servers (coding, data analysis, customer support, design, DevOps, and more). Returns matching entries with slug, title, tagline, and description. Use scope "servers" for MCP-server listings, "all" for both. Read-only, no auth.',
    annotations: READ_ONLY,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search terms, at least 2 characters, e.g. "data analysis", "shopify", or "github".',
        },
        limit: { type: 'number', description: 'Maximum results, 1 to 25 (default 10).' },
        scope: {
          type: 'string',
          enum: ['catalog', 'servers', 'all'],
          description: 'catalog = agents (default), servers = MCP-server listings, all = both.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_agent',
    description:
      'Get one agent or MCP-server listing by its exact slug (for example "repo-health-check"): title, tagline, description, plus its public security facts. Read-only, no auth.',
    annotations: READ_ONLY,
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string', description: 'The exact slug, lowercase letters, digits and hyphens.' } },
      required: ['slug'],
    },
  },
  {
    name: 'get_security_facts',
    description:
      'Get the public security facts of one agent by slug: how it runs, what it can reach, and how it was reviewed. Read-only, no auth.',
    annotations: READ_ONLY,
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string', description: 'The exact agent slug.' } },
      required: ['slug'],
    },
  },
  {
    name: 'search_categories',
    description:
      'Find FindAgent categories by name (for example "support", "devops", "finance"). Returns each category slug, name and axis. Use the name as a search term in search_agents. Read-only, no auth.',
    annotations: READ_ONLY,
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Category name fragment, at least 2 characters.' } },
      required: ['query'],
    },
  },
  {
    name: 'get_overview',
    description:
      'Get a machine-readable overview of FindAgent: what it is, how to connect, and the key public routes. Read-only, no auth.',
    annotations: READ_ONLY,
    inputSchema: { type: 'object', properties: {} },
  },
]

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,78}$/

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'findagent-mcp/1.0' } })

  if (!res.ok) {
    throw new Error(`FindAgent request failed: HTTP ${res.status}`)
  }

  return res.text()
}

function buildServer() {
  const server = new Server({ name: 'findagent', version: '1.1.0' }, { capabilities: { tools: {} } })

  server.setRequestHandler('tools/list', async () => ({ tools: TOOLS }))

  server.setRequestHandler('tools/call', handleToolCall)

  return server
}

function slugArg(args) {
  const slug = String(args.slug ?? '').trim().toLowerCase()

  if (!SLUG_RE.test(slug)) {
    throw new Error('slug must be lowercase letters, digits and hyphens')
  }

  return slug
}

function queryArg(args) {
  const query = String(args.query ?? '').trim().slice(0, 200)

  if (query.length < 2) {
    throw new Error('query must be at least 2 characters')
  }

  return query
}

function text(body) {
  return { content: [{ type: 'text', text: body + FOOTER }] }
}

async function handleToolCall(req) {
  const name = req.params.name
  const args = req.params.arguments ?? {}

  if (name === 'search_agents') {
    const scope = ['catalog', 'servers', 'all'].includes(args.scope) ? args.scope : 'catalog'
    const limit = Math.min(25, Math.max(1, Math.floor(Number(args.limit) || 10)))

    return text(
      await fetchText(`${BASE}/api/search?q=${encodeURIComponent(queryArg(args))}&scope=${scope}&limit=${limit}`)
    )
  }

  if (name === 'get_agent') {
    const slug = slugArg(args)
    const hits = JSON.parse(await fetchText(`${BASE}/api/search?q=${encodeURIComponent(slug)}&scope=all&limit=25`))
    const entry = (Array.isArray(hits) ? hits : []).find((h) => h.slug === slug)

    if (!entry) {
      throw new Error(`No public agent or listing with slug "${slug}"`)
    }

    let security = null

    try {
      security = JSON.parse(await fetchText(`${BASE}/api/v1/agents/${slug}/security-facts`))
    } catch {
      // a listing has no security facts of its own; the entry alone is still the answer
    }

    return text(JSON.stringify({ agent: entry, security }, null, 2))
  }

  if (name === 'get_security_facts') {
    return text(await fetchText(`${BASE}/api/v1/agents/${slugArg(args)}/security-facts`))
  }

  if (name === 'search_categories') {
    const body = JSON.parse(
      await fetchText(`${BASE}/api/search?q=${encodeURIComponent(queryArg(args))}&types=categories&limit=5`)
    )

    return text(JSON.stringify(body.categories ?? [], null, 2))
  }

  if (name === 'get_overview') {
    return text(await fetchText(`${BASE}/llms.txt`))
  }

  throw new Error(`Unknown tool: ${name}`)
}

serveStdio(buildServer, {
  onerror: (err) => process.stderr.write(`findagent-mcp: stdio transport error: ${err?.message ?? err}\n`),
})

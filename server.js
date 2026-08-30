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
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

const BASE = (process.env.FINDAGENT_BASE_URL ?? 'https://beta.findagent.cloud').replace(/\/+$/, '')
const HOSTED_MCP = 'https://mcp.findagent.cloud/mcp'
const FOOTER = `\n\n---\nThis local server browses FindAgent's PUBLIC catalog (read-only). For the full authenticated toolset — submit, connect, run agents, earnings, organizations, knowledge base — connect the hosted MCP server at ${HOSTED_MCP} (OAuth).`

const TOOLS = [
  {
    name: 'search_agents',
    description:
      'Search FindAgent\'s public catalog of vetted MCP "doer" agents (coding, data analysis, customer support, design, DevOps, and more). Returns matching agents with slug, title, tagline, and description. Read-only, no auth.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search terms, e.g. "data analysis", "shopify", or "github".',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_overview',
    description:
      'Get a machine-readable overview of FindAgent — what it is, how to connect, and the key public routes. Read-only, no auth.',
    inputSchema: { type: 'object', properties: {} },
  },
]

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'findagent-mcp/1.0' } })

  if (!res.ok) {
    throw new Error(`FindAgent request failed: HTTP ${res.status}`)
  }

  return res.text()
}

const server = new Server({ name: 'findagent', version: '1.0.0' }, { capabilities: { tools: {} } })

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const name = req.params.name
  const args = req.params.arguments ?? {}

  if (name === 'search_agents') {
    const query = String(args.query ?? '').slice(0, 200)

    if (!query) {
      throw new Error('query is required')
    }

    const body = await fetchText(`${BASE}/api/search?q=${encodeURIComponent(query)}`)

    return { content: [{ type: 'text', text: body + FOOTER }] }
  }

  if (name === 'get_overview') {
    const body = await fetchText(`${BASE}/llms.txt`)

    return { content: [{ type: 'text', text: body + FOOTER }] }
  }

  throw new Error(`Unknown tool: ${name}`)
})

const transport = new StdioServerTransport()
await server.connect(transport)

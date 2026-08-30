#!/usr/bin/env node
/**
 * Smoke test: spawn the stdio MCP server, run the MCP handshake, and assert
 * `tools/list` returns the expected tools. No network — `initialize` +
 * `tools/list` are served locally, so this is deterministic in CI.
 */
import { spawn } from 'node:child_process'

const EXPECTED_TOOLS = ['search_agents', 'get_overview']

const child = spawn('node', ['server.js'], { stdio: ['pipe', 'pipe', 'inherit'] })
let buf = ''
let done = false

function finish(code, msg) {
  if (done) {
    return
  }

  done = true
  console[code ? 'error' : 'log'](msg)
  child.kill()
  process.exit(code)
}

child.on('error', (err) => finish(1, `spawn error: ${err.message}`))

child.stdout.on('data', (chunk) => {
  buf += chunk.toString()
  const lines = buf.split('\n')
  buf = lines.pop() ?? ''

  for (const line of lines) {
    if (!line.trim()) {
      continue
    }

    let msg
    try {
      msg = JSON.parse(line)
    } catch {
      continue
    }

    if (msg.id === 2) {
      const names = (msg.result?.tools ?? []).map((t) => t.name).sort()
      const ok = JSON.stringify(names) === JSON.stringify([...EXPECTED_TOOLS].sort())
      finish(ok ? 0 : 1, ok ? `OK: tools = ${names.join(', ')}` : `unexpected tools: ${names.join(', ')}`)
    }
  }
})

const requests = [
  {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'ci-smoke', version: '1.0' },
    },
  },
  { jsonrpc: '2.0', method: 'notifications/initialized' },
  { jsonrpc: '2.0', id: 2, method: 'tools/list' },
]

for (const req of requests) {
  child.stdin.write(`${JSON.stringify(req)}\n`)
}

setTimeout(() => finish(1, 'timeout: no tools/list response'), 8000)

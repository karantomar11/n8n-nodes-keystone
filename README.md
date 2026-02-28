<p align="center">
  <img src="nodes/KeystoneRedact/keystone.svg" alt="Keystone Logo" width="80" />
</p>

<h1 align="center">n8n-nodes-keystone</h1>

<p align="center">
  <strong>Zero-Knowledge PII Redaction & Restoration for n8n</strong>
</p>

<p align="center">
  <a href="#installation"><img alt="n8n community node" src="https://img.shields.io/badge/n8n-community%20node-ff6d5a?style=flat-square&logo=n8n&logoColor=white" /></a>
  <a href="https://github.com/keystone-os/n8n-nodes-keystone/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" /></a>
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-brightgreen?style=flat-square" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript&logoColor=white" />
</p>

---

An [n8n](https://n8n.io) community node package that integrates **Keystone** — a privacy-first middleware that redacts personally identifiable information (PII) before it reaches any LLM, and restores it afterwards. Your sensitive data never leaves your infrastructure.

## ✨ Why Keystone?

| Problem | Keystone Solution |
|---|---|
| LLMs see raw PII (names, emails, addresses) | PII is replaced with safe placeholders before the LLM ever receives the text |
| Data privacy compliance complexity | Zero-knowledge architecture — sensitive data stays on _your_ server |
| Manual redaction is error-prone | AI-powered entity detection with vault-backed token storage |
| Restoration is a separate engineering task | One-step restoration using encrypted vault tokens |

## 📦 Nodes Included

| Node | Description |
|---|---|
| **Keystone Redact** | Scans text for PII entities (names, emails, phone numbers, etc.) and replaces them with deterministic placeholders like `[PERSON_A]`. Returns an encrypted vault token for later restoration. |
| **Keystone Restore** | Takes redacted text and a vault token, then re-inserts the original PII values — even after the text has been transformed by an LLM. |

## 🚀 Installation

### Via n8n Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings → Community Nodes**
3. Enter `n8n-nodes-keystone` and click **Install**
4. Restart n8n

### Manual Installation

```bash
# Navigate to your n8n custom nodes directory
cd ~/.n8n/nodes

# Install the package
npm install n8n-nodes-keystone
```

## ⚙️ Prerequisites

A running **Keystone server** is required. The quickest way to get started:

```bash
cd keystone_core
./start.sh
```

This launches both the Keystone API on port `8000` and n8n on port `5678`.

## 🔧 Configuration

### 1. Add Credentials

1. In n8n, go to **Credentials → Add Credential → Keystone API**
2. Fill in:

| Field | Value | Notes |
|---|---|---|
| **Server URL** | `http://host.docker.internal:8000` | Use this when n8n runs in Docker |
| | `http://localhost:8000` | Use this when running locally |
| **API Key** | `ks_live_xxxxxxxxxxxx` | Obtain from the Keystone dashboard |

### 2. Build Your Workflow

The typical pattern wraps your LLM call between a **Redact** and **Restore** step:

```
[Data Source] → Keystone Redact → [LLM / AI Agent] → Keystone Restore → [Output]
```

### Example: Privacy-Safe Email Generator

```
Google Sheets ──→ Keystone Redact ──→ AI Agent ──→ Keystone Restore ──→ Update Sheet
                       │                                │
                  "Dear [PERSON_A],             "Dear John Smith,
                   your order #[ID_1]..."        your order #48291..."
```

The LLM only ever sees anonymised placeholders — never the real data.

## 📖 Node Reference

### Keystone Redact

Detects and replaces PII in the input text.

**Inputs**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `text` | `string` | ✅ | The text to scan and redact |
| `taskId` | `string` | — | Optional identifier for audit / traceability |

**Outputs**

| Field | Description |
|---|---|
| `redacted_text` | Text with PII replaced by `[PERSON_A]`-style placeholders |
| `vault_token` | Encrypted token mapping placeholders → original values |
| `entities_redacted` | Number of PII entities that were redacted |
| `entities_warned` | Number of entities flagged but not redacted |
| `status` | Response status from the Keystone API |

---

### Keystone Restore

Re-inserts original PII values using a vault token.

**Inputs**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `redactedText` | `string` | ✅ | Text containing `[PLACEHOLDER]` tokens |
| `vaultToken` | `string` | ✅ | Encrypted vault token from the Redact step |

**Outputs**

| Field | Description |
|---|---|
| `restored_text` | Fully restored text with original PII values |
| `entities_restored` | Number of entities that were restored |
| `status` | Response status from the Keystone API |

## 🏗️ Development

```bash
# Clone the repo
git clone https://github.com/keystone-os/n8n-nodes-keystone.git
cd n8n-nodes-keystone

# Install dependencies
npm install

# Build
npm run build

# Watch mode (auto-rebuild on save)
npm run dev
```

### Project Structure

```
n8n-nodes-keystone/
├── credentials/
│   └── KeystoneApi.credentials.ts    # API key + server URL credential
├── nodes/
│   ├── KeystoneRedact/
│   │   ├── KeystoneRedact.node.ts    # Redaction node
│   │   └── keystone.svg              # Node icon
│   └── KeystoneRestore/
│       ├── KeystoneRestore.node.ts   # Restore node
│       └── keystone.svg              # Node icon
├── gulpfile.js                       # Copies SVG icons into dist/
├── tsconfig.json
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Distributed under the **MIT** License. See [`LICENSE`](LICENSE) for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/keystone-os">Keystone OS</a>
</p>
# n8n-nodes-keystone-

# Civic Analysis API — Contract for UI Team

Base URL: `http://localhost:3000` (dev) · `https://<your-domain>` (prod)

---

## Authentication

All 🔒 endpoints require a JWT Bearer token in the `Authorization` header.

```
Authorization: Bearer <token>
```

Obtain a token via `POST /api/auth/login` or `POST /api/auth/signup`.

---

## Response Envelope

### Success
```json
{ "success": true, "data": { ... } }
```

### Error
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": 400,
    "message": "Query must be at least 10 characters long"
  }
}
```

---

## Endpoints

---

### Auth

#### `POST /api/auth/signup`

Register a new user.

**Request**
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "securepass123",
  "role": "user"
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "user": { "id": "cuid...", "name": "Priya Sharma", "email": "priya@example.com", "role": "user" },
    "token": "<jwt>"
  }
}
```

| Error Code | Meaning |
|---|---|
| `400` | Validation error |
| `409` | Email already registered |

---

#### `POST /api/auth/login`

Authenticate an existing user.

**Request**
```json
{ "email": "priya@example.com", "password": "securepass123" }
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "user": { "id": "cuid...", "name": "Priya Sharma", "email": "priya@example.com", "role": "user" },
    "token": "<jwt>"
  }
}
```

| Error Code | Meaning |
|---|---|
| `400` | Validation error |
| `401` | Invalid credentials |

---

### Analysis

#### `POST /api/analyze` 🔒

Analyze a civic issue. Creates a new conversation or continues an existing one.

**Request**
```json
{
  "query": "My RTI application filed 45 days ago has received no response.",
  "conversationId": "cuid_optional_for_followup"
}
```

**`AnalysisResult` shape**
```ts
{
  category: "RTI" | "TENANCY" | "WELFARE" | "GENERAL";
  summary: string;
  issues: string[];
  recommendedActions: string[];
  relevantAuthorities: { name: string; role: string; contactHint?: string }[];
  grayArea: { detected: boolean; description?: string };
  estimatedResolutionTime?: string;
}
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "conversationId": "cuid...",
    "userMessageId": "cuid...",
    "aiMessageId": "cuid...",
    "analysis": {
      "category": "RTI",
      "summary": "RTI application has exceeded the 30-day statutory response period.",
      "issues": [
        "No response received within the mandated 30-day period"
      ],
      "recommendedActions": [
        "File a first appeal to the First Appellate Authority (FAA)",
        "Send a reminder to the PIO via registered post",
        "File a complaint with the Central Information Commission if FAA is unresponsive"
      ],
      "relevantAuthorities": [
        { "name": "Public Information Officer (PIO)", "role": "Primary RTI response", "contactHint": "Department official website" },
        { "name": "Central Information Commission (CIC)", "role": "Second appeal / complaint", "contactHint": "https://cic.gov.in" }
      ],
      "grayArea": { "detected": false },
      "estimatedResolutionTime": "30-90 days"
    }
  }
}
```

| Error Code | Meaning |
|---|---|
| `400` | Validation — query too short/long |
| `401` | Missing or expired token |
| `403` | `conversationId` belongs to another user |
| `404` | `conversationId` not found |
| `502` | LLM returned an unparseable response |

---

### Conversations

#### `GET /api/conversations` 🔒

List the authenticated user's conversations (newest first).

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid...",
      "title": "My RTI application filed 45 days ago…",
      "createdAt": "2026-08-19T11:00:00.000Z",
      "updatedAt": "2026-08-19T11:05:00.000Z",
      "_count": { "messages": 4, "documents": 1 }
    }
  ]
}
```

---

#### `GET /api/conversations/:conversationId` 🔒

Get a single conversation with all messages in chronological order.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "id": "cuid...",
    "title": "My RTI application…",
    "createdAt": "...",
    "updatedAt": "...",
    "messages": [
      { "id": "cuid...", "type": "user", "content": "My RTI application...", "createdAt": "..." },
      { "id": "cuid...", "type": "ai",   "content": "{\"category\":\"RTI\",...}", "createdAt": "..." }
    ],
    "documents": []
  }
}
```

> **Note:** The AI message `content` is a JSON string. Parse it to get the `AnalysisResult` object.

| Error Code | Meaning |
|---|---|
| `401` | Unauthenticated |
| `403` | Belongs to another user |
| `404` | Not found |

---

#### `PATCH /api/conversations/:conversationId` 🔒

Rename a conversation.

**Request**
```json
{ "title": "RTI delay — district collector" }
```

**Response `200`** — returns the updated conversation object.

| Error Code | Meaning |
|---|---|
| `400` | Title empty or > 120 chars |
| `403` | Belongs to another user |
| `404` | Not found |

---

#### `DELETE /api/conversations/:conversationId` 🔒

Delete a conversation and all its messages and documents (cascades in DB).

**Response `200`**
```json
{ "success": true, "data": null }
```

| Error Code | Meaning |
|---|---|
| `403` | Belongs to another user |
| `404` | Not found |

---

### Documents

#### `POST /api/documents` 🔒

Upload a document and attach it to a conversation.

**Request** — `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| `file` | File | ✅ |
| `conversationId` | string (CUID) | ✅ |

**Response `201`**
```json
{
  "success": true,
  "data": {
    "id": "cuid...",
    "documentName": "notice.pdf",
    "fileUrl": "metadata://cuid.../notice.pdf",
    "conversationId": "cuid...",
    "createdAt": "..."
  }
}
```

> **Note:** `fileUrl` is a metadata stub in Day 1. Real file storage (S3/local) is Day 2.

| Error Code | Meaning |
|---|---|
| `400` | Missing file or conversationId |
| `403` | Conversation belongs to another user |
| `404` | Conversation not found |

---

#### `POST /api/documents/:documentId/analyze` 🔒

Queue a document for RAG-based analysis. Returns a stub in Day 1.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "documentId": "cuid...",
    "status": "pending",
    "message": "Document analysis is scheduled for the next RAG phase."
  }
}
```

| Error Code | Meaning |
|---|---|
| `403` | Document belongs to another user |
| `404` | Document not found |

---

## Classification Scenarios

| # | Example Query | `category` | `grayArea.detected` |
|---|---|---|---|
| 1 | "My RTI application has had no response in 45 days." | `RTI` | `false` |
| 2 | "Landlord refused to return security deposit after I vacated." | `TENANCY` | `false` |
| 3 | "My ration card application was rejected without any reason." | `WELFARE` | `false` |
| 4 | "LPG subsidy has not been credited to my account for 3 months." | `WELFARE` | `false` |
| 5 | "The municipality has not cleaned our street for 2 months." | `GENERAL` | `false` |
| 6 | "Landlord is asking me to leave but I'm not sure if it's legal." | `TENANCY` | `true` |
| 7 | Follow-up with existing `conversationId` | *(context-aware)* | *(model decides)* |

---

## Error Code Reference

| HTTP | Meaning |
|---|---|
| `400` | Validation error — check `error.message` |
| `401` | Missing / invalid / expired JWT |
| `403` | Resource belongs to another user |
| `404` | Resource not found |
| `409` | Email already registered |
| `502` | LLM returned invalid response |
| `500` | Unexpected server error |

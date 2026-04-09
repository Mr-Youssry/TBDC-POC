# `/api/analyst/ws-token` — manual smoke test

This endpoint mints a short-lived JWT the browser hands to the OpenClaw
WebSocket gateway. No Jest/Vitest suite for Next.js route handlers in v1 —
use the commands below against a running dev server.

## Prereqs

```bash
export OPENCLAW_SESSION_JWT_SECRET="$(openssl rand -hex 32)"
npm run dev  # listens on :3000 (or :3001 if taken)
```

You will also need a logged-in session cookie. The easiest way:

1. Open http://localhost:3000/login in a browser, sign in as an admin.
2. In devtools → Application → Cookies, copy the `authjs.session-token`
   value into the variable below.

```bash
COOKIE='authjs.session-token=PASTE_HERE'
BASE='http://localhost:3000'
```

## 1. Unauthenticated → redirect to /login (302)

```bash
curl -i "$BASE/api/analyst/ws-token?session=tbdc-general"
# expect: HTTP/1.1 307/308 Temporary Redirect, Location: /login
```

## 2. Non-admin → 403 Forbidden

Create a non-admin user (role = 'viewer' or similar), log in as them, then:

```bash
curl -i -H "Cookie: $COOKIE" "$BASE/api/analyst/ws-token?session=tbdc-general"
# expect: HTTP/1.1 403 Forbidden
```

## 3. Admin, missing `session` param → 400

```bash
curl -i -H "Cookie: $COOKIE" "$BASE/api/analyst/ws-token"
# expect: HTTP/1.1 400 Bad Request, body: "Missing session param"
```

## 4. Admin, valid session → 200 with `{ token, url }`

```bash
curl -s -H "Cookie: $COOKIE" \
  "$BASE/api/analyst/ws-token?session=tbdc-general" | jq
# expect:
# {
#   "token": "eyJhbGciOiJIUzI1NiJ9...",
#   "url": "/analyst/ws/socket?session=tbdc-general&token=..."
# }
```

Decode the token (base64-decode the middle segment) and verify the claims:

```json
{
  "userId": "<cuid>",
  "openclawSessionId": "tbdc-general",
  "iat": 1712620800,
  "exp": 1712621100
}
```

Expiration should be exactly 5 minutes after `iat`.

## 5. Secret missing → 500

```bash
unset OPENCLAW_SESSION_JWT_SECRET
# restart dev server, then:
curl -i -H "Cookie: $COOKIE" "$BASE/api/analyst/ws-token?session=tbdc-general"
# expect: HTTP/1.1 500 Internal Server Error
# server log: "OPENCLAW_SESSION_JWT_SECRET env var is required"
```

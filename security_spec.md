# Firestore Security Specification & Invariants

## 1. System Overview & Data Isolation Architecture

Lexi is an emotionally responsive AI companion and daily habit accountability partner. All persisted data is strictly siloed per authenticated user under `/users/{userId}/**`.

- **Platform Project ID**: `poetic-receiver-qcbh2`
- **Firestore Custom Database ID**: `ai-studio-lexiyouraisoulsy-54d4fa3f-a574-4a88-90c9-6a3ece2e3092`
- **Authentication**: Firebase Authentication (Google OAuth + Guest mode). All Firestore operations require `request.auth != null`.
- **Authorization Boundary**: The user identifier `request.auth.uid` must strictly match the `{userId}` wildcards on every path:
  ```
  isOwner(userId) = request.auth != null && request.auth.uid == userId
  ```

---

## 2. Invariants & Collection Specifications

| Collection Path | Allowed Ops | Schema Validator | Key Security Constraints |
| :--- | :--- | :--- | :--- |
| `/users/{userId}` | `get, create, update, delete` (no `list`) | `isValidUserProfile` | `userId == request.auth.uid`, `name.size() <= 64`, `partnerName.size() <= 64`, enumerated tones & genders |
| `/users/{userId}/habits/{habitId}` | `get, list, create, update, delete` | `isValidHabit` | `isValidId(habitId)`, `title.size() <= 100`, `targetValue >= 0`, `completed is bool`, `streak is number` |
| `/users/{userId}/messages/{messageId}` | `get, list, create, update, delete` | `isValidChatMessage` | `isValidId(messageId)`, `sender in ['user', 'partner', 'system']`, `text.size() <= 4000` |
| `/users/{userId}/mood/current` | `get, create, update, delete` | `isValidPartnerMood` | `score >= 0 && score <= 100`, `status in ['ecstatic', 'loving', 'happy', 'neutral', 'annoyed', 'angry']` |
| `/users/{userId}/memories/{memoryId}` | `get, list, create, update, delete` | `isValidMemory` | `isValidId(memoryId)`, `category in ['health', 'exam', 'preference', 'relationship', 'goal']`, `fact.size() <= 1000` |
| `/users/{userId}/calls/{callId}` | `get, list, create, update, delete` | `isValidCallRecord` | `isValidId(callId)`, `type in ['incoming', 'outgoing', 'missed']`, `durationSec >= 0` |
| `/users/{userId}/events/{eventId}` | `get, list, create, update, delete` | `isValidCalendarEvent` | `isValidId(eventId)`, `title.size() <= 120`, valid ISO-like string start/end times |

### Path Hardening Invariant
All user document and subdocument IDs must conform to:
```
isValidId(id) = id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')
```
This strictly prohibits directory traversal characters (`../`), encoded delimiters (`%2F`), null bytes, and non-printable characters.

### Collection Enumeration Defense
Collection-level queries on root `/users` are unconditionally forbidden (`allow list: if false`), preventing scraping of user databases.

---

## 3. The "Dirty Dozen" Attack Payloads (All Verified PERMISSION_DENIED)

| # | Attack Vector | Target Operation & Payload | Expected Result | Defending Rule Logic |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Unauthenticated Profile Read** | `GET /users/victim_123` with `request.auth == null` | `PERMISSION_DENIED` | `isOwner(userId)` checks `isSignedIn()` |
| **2** | **Cross-User Profile Hijack** | `SET /users/victim_123` authenticated as `attacker_456` | `PERMISSION_DENIED` | `isOwner(userId)` checks `request.auth.uid == userId` |
| **3** | **ID Traversal / Injection** | `GET /users/attacker/habits/..%2F..%2Fetc` | `PERMISSION_DENIED` | `isValidId(habitId)` rejects invalid characters |
| **4** | **Root Collection Scraping** | `LIST /users` | `PERMISSION_DENIED` | `allow list: if false` on `/users` |
| **5** | **Cross-User Habit Spying** | `LIST /users/victim_123/habits` as `attacker_456` | `PERMISSION_DENIED` | Subcollection `isOwner(userId)` requirement |
| **6** | **Negative / Invalid Target Poisoning** | `CREATE /users/me/habits/h1` with `targetValue: -20` | `PERMISSION_DENIED` | `isValidHabit` enforces `data.targetValue >= 0` |
| **7** | **Message Buffer Overflow** | `CREATE /users/me/messages/m1` with `text: "A".repeat(10000)` | `PERMISSION_DENIED` | `isValidChatMessage` enforces `data.text.size() <= 4000` |
| **8** | **Sender Identity Spoofing** | `CREATE /users/me/messages/m1` with `sender: "root_admin"` | `PERMISSION_DENIED` | `isValidChatMessage` enforces `data.sender in ['user', 'partner', 'system']` |
| **9** | **Partner Mood Range Tampering** | `SET /users/me/mood/current` with `score: 9999` | `PERMISSION_DENIED` | `isValidPartnerMood` enforces `data.score >= 0 && data.score <= 100` |
| **10** | **Memory Category Injection** | `CREATE /users/me/memories/m1` with `category: "backdoor"` | `PERMISSION_DENIED` | `isValidMemory` enforces enumerated categories |
| **11** | **Call Duration Tampering** | `CREATE /users/me/calls/c1` with `durationSec: -500` | `PERMISSION_DENIED` | `isValidCallRecord` enforces `data.durationSec >= 0` |
| **12** | **Arbitrary Collection Creation** | `SET /secrets/config` or `SET /users/me/unregistered/doc1` | `PERMISSION_DENIED` | Global fallback: `match /{document=**} { allow read, write: if false; }` |

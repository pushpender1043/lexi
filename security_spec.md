# Firestore Security Specification & Invariants

## 1. Data Invariants
1. **User Identity Boundary**: Every document under `/users/{userId}/**` must strictly belong to the authenticated user where `request.auth.uid == userId`.
2. **Strict Document Schema**:
   - `UserProfile`: `userId` must match `request.auth.uid`. Name and partnerName must be non-empty strings of valid length.
   - `Habit`: `userId` must match `request.auth.uid`. `targetValue` must be greater than zero.
   - `ChatMessage`: `userId` must match `request.auth.uid`. `text` must not exceed 4000 characters. `sender` must be either 'user' or 'ai'.
   - `PartnerMood`: `userId` must match `request.auth.uid`. `score` must be between 0 and 100.
   - `Memory`: `userId` must match `request.auth.uid`. `fact` must not exceed 1000 characters.
3. **No Unauthenticated Reads or Writes**: All operations require `request.auth != null`.
4. **No Cross-User Access**: Users cannot read, write, update, or list data belonging to other users.
5. **Path Hardening**: Document IDs must pass `isValidId()` (alphanumeric with hyphens/underscores, maximum 128 characters).

## 2. The "Dirty Dozen" Attack Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated User Profile Read**: Anonymous/unauthenticated `GET /users/user123` -> DENIED.
2. **Cross-User Profile Write**: User `attacker` attempts `SET /users/victim123` -> DENIED.
3. **Ghost Field Poisoning**: Writing a profile with injected `{ isAdmin: true }` -> DENIED.
4. **ID Poisoning Attack**: Document ID with directory traversal or 1000 bytes junk `GET /users/..%2F..%2Fetc` -> DENIED.
5. **Cross-User Habit Hijacking**: User `attacker` attempts `WRITE /users/victim123/habits/habit1` -> DENIED.
6. **Habit Target Value Poisoning**: Writing a habit with `targetValue: -50` or non-numeric -> DENIED.
7. **Cross-User Message Snooping**: User `attacker` attempts `LIST /users/victim123/messages` -> DENIED.
8. **Message Payload Overflow**: Chat message `text` with 10MB string -> DENIED (exceeds 4000 limit).
9. **Partner Mood Score Tampering**: Writing partner mood with `score: 99999` -> DENIED (must be <= 100).
10. **Spoofed Sender State**: Setting an invalid sender like `sender: "admin_override"` -> DENIED.
11. **Memory Hijack Write**: Writing memory with negative confidence score or invalid category -> DENIED.
12. **Root Document Listing**: Any client attempting `LIST /users` -> DENIED.

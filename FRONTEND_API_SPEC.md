# My Manga App — Backend API Spec (for building a React frontend)

This document is a self-contained contract for the `mymangaapp` REST backend. Give it
to a code-generation model and it has everything needed to build a React SPA:
endpoints, request/response shapes, auth, errors, enums, upload flow, rate limits, and
suggested UI structure. All facts here reflect the current backend source.

---

## 1. Product overview

A manga-reading and translation-group platform.

- **Readers / guests** browse manga, read chapters and pages, filter by category, and
  view translation groups. No login required.
- **Registered users** (`USER`) can update their profile/avatar, request to join a
  translation group, request to create a new translation group, and track their
  requests.
- **Translators** (`TRANSLATOR`) are users who belong to a translation group; they can
  create/edit manga and chapters, but only when their group is an active
  (`APPROVED`) member of that manga. Translators also upload images.
- **Group leaders** are the owners of a translation group. They manage the group
  profile, approve/reject join requests, kick members, remove their group from a manga,
  and create manga/chapters for the manga their group translates. A leader is
  implicitly a translator.
- **Admins** (`ADMIN`) manage users, roles, permissions, categories, and review
  group-creation requests. Admins can also moderate groups and manga.

### Roles and permissions

- Role names: `ADMIN`, `USER`, `TRANSLATOR` (a user may have several).
- Seed permissions: `CREATE_POST`, `CREATE_MANGA`, `UPDATE_MANGA`.
- Role/permission CRUD is admin-only. The frontend rarely needs it beyond an admin
  dashboard; normal authorization is role-based.

---

## 2. Base URL and environment

- Local base URL: `http://localhost:8080/mymangaapp`
- The path `/mymangaapp` is the servlet context path; put all API calls under it.
- CORS allows the frontend origins `http://localhost:5173` and
  `http://127.0.0.1:5173` with credentials. Run the dev server on port `5173`
  (Vite default) to avoid CORS errors.
- All request/response bodies are JSON unless explicitly marked as
  `multipart/form-data`.
- Content type for JSON: `application/json`.

Suggested environment variable:

```env
VITE_API_BASE_URL=http://localhost:8080/mymangaapp
```

---

## 3. Authentication

The API is stateless. Authentication uses one HS512 JWT access token.

### Login

`POST /auth/login` with `{ "username", "password" }` returns:

```json
{ "code": "0000", "result": { "authenticated": true, "token": "<jwt>" } }
```

There is no separate refresh token: the same access token is used to refresh while it
is still within the refreshable window.

### Using the token

Send it on every protected request:

```http
Authorization: Bearer <jwt>
```

### Token contents (client-side decoding)

The JWT payload is standard base64url and contains:

- `sub` — username
- `jti` — token id (invalidated on logout/refresh)
- `scope` — space-separated role names, e.g. `"ADMIN"` or `"USER TRANSLATOR"`
- `iss` — `trg2k5.com`
- `iat`, `exp`

Recommendation: store the token in `localStorage` (or memory + localStorage),
attach it in a single axios/fetch interceptor, and decode `scope` + `exp` client-side
to drive role-based UI and to know when to refresh.

### Refresh and logout

- `POST /auth/refresh` with `{ "token": "<current token>" }` → invalidates the old
  token and returns a new `{ authenticated, token }`.
- `POST /auth/logout` with `{ "token": "<current token>" }` → invalidates the token.
- `POST /auth/introspect` with `{ "token" }` → `{ "valid": true | false }`.

Recommended token lifecycle on the client:

1. On login, store `token`.
2. Before `exp` (or on a `401`/`1001`), call `/auth/refresh` with the current token and
   replace it.
3. If refresh also fails (`UNAUTHENTICATED`), clear the token and redirect to login.

### Auth response DTO

```jsonc
// AuthenticationResponse
{ "authenticated": true, "token": "..." }

// IntrospectResponse
{ "valid": true }
```

---

## 4. Response envelope and errors

Every response (success and error) is wrapped:

```json
{
  "code": "0000",
  "message": "Thành công!",
  "result": {}
}
```

- `code`: four-digit string. `"0000"` means success.
- `message`: present mainly on success-with-message (deletes) and on errors.
- `result`: the payload; omitted for `void` operations and when null.
- Null fields are omitted entirely (`@JsonInclude(NON_NULL)`).

Errors reuse the same envelope with the code's HTTP status. Example — wrong password:

```json
HTTP 401
{ "code": "1002", "message": "Mật khẩu không chính xác!" }
```

Unhandled/auth-entry errors return `401` with `1001` "Chưa được xác thực!".

### Error code reference

Use `code` (not the HTTP status) for messages and special handling. Common codes:

| Code | Meaning | HTTP |
| --- | --- | --- |
| `0000` | Success | 200 |
| `1001` | Unauthenticated (missing/expired/invalid token) | 401 |
| `1002` | Wrong password | 401 |
| `2001` | No permission / not allowed | 403 |
| `2002` | Cannot modify another admin | 403 |
| `3001` | Invalid field value | 400 |
| `3101` | Username length invalid | 400 |
| `3102` | Password length invalid | 400 |
| `3103` | Email format invalid | 400 |
| `3104` | Bio too long | 400 |
| `3105` | Username required | 400 |
| `3106` | Password required | 400 |
| `3107` | Token required | 400 |
| `3201`–`3209` | Role/permission validation | 400 |
| `3301`–`3303` | TransGroup validation | 400 |
| `3304` | Cover image URL too long for a translation group (maximum 500 characters) | 400 |
| `3401`–`3405` | Manga validation | 400 |
| `3406` | Cover image URL too long for a manga (maximum 500 characters) | 400 |
| `3501`–`3505` | Chapter/page validation | 400 |
| `3601`–`3603` | Category validation | 400 |
| `3701`–`3702` | File validation (required / too large) | 400 |
| `4101` | User not found | 404 |
| `4201` | Role not found | 404 |
| `4202` | Permission not found | 404 |
| `4301` | TransGroup not found | 404 |
| `4302` | Join request not found | 404 |
| `4303` | Creation request not found | 404 |
| `4401` | Manga not found | 404 |
| `4501` | Chapter not found | 404 |
| `4601` | Category not found | 404 |
| `5001` | Data integrity violation | 400 |
| `5101` | Username already exists | 400 |
| `5102` | Email already exists | 400 |
| `5201` | Role name already exists | 400 |
| `5202` | Permission name already exists | 400 |
| `5301` | TransGroup name already exists | 400 |
| `5302` | TransGroup status invalid | 400 |
| `5303` | User already in a group | 400 |
| `5304` | TransGroup not approved | 400 |
| `5305` | Join request already handled | 400 |
| `5306` | Join request already exists | 400 |
| `5307` | Creation request already exists | 400 |
| `5308` | Creation request already handled | 400 |
| `5309` | TransGroup already deleted | 400 |
| `5401` | Manga must have at least one group | 400 |
| `5501` | Chapter index already exists | 400 |
| `5601` | Category name already exists | 400 |
| `5701` | Invalid file | 400 |
| `5702` | File upload failed | 400 |
| `5703` | File copy failed | 400 |
| `5704` | File delete failed | 400 |
| `6001` | Rate limit exceeded | 429 |
| `6002` | Method not allowed | 405 |
| `9001` | Uncategorized error | 500 |
| `9005` | Unreadable HTTP message (bad JSON body) | 500 |
| `9701` | Storage service unavailable | 503 |
| `9702` | Storage service error | 500 |

### Pagination envelope

```json
{
  "currentPage": 1,
  "pageSize": 24,
  "totalPages": 4,
  "totalElements": 75,
  "content": []
}
```

Request parameters: `page` (0-based), `size`, `sortBy` (field name; direction is
always descending). The response `currentPage` is 1-based.

---

## 5. Enums and constants

Always send/compare these exact uppercase strings as JSON values. Jackson accepts them
case-insensitively on input, but the API returns the uppercase names.

```ts
// MangaStatus
type MangaStatus = 'COMPLETED' | 'ONGOING' | 'ONHOLD';
// COMPLETED = Hoàn thành, ONGOING = Còn tiếp, ONHOLD = Tạm dừng

// TransGroupStatus
type TransGroupStatus = 'APPROVED' | 'DELETED';

// MyGroupStatus — quan hệ của user hiện tại với nhóm dịch
type MyGroupStatus = 'LEADER' | 'MEMBER' | 'PENDING_REQUEST' | 'NONE';

// GroupJoinRequestStatus
type GroupJoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// GroupCreationRequestStatus  (note: REJECTD is spelled with no second "E")
type GroupCreationRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTD';

// Role names
type RoleName = 'ADMIN' | 'USER' | 'TRANSLATOR';
```

Suggested Vietnamese labels for `MangaStatus`:
`COMPLETED → "Hoàn thành"`, `ONGOING → "Còn tiếp"`, `ONHOLD → "Tạm dừng"`.

---

## 6. DTO catalog (TypeScript)

These types mirror the backend DTOs exactly (field names and nullability). Use them as
the basis for your API types.

```ts
// ---- Common ----
interface ApiResponse<T> { code: string; message?: string; result?: T; }

interface PaginatedResponse<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  content: T[];
}

interface PageQuery {
  page?: number;   // 0-based, default varies by endpoint
  size?: number;
  sortBy?: string; // direction is always DESC
}

// ---- Auth ----
interface RegisterRequest { username: string; password: string; email?: string; }
interface LoginRequest { username: string; password: string; }
interface AuthResponse { authenticated: boolean; token: string; }
interface TokenRequest { token: string; }
interface IntrospectResponse { valid: boolean; }

// ---- Users ----
interface CurrentUserResponse {
  id: string;
  username: string;
  email: string | null;
  facebook: string | null;
  discord: string | null;
  bio: string | null;
  avatar: string | null;
  createdAt: string; // ISO-8601 instant
}

interface UserSummaryResponse { id: string; username: string; avatar: string | null; }

interface UserResponse {
  id: string;
  username: string;
  email: string | null;
  facebook: string | null;
  discord: string | null;
  bio: string | null;
  roles: RoleResponse[];
  transGroupId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserCreationRequest {
  username: string;      // 3..50
  password: string;      // 5..30
  email?: string;
  roles?: string[];      // role names; empty => defaults to USER
}

interface UserPasswordRequest { oldPassword: string; newPassword: string; }
// PATCH /users/me and /admin/users/{id} are multipart with fields:
//   email?, facebook?, discord?, bio? (<=300), avatar? (file)
interface UserUpdateForm {
  email?: string;
  facebook?: string;
  discord?: string;
  bio?: string;
  avatar?: File;
}

interface DeleteUserResponse { userId: string; }

// ---- Category ----
interface CategoryRequest { name: string; /* 2..100 */ description?: string; /* <=200 */ }
interface CategoryResponse { id: number; name: string; description: string | null; }
interface DeleteCategoryResponse { categoryId: number; }

// ---- Manga ----
interface MangaCreationRequest {
  name: string;              // <=200, required
  authorsName?: string;      // <=255
  coverImageUrl?: string;    // <=500, URL returned by file upload
  transGroups?: string[];    // group UUIDs; creator's own active group is added automatically
  categoryIds: number[];     // required, non-empty
  status: MangaStatus;       // required
  description?: string;      // <=500
}

interface MangaUpdateRequest {
  name?: string;
  authorsName?: string;
  coverImageUrl?: string;    // <=500; null/omitted keeps the current value
  addTransGroups?: string[]; // ADDS groups only; use DELETE leave to remove a group
  categoryIds?: number[];
  status?: MangaStatus;
  description?: string;
}

interface MangaResponse {            // public manga list item
  id: string;
  name: string;
  slug: string;
  coverImageUrl?: string;
  status: MangaStatus;
  description: string | null;
  categories: CategoryResponse[];
  transGroupsId: TransGroupSummaryResponse[]; // NOTE: despite the name, full summary objects
  updatedAt: string;
}

interface MangaSummaryResponse {
  id: string;
  name: string;
  slug: string;
  coverImageUrl?: string;
  authorsName: string | null;
  status: MangaStatus;
  description: string | null;
  createdAt: string;
}

interface MangaDetailsResponse {     // GET /mangas/{id}; chapters are NOT included
  id: string;
  name: string;
  slug: string;
  coverImageUrl?: string;
  authorsName: string | null;
  status: MangaStatus;
  categories: CategoryResponse[];
  transGroups: TransGroupSummaryResponse[];
  description: string | null;
  createdAt: string;
}

interface DeleteMangaResponse { groupId: string; mangaId: string; }

interface MangaManagementResponse {
  id: string;
  name: string;
  slug: string;
  coverImageUrl?: string;
  status: MangaStatus;
  description: string | null;
  categories: CategoryResponse[];
  transGroups: TransGroupManagementResponse[];
  updatedAt: string;
}

interface TransGroupManagementResponse {
  id: string;
  name: string;
  slug: string;
  canRemove: boolean;
}

// ---- Chapter / Page ----
interface ChapterRequest {
  chapterIndex: number;   // required, positive integer
  title?: string;         // <=200
  pageUrls: string[];     // required, 1..150, must be URLs returned by the upload endpoint
}

interface ChapterResponse {
  id: string;
  mangaName: string | null;
  chapterIndex: number;
  title: string | null;
  views: number;
  pageUrls: string[];
  updatedAt: string;
}

interface ChapterSummaryResponse {
  id: string;
  chapterIndex: number;
  title: string | null;
  views: number;
  updatedAt: string;      // treated as a timestamp for sorting display
}

interface PageResponse {
  id: string;
  pageNumber: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface DeleteChapterResponse { mangaId: string; chapterId: string; }

// ---- TransGroup ----
interface TransGroupUpdateRequest {
  name?: string;             // 5..50
  coverImageUrl?: string;    // <=500
  description?: string;      // <=300
}

interface TransGroupSummaryResponse {
  id: string;
  name: string;
  slug: string;
  coverImageUrl?: string;
}

interface TransGroupResponse {
  id: string;
  leader: UserSummaryResponse;
  name: string;
  slug: string;
  coverImageUrl?: string;
  status: TransGroupStatus;
  members: UserSummaryResponse[];
  description: string | null;
  createdAt: string;
}

interface TransGroupDetailsResponse {
  id: string;
  leader: UserSummaryResponse;
  name: string;
  slug: string;
  coverImageUrl?: string;
  status: TransGroupStatus;
  translatedMangas: MangaSummaryResponse[];
  members: UserSummaryResponse[];
  description: string | null;
  createdAt: string;
}

interface TransGroupOfUserResponse {
  transGroup?: TransGroupSummaryResponse;
  status: MyGroupStatus;
}

interface DeleteTransGroupResponse { groupId: string; }
interface DeleteMemberResponse { groupId: string; memberId: string; }

// ---- Group creation request ----
interface CreationRequest {
  groupName: string;         // 5..50
  coverImageUrl?: string;    // <=500; URL returned by file upload
  description?: string;      // <=300
}
interface CreationRequestResponse {
  id: string;
  groupName: string;
  coverImageUrl?: string;
  creatorName: string | null;
  status: GroupCreationRequestStatus; // "REJECTD" on rejection
  description: string | null;
  updatedAt: string;
}

// ---- Group join request ----
interface JoinRequestResponse {
  id: string;
  transGroupName: string | null;
  username: string | null;
  status: GroupJoinRequestStatus;
  createdAt: string;
  updatedAt: string;
}

// ---- Role / Permission ----
interface RoleRequest { name: string; /* <=20 */ description?: string; /* <=100 */ permissions: string[]; /* non-empty */ }
interface RoleResponse { name: string; description: string | null; permissions: PermissionResponse[]; }
interface DeleteRoleResponse { roleId: string; }

interface PermissionRequest { name: string; /* <=50 */ description?: string; /* <=100 */ }
interface PermissionResponse { name: string; description: string | null; }
interface DeletePermissionResponse { permissionId: string; }
```

All timestamp fields are ISO-8601 instants (e.g. `2026-10-16T03:00:00Z`).

---

## 7. Endpoint reference

Legend: **Auth** = required token; **Role** = required role; **RL** = rate limit
(capacity / window in seconds, key type).

### 7.1 Authentication (public)

| Method | Path | Body | Result |
| --- | --- | --- | --- |
| POST | `/auth/register` | `RegisterRequest` | `CurrentUserResponse` (no token) |
| POST | `/auth/login` | `LoginRequest` | `AuthResponse` |
| POST | `/auth/introspect` | `TokenRequest` | `IntrospectResponse` |
| POST | `/auth/logout` | `TokenRequest` | none |
| POST | `/auth/refresh` | `TokenRequest` | `AuthResponse` |

Rate limits: login `5/900 IP`; introspect `60/60 IP`; logout `10/60 USER_ID`;
refresh `10/60 USER_ID`; register has no limit.

After register the user is **not** logged in; call `/auth/login` next.

### 7.2 Current user (authenticated)

| Method | Path | Auth | RL | Body | Result |
| --- | --- | --- | --- | --- | --- |
| GET | `/users/me` | yes | `60/60` | — | `CurrentUserResponse` |
| PATCH | `/users/me` | yes | `10/60` | multipart `UserUpdateForm` | `CurrentUserResponse` |
| PATCH | `/users/me/password` | yes | `5/900` | `UserPasswordRequest` | none |

`PATCH /users/me` is `multipart/form-data` (so it can carry the avatar file). Fields
with `null`/omitted values are ignored (partial update). Uploading a new avatar deletes
the old one. Note: `/users/me` does **not** return roles; decode the JWT `scope` claim
for role-based UI.

### 7.3 Categories

| Method | Path | Auth | Role | RL | Body | Result |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/categories` | no | — | `60/60 IP` | — | `CategoryResponse[]` |
| GET | `/categories/{id}` | no | — | `60/60 IP` | — | `CategoryResponse` |
| POST | `/admin/categories` | yes | ADMIN | `10/60` | `CategoryRequest` | `CategoryResponse` |
| PATCH | `/admin/categories/{id}` | yes | ADMIN | `10/60` | `CategoryRequest` | `CategoryResponse` |
| DELETE | `/admin/categories/{id}` | yes | ADMIN | `10/60` | — | `DeleteCategoryResponse` |

`id` is a number. Seeds: Action, Fantasy, Romance, Comedy, Drama.

### 7.4 Manga

| Method | Path | Auth | Role | RL | Body | Result |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/mangas` | no | — | `60/60 IP` | query `page=0&size=24&sortBy=createdAt` | `PaginatedResponse<MangaResponse>` |
| GET | `/mangas/{id}` | no | — | `60/60 IP` | — | `MangaDetailsResponse` |
| GET | `/transgroups/{groupId}/mangas` | no | — | `60/60 IP` | query `page=0&size=15&sortBy=createdAt` | `PaginatedResponse<MangaSummaryResponse>` |
| POST | `/mangas` | yes | leader | `10/60` | `MangaCreationRequest` | `MangaResponse` |
| PATCH | `/mangas/{mangaId}` | yes | leader of manga | `10/60` | `MangaUpdateRequest` | `MangaResponse` |
| DELETE | `/transgroups/{groupId}/mangas/{mangaId}` | yes | group leader or ADMIN | `10/60` | — | `DeleteMangaResponse` |
| DELETE | `/mangas/{mangaId}/transgroups/{groupId}` | yes | group leader | — | — | none |
| GET | `/mangas/{mangaId}/management` | yes | leader of an approved manga group | `60/60 IP` | — | `MangaManagementResponse` |
| GET | `/admin/mangas` | yes | ADMIN | `30/60` | query `status?,page=0,size=24,sortBy=createdAt` | `PaginatedResponse<MangaSummaryResponse>` |

Behavior notes:

- `POST /mangas` is executed by the creator's group: the creator must be the leader of
  an `APPROVED` group, which is added automatically. `transGroups` is optional extra
  group IDs (all must be `APPROVED`).
- Manga detail (`GET /mangas/{id}`) does **not** contain chapters. Fetch them with
  `/mangas/{mangaId}/chapters`.
- `DELETE /transgroups/{groupId}/mangas/{mangaId}` is "a group leaves a manga"
  (requires the group to still have at least one other active translating group).
- `PATCH /mangas/{mangaId}` uses `addTransGroups` to add groups; removing a group is a
  separate call.
- `MangaUpdateRequest` is a partial update: omitted fields are preserved. If
  `categoryIds` is provided, it replaces the current category set; if
  `addTransGroups` is provided, those approved groups are added.
- `GET /mangas/{mangaId}/management` is for an authenticated group leader editing a
  manga. `canRemove` is true only for the current leader's group and only when the
  manga has more than one active translating group.

### 7.5 Chapters and pages

| Method | Path | Auth | Role | RL | Body/query | Result |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/mangas/{mangaId}/chapters` | no | — | `60/60 IP` | `page=0&size=20&sortBy=chapterIndex` | `PaginatedResponse<ChapterSummaryResponse>` |
| POST | `/mangas/{mangaId}/chapters` | yes | ADMIN or TRANSLATOR member of manga | `10/60` | `ChapterRequest` | `ChapterResponse` |
| DELETE | `/mangas/{mangaId}/chapters/{chapterId}` | yes | member/leader of manga | `10/60` | — | `DeleteChapterResponse` |
| GET | `/chapters/{chapterId}/pages` | no | — | `60/60 IP` | — | `PageResponse[]` (not paginated) |

Behavior notes:

- The chapter list is sorted by `chapterIndex` descending by default.
- `GET /chapters/{chapterId}/pages` also records a view (counted once per reader per
  30 minutes; `views` is shown in chapter responses).
- Creating a chapter requires `pageUrls` produced by the upload endpoints (see §8).
  Chapter pages are stored in order and later returned as `PageResponse[]` ordered by
  `pageNumber`.

### 7.6 Translation groups

| Method | Path | Auth | Role | RL | Body | Result |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/users/me/transgroups` | yes | current user | none | — | `TransGroupOfUserResponse` |
| GET | `/transgroups` | no | — | `60/60 IP` | `page=0&size=20&sortBy=createdAt` | `PaginatedResponse<TransGroupSummaryResponse>` (APPROVED only) |
| GET | `/transgroups/{id}` | no | — | — | — | `TransGroupDetailsResponse` |
| PATCH | `/transgroups/{id}` | yes | group leader or ADMIN | `10/60` | `TransGroupUpdateRequest` | `TransGroupResponse` |
| DELETE | `/transgroups/{id}` | yes | group leader or ADMIN | `10/60` | — | `DeleteTransGroupResponse` (soft delete → `DELETED`) |
| GET | `/admin/transgroups` | yes | ADMIN | `30/60` | `status?,page=0,size=20,sortBy=createdAt` | `PaginatedResponse<TransGroupSummaryResponse>` |
| DELETE | `/transgroups/{groupId}/users/{userId}` | yes | group leader | — | — | `DeleteMemberResponse` (kick member) |

Notes: the public list only returns `APPROVED` groups. `GET /transgroups/{id}` returns
leader, members, and translated manga regardless of who calls it.

`GET /users/me/transgroups` requires a valid access token and identifies the current
user's group state. The response has these meanings:

- `status: "LEADER"`: the user leads an approved group; `transGroup` contains its summary.
- `status: "MEMBER"`: the user belongs to an approved group as a member;
  `transGroup` contains that group's summary.
- `status: "PENDING_REQUEST"`: the user has a pending group-creation or join request;
  `transGroup` is omitted/null.
- `status: "NONE"`: the user neither belongs to nor leads an approved group and has no
  pending group request; `transGroup` is omitted/null.

The backend checks approved membership before approved leadership. Frontend should use
`status` as the source of truth, treat `transGroup` as optional, and redirect to login
on an unauthenticated `401` response.

### 7.7 Join requests

| Method | Path | Auth | Role | RL | Result |
| --- | --- | --- | --- | --- | --- |
| POST | `/transgroups/{groupId}/join-requests` | yes | — | `3/3600` | `JoinRequestResponse` |
| GET | `/users/me/join-requests?status=` | yes | — | `30/60` | `JoinRequestResponse[]` |
| GET | `/transgroups/{groupId}/join-requests?status=` | yes | group leader | `30/60` | `JoinRequestResponse[]` |
| PATCH | `/transgroups/{groupId}/join-requests/{requestId}/approve` | yes | group leader | `10/60` | `JoinRequestResponse` |
| PATCH | `/transgroups/{groupId}/join-requests/{requestId}/reject` | yes | group leader | `10/60` | `JoinRequestResponse` |

Rules: a user may request a group only if they are not already in (or leading) a group,
and only one `PENDING` request per user/group at a time. `status` query filter accepts
`PENDING | APPROVED | REJECTED`. Approval adds the user to the group and grants the
`TRANSLATOR` role.

### 7.8 Group creation requests

| Method | Path | Auth | Role | RL | Result |
| --- | --- | --- | --- | --- | --- |
| POST | `/creation-requests` | yes | — | — | `CreationRequestResponse` |
| GET | `/users/me/creation-requests?status=&page=0&size=20&sortBy=createdAt` | yes | current user | — | `PaginatedResponse<CreationRequestResponse>` |
| GET | `/admin/creation-requests?status=&page=0&size=20&sortBy=createdAt` | yes | ADMIN | `PaginatedResponse<CreationRequestResponse>` |
| PATCH | `/admin/creation-requests/{requestId}/approve` | yes | ADMIN | `TransGroupResponse` |
| PATCH | `/admin/creation-requests/{requestId}/reject` | yes | ADMIN | `CreationRequestResponse` |

Rules: a user may have only one `PENDING` creation request. Approval creates the
translation group (the creator becomes leader and gains `TRANSLATOR`); only users not
already in/leading a group can be approved. `status` filter accepts
`PENDING | APPROVED | REJECTD`.

### 7.9 Admin: users, roles, permissions

| Method | Path | Role | RL | Body | Result |
| --- | --- | --- | --- | --- | --- |
| POST | `/admin/users` | ADMIN | `10/60` | `UserCreationRequest` | `UserResponse` |
| GET | `/admin/users` | ADMIN | `30/60` | `page=0&size=20&sortBy=createdAt` | `PaginatedResponse<UserSummaryResponse>` |
| GET | `/admin/users/{id}` | ADMIN | `30/60` | — | `UserResponse` |
| PATCH | `/admin/users/{id}` | ADMIN | `10/60` | multipart `UserUpdateForm` | `UserResponse` |
| DELETE | `/admin/users/{id}` | ADMIN | `10/60` | — | `DeleteUserResponse` |
| POST | `/admin/roles` | ADMIN | `10/60` | `RoleRequest` | `RoleResponse` |
| GET | `/admin/roles` | ADMIN | `30/60` | — | `RoleResponse[]` |
| DELETE | `/admin/roles/{id}` | ADMIN | `10/60` | — | `DeleteRoleResponse` |
| POST | `/admin/permissions` | ADMIN | `10/60` | `PermissionRequest` | `PermissionResponse` |
| GET | `/admin/permissions` | ADMIN | `30/60` | — | `PermissionResponse[]` |
| DELETE | `/admin/permissions/{id}` | ADMIN | `10/60` | — | `DeletePermissionResponse` |

Notes:

- `POST /admin/users` with empty `roles` assigns `USER`.
- Admin cannot update or delete another admin (`2002`).
- `DELETE /admin/users/{id}` can also be called by a user on their own id (self-or-admin).

### 7.10 File upload (multipart)

| Method | Path | Role | RL | Form part | Result |
| --- | --- | --- | --- | --- | --- |
| POST | `/files/upload` | ADMIN or TRANSLATOR | `10/60` | `file` (single) | `string` (public URL) |
| POST | `/files/upload-multi` | ADMIN or TRANSLATOR | `3/3600` | `files` (multiple) | `string[]` (public URLs, same order) |

Uploads are validated and converted to WebP, then stored under `tmp/` and returned as
public URLs. Max per-file size is 5 MB. Temporary objects are cleaned up after ~3
hours if unused.

---

## 8. Chapter upload flow (important)

1. Translator uploads images with `POST /files/upload-multi` (form part `files`),
   in page order. Result is an ordered array of public URLs.
2. Submit `POST /mangas/{mangaId}/chapters` with:
   ```json
   {
     "chapterIndex": 1,
     "title": "Chapter 1",
     "pageUrls": ["https://<r2-public-url>/tmp/xxx.webp", "..."]
   }
   ```
3. The backend copies `tmp/` objects into the chapter's permanent prefix and creates
   the pages. On failure the copied objects are rolled back; the `tmp/` originals can
   be reused for a retry.

Constraints: `chapterIndex` is unique per manga; `pageUrls` must be 1..150 entries and
must be URLs produced by this backend (any other URL fails with `5701`/`9004`).

---

## 9. Rate limits (client-facing summary)

The limit key is the client IP for pre-auth/public reads and the authenticated user id
for authenticated mutations. On exceed, the API returns HTTP `429` with code `6001`.
Design the UI to show a friendly "too many requests, try again later" message and avoid
auto-retrying immediately.

Notable strict limits to design around:

- `POST /auth/login`: 5 / 15 min per IP
- `PATCH /users/me/password`: 5 / 15 min per user
- `POST /transgroups/{groupId}/join-requests`: 3 / hour per user
- `POST /files/upload-multi`: 3 / hour per user
- Most admin/leader mutations: 10 / min per user
- Public reads: 60 / min per IP

---

## 10. Seed data (development)

Created only when tables are empty:

- Users: `admin`, `trg25`, `khoa12`, `linh25` (passwords from environment variables,
  not fixed).
- Roles: `ADMIN`, `USER`, `TRANSLATOR`; permissions `CREATE_POST`, `CREATE_MANGA`,
  `UPDATE_MANGA`.
- Categories: Action, Fantasy, Romance, Comedy, Drama.
- One group: "Admin Team", leader `admin`, status `APPROVED`.

Use these accounts to test each role experience.

---

## 11. Suggested React app structure

Recommended stack: React + TypeScript + Vite, React Router, TanStack Query (React
Query) for server state, Axios for HTTP, and a component library (e.g. MUI, Chakra, or
Tailwind + shadcn/ui).

```text
src/
  api/
    client.ts          // axios instance: baseURL, auth header, error normalize
    auth.ts            // login/register/refresh/logout/introspect
    users.ts           // me, update me, admin users
    manga.ts
    chapter.ts
    group.ts           // transgroups, members
    joinRequest.ts
    creationRequest.ts
    category.ts
    roles.ts
    upload.ts
  auth/
    AuthContext.tsx    // token, decoded claims (roles), login/logout/refresh
    useAuth.ts
    ProtectedRoute.tsx // requires auth, optional required role
  hooks/               // React Query hooks per resource
  components/
    layout/            // Header, Nav, Footer
    common/            // Pagination, ErrorMessage, Loading, ConfirmDialog, ImageUploader
    manga/             // MangaCard, MangaGrid, MangaFilters
    chapter/           // ChapterList, ChapterReader
    group/             // GroupCard, GroupHeader, MemberList, JoinRequestList
  pages/
    HomePage           // GET /mangas
    MangaDetailPage    // GET /mangas/{id} + GET /mangas/{mangaId}/chapters
    ChapterReaderPage  // GET /chapters/{chapterId}/pages
    GroupsPage         // GET /transgroups
    GroupDetailPage    // GET /transgroups/{id}
    LoginPage / RegisterPage
    ProfilePage        // GET/PATCH /users/me, PATCH /users/me/password
    MyJoinRequestsPage // GET /users/me/join-requests
    CreateGroupRequestPage // POST /creation-requests
    MyMangaPage        // leader: manga/chapter management
    ChapterEditorPage  // upload pages + POST chapters
    AdminDashboardPage
    admin/UsersPage, RolesPage, PermissionsPage, CategoriesPage,
    admin/MangaPage, admin/GroupsPage, admin/CreationRequestsPage
  types/               // DTO types from §6
  utils/
    jwt.ts             // decode scope/exp
    format.ts          // dates, status labels
```

Routes and access:

| Route | Access |
| --- | --- |
| `/`, `/mangas/:id`, `/mangas/:id/chapters/:chapterId` | public |
| `/groups`, `/groups/:id` | public |
| `/login`, `/register` | public |
| `/profile`, `/my/join-requests`, `/groups/request` | authenticated |
| `/manage/*` (manga/chapter editing) | `TRANSLATOR` (leader for group actions) |
| `/admin/*` | `ADMIN` |

### API client tips

- One axios instance with `baseURL = VITE_API_BASE_URL` and an interceptor that adds
  `Authorization: Bearer <token>` when a token exists.
- A response interceptor should unwrap `ApiResponse<T>` and, on `code === '1001'`,
  attempt a single `/auth/refresh`; if that fails, clear auth and redirect to `/login`.
- Normalize errors to `{ code, message }` from the response body (fall back to the HTTP
  status). Show `message` to users; special-case `6001` (rate limit) and `1001` (auth).
- For pagination, use 0-based `page` in requests and display `result.currentPage`
  (1-based) in the UI.

### Key user flows to implement

1. **Browse:** Home → paginated manga grid with category filter (fetch `/categories`
   once, filter client-side or by future API); click a card → manga detail.
2. **Read:** manga detail → chapter list (`sortBy=chapterIndex`) → open reader →
   `GET /chapters/{id}/pages` → render images in order; track next/prev chapter.
3. **Groups:** list → detail (leader, members, translated manga) → "Request to join"
   (authenticated, non-member) → track in `/my/join-requests`.
4. **Create group:** authenticated non-member submits `POST /creation-requests`; admin
   approves/rejects in `/admin/creation-requests`.
5. **Translate/manage:** a `TRANSLATOR` who is in an active group can create manga
   (`POST /mangas`), edit it, upload pages and create chapters, and delete chapters.
6. **Group leader:** approve/reject join requests, kick members, edit group, remove the
   group from a manga (must keep at least one active group).
7. **Admin:** manage users, categories, and review group requests; browse all manga and
   groups with status filters.

---

## 12. Caveats and gotchas

- `MangaResponse.transGroupsId` is a **list of `TransGroupSummaryResponse` objects**,
  not a list of IDs, despite the field name.
- `MangaDetailsResponse` has **no chapters**; always fetch `/mangas/{mangaId}/chapters`.
- `GroupCreationRequestStatus` uses the misspelled literal value **`REJECTD`**
  (not `REJECTED`).
- Delete endpoints return a small DTO (e.g. `{ "groupId", "mangaId" }`) with
  success `message`, not a bare string.
- `PATCH /users/me` and `PATCH /admin/users/{id}` are multipart, not JSON. To clear a
  field you cannot send `null` (nulls are ignored); there is no explicit "clear field"
  operation.
- `/users/me` does not include roles; derive roles from the JWT `scope` claim or from
  an admin user fetch.
- `POST /mangas` (not `/transgroups/{groupId}/mangas`) creates manga; the creator's
  active group is added automatically.
- Timestamps are ISO-8601 instants; `ChapterSummaryResponse.updatedAt` should be shown
  as a date only.
- The response wrapper omits `message` on ordinary success and omits `result` on void
  operations — code defensively (`response.result`, not `response.data`).
### Cover image flow

Cover images are URL fields, not multipart fields on manga/group JSON endpoints.

1. Upload an image with `POST /files/upload` using multipart field `file`, or use
   `POST /files/upload-multi` with multipart field `files`.
2. Store the returned public URL.
3. Include that URL as `coverImageUrl` when creating/updating a manga or when
   submitting/updating a translation-group profile.
4. If no cover is available, omit the field or send `null`; clients should render a
   local placeholder.

Affected request models:

```ts
interface MangaCreationRequest {
  name: string;
  authorsName?: string;
  coverImageUrl?: string;
  transGroups?: string[];
  categoryIds: number[];
  status: 'COMPLETED' | 'ONGOING' | 'ONHOLD';
  description?: string;
}

interface MangaUpdateRequest extends Partial<MangaCreationRequest> {
  addTransGroups?: string[];
}

interface CreationRequest {
  groupName: string;
  coverImageUrl?: string;
  description?: string;
}

interface TransGroupUpdateRequest {
  name?: string;
  coverImageUrl?: string;
  description?: string;
}
```

# React Native To-Do App (TypeScript) with Auth + Node/MongoDB API

```
todo-app/
├── backend/   Node.js + Express + MongoDB (Mongoose), JWT auth
└── mobile/    React Native CLI (TypeScript) app: App.tsx + src/
```

## Features
- Register / log in with email + password (bcrypt-hashed, JWT, session restored on app start, auto-logout on expired token)
- Add / edit tasks: title, description, start date-time, deadline, priority, category tag
- Mark complete, delete (with confirm), pull-to-refresh
- Filter by status (all/active/overdue/done), priority, tag; text search
- Sort: **Smart** (urgency + priority + readiness mix), deadline, priority, newest
- Progress card, overdue highlighting, dark "midnight neon" UI
- Redux Toolkit state (`auth` + `tasks` slices, memoised selectors)

## 1. Backend
Requires Node 18+ and a running MongoDB (local or Atlas).
```bash
cd backend
cp .env.example .env      # set JWT_SECRET (and MONGO_URI if not local)
npm install
npm run dev               # http://localhost:5000
```
API: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`,
`GET/POST /api/tasks`, `PATCH /api/tasks/:id`, `PATCH /api/tasks/:id/toggle`, `DELETE /api/tasks/:id`
(task routes need `Authorization: Bearer <token>`; every query is scoped to the logged-in user).

## 2. Mobile app
Requires the Android toolchain (Android Studio, JDK 17, an emulator or USB device) — see reactnative.dev/docs/set-up-your-development-environment.

```bash
# create a fresh RN CLI project (TypeScript is the default)
npx @react-native-community/cli@latest init TodoApp
cd TodoApp

# bring in this project's code
cp -r ../todo-app/mobile/src ./src
cp ../todo-app/mobile/App.tsx ./App.tsx

# dependencies
npm install @reduxjs/toolkit react-redux axios \
  @react-navigation/native @react-navigation/native-stack \
  react-native-screens react-native-safe-area-context \
  @react-native-async-storage/async-storage @react-native-community/datetimepicker

npm run android
```

**Backend address** is set in `src/api/client.ts`:
- Android emulator → `http://10.0.2.2:5000/api` (default)
- Physical phone via USB → `adb reverse tcp:5000 tcp:5000`, then use `http://localhost:5000/api`
- Phone on Wi-Fi → use your computer's LAN IP

## Smart sort formula (`src/utils/smartSort.ts`)
`score = 0.5·urgency + 0.35·priority + 0.15·readiness (+0.5 if overdue)`
- urgency = 1 / (1 + hoursLeft/24)
- priority = low 1/3, medium 2/3, high 1
- readiness = 1 once the start time has passed, otherwise fades in over the 48h before start
Completed tasks always sink to the bottom.

## Code map
| Area | Files |
|---|---|
| API / auth | `backend/src/routes/*`, `middleware/auth.ts`, `models/*` |
| State | `mobile/src/store/*` |
| Screens | `mobile/src/screens/*` |
| UI pieces | `mobile/src/components/*`, `theme.ts` |
| Logic | `mobile/src/utils/*` |

---
"with-next-auth": major
"frontend-only": major
"@farcaster/auth-kit": major
"@farcaster/auth-client": minor
"@farcaster/auth-relay": patch
---

Moves `auth-kit` to `react-query`, forcing users to wrap it with `QueryClientProvider` and introduces API changes within hooks and components, to provide options to queries and mutations.

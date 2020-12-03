# auth.js

> GitHub API authentication library for browsers and Node.js

[![@latest](https://img.shields.io/npm/v/@octokit/auth.svg)](https://www.npmjs.com/package/@octokit/auth)
[![Build Status](https://github.com/octokit/auth.js/workflows/Test/badge.svg)](https://github.com/octokit/auth.js/actions?query=workflow%3ATest)

GitHub supports 4 authentication strategies. They are all implemented in `@octokit/auth`.

<!-- toc -->

- [Example usage](#example-usage)
- [Official Strategies](#official-strategies)
  - [Comparison](#comparison)
  - [Token authentication](#token-authentication)
  - [GitHub App or installation authentication](#github-app-or-installation-authentication)
  - [OAuth app and OAuth access token authentication](#oauth-app-and-oauth-access-token-authentication)
  - [GitHub Action authentication](#github-action-authentication)
- [Community Strategies](#community-strategies)
  - [.netrc authentication](#netrc-authentication)
- [License](#license)

<!-- tocstop -->

## Example usage

<table>
<tbody valign=top align=left>
<tr><th>
Browsers
</th><td width=100%>

Load `@octokit/auth` directly from [cdn.skypack.dev](https://cdn.skypack.dev)

```html
<script type="module">
  import {
    createAppAuth,
    createOAuthAppAuth,
    createTokenAuth,
  } from "https://cdn.skypack.dev/@octokit/auth";
</script>
```

</td></tr>
<tr><th>
Node
</th><td>

Install with <code>npm install @octokit/auth</code>

```js
const {
  createAppAuth,
  createOAuthAppAuth,
  createTokenAuth,
  createActionAuth,
} = require("@octokit/auth");
// or:
// import {
//   createAppAuth,
//   createOAuthAppAuth,
//   createTokenAuth,
//   createActionAuth
// } from "@octokit/auth";
```

</td></tr>
</tbody>
</table>

```js
const auth = createAppAuth({
  appId: 12345,
  privateKey: "...",
});
```

Each function exported by `@octokit/auth` returns an async `auth` function.

The `auth` function resolves with an authentication object. If multiple authentication types are supported, a `type` parameter can be passed.

```js
const { token } = await auth({ type: "app" });
```

Additionally, `auth.hook()` can be used to directly hook into [`@octokit/request`](https://github.com/octokit/request.js#readme). If multiple authentication types are supported, the right authentication type will be applied automatically based on the request URL.

```js
const requestWithAuth = request.defaults({
  request: {
    hook: auth.hook,
  },
});

const { data: authorizations } = await requestWithAuth("GET /authorizations");
```

## Official Strategies

### Comparison

<table>
  <thead align=left valign=top>
    <tr>
      <th>Module</th>
      <th>Strategy Options</th>
      <th>Auth Options</th>
      <th colspan=3>Authentication objects</th>
    </tr>
</thead>
<tbody align=left valign=top><tr><td>

`@octokit/auth-token`

</td><td>

```
token
```

</td><td>

```
-
```

</td><td colspan=3>

```
{
  type: "token",
  token: "secret123",
  tokenType, "oauth" // or "installation"
}
```

</td></tr>
<tr><td>

`@octokit/auth-app`

</td><td>

```
{
  id*,
  privateKey*,
  installationId,
  cache,
  request
}
```

</td><td>

```
{
  type*, // "app" or "installation"
  installationId,
  repositoryIds,
  permissions,
  refresh
}
```

</td><td>

```
{
  type: "app",
  token: "abc.def.1234",
  appId: 123,
  expiresAt: "2019-06-11T22:22:34Z"
}
```

</td><td colspan=2>

```
{
  type: "token",
  tokenType: "installation",
  token: "v1.secret123",
  installationId: 1234,
  expiresAt: "2019-06-11T22:22:34Z",
  repositoryIds: [12345],
  permissions: {
    single_file: 'write'
  },
  singleFileName: '.github/myapp.yml'
}
```

</td></tr>
<tr><td>

`@octokit/auth-oauth-app`

</td><td>

```
{
  clientId*,
  clientSecret*,
  code,
  redirectUrl,
  state,
  request
}
```

</td><td>

```
{
  type*, // "oauth-app" or "token"
  url
}
```

</td><td>

```
{
  type: "oauth-app",
  clientId: "abc123",
  clientSecret: "abc123secret",
  headers: {},
  query: {
    clientId: "abc123",
    clientSecret: "abc123secret"
  }
}
```

</td><td colspan=2>

```
{
  type: "token",
  tokenType: "oauth",
  token: "123secret",
  scopes: []
}
```

</td></tr>
<tr><td>

`@octokit/auth-action`

</td><td>

```
-
```

</td><td>

```
-
```

</td><td colspan=3>

```
{
  type: "token",
  tokenType: "installation",
  token: "v1.123secret"
}
```

</td></tr></tbody>
</table>

### Token authentication

Example

```js
const auth = createTokenAuth("1234567890abcdef1234567890abcdef12345678");
const { token, tokenType } = await auth();
```

See [@octokit/auth-token](https://github.com/octokit/auth-token.js#readme) for more details.

### GitHub App or installation authentication

Example

```js
const auth = createAppAuth({
  appId: 1,
  privateKey: "-----BEGIN RSA PRIVATE KEY-----\n...",
});

const appAuthentication = await auth({ type: "auth" });
const installationAuthentication = await auth({
  type: "installation",
  installationId: 123,
});
```

See [@octokit/auth-app](https://github.com/octokit/auth-app.js#readme) for more details.

### OAuth app and OAuth access token authentication

Example

```js
const auth = createOAuthAppAuth({
  clientId: "1234567890abcdef1234",
  clientSecret: "1234567890abcdef1234567890abcdef12345678",
  code: "random123", // code from OAuth web flow, see https://git.io/fhd1D
});

const appAuthentication = await auth({
  type: "oauth-app",
  url: "/orgs/{org}/repos",
});
const tokenAuthentication = await auth({ type: "token" });
```

See [@octokit/auth-oauth-app](https://github.com/octokit/auth-oauth-app.js#readme) for more details.

### GitHub Action authentication

Example

```js
// expects process.env.GITHUB_ACTION and process.env.GITHUB_TOKEN to be set
const auth = createActionAuth();
const { token } = await auth();
```

See [@octokit/auth-action](https://github.com/octokit/auth-action.js#readme) for more details.

## Community Strategies

### .netrc authentication

Similar to [token authentication](#token-authentication), but reads the token from your `~/.netrc` file

Example

```js
// expects a personal access token to be set as `login` in the `~/.netrc` file for `api.github.com`
const { createNetrcAuth } = require("octokit-netrc-auth");
const auth = createNetrcAuth();
const { token } = await auth();
```

See [octokit-auth-netrc](https://github.com/travi/octokit-auth-netrc) for more details.

## License

[MIT](LICENSE)

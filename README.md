# auth.js

> GitHub API authentication library for browsers and Node.js

[![@latest](https://img.shields.io/npm/v/@octokit/auth.svg)](https://www.npmjs.com/package/@octokit/auth)
[![Build Status](https://travis-ci.com/octokit/auth.js.svg?branch=master)](https://travis-ci.com/octokit/auth.js)
[![Greenkeeper](https://badges.greenkeeper.io/octokit/auth.js.svg)](https://greenkeeper.io/)

GitHub supports 4 authentication strategies. They are all implemented in `@octokit/auth`.

<!-- toc -->

- [Example usage](#example-usage)
- [Comparison](#comparison)
- [Token authentication](#token-authentication)
- [Basic and personal access token authentication](#basic-and-personal-access-token-authentication)
- [GitHub App or installation authentication](#github-app-or-installation-authentication)
- [OAuth app and OAuth access token authentication](#oauth-app-and-oauth-access-token-authentication)
- [GitHub Action authentication](#github-action-authentication)
- [License](#license)

<!-- tocstop -->

## Example usage

<table>
<tbody valign=top align=left>
<tr><th>
Browsers
</th><td width=100%>

Load `@octokit/auth` directly from [cdn.pika.dev](https://cdn.pika.dev)

```html
<script type="module">
  import {
    createBasicAuth,
    createAppAuth,
    createOAuthAppAuth,
    createTokenAuth
  } from "https://cdn.pika.dev/@octokit/auth";
</script>
```

</td></tr>
<tr><th>
Node
</th><td>

Install with <code>npm install @octokit/auth</code>

```js
const {
  createBasicAuth,
  createAppAuth,
  createOAuthAppAuth,
  createTokenAuth,
  createActionAuth
} = require("@octokit/auth");
// or:
// import {
//   createBasicAuth,
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
const auth = createBasicAuth({
  username: "monatheoctocat",
  password: "secret",
  on2fa() {
    return prompt("Two-factor authentication Code:");
  }
});
```

Each function exported by `@octokit/auth` returns an async `auth` function.

The `auth` function resolves with an authentication object. If multiple authentication types are supported, a `type` parameter can be passed.

```js
const { token } = await auth({ type: "token" });
```

Additionally, `auth.hook()` can be used to directly hook into [`@octokit/request`](https://github.com/octokit/request.js#readme). If multiple authentication types are supported, the right authentication type will be applied automatically based on the request URL.

```js
const requestWithAuth = request.defaults({
  request: {
    hook: auth.hook
  }
});

const { data: authorizations } = await requestWithAuth("GET /authorizations");
```

## Comparison

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

`@octokit/auth-basic`

</td><td>

```
{
  username*,
  password*,
  on2Fa*,
  token,
  request
}
```

</td><td>

```
{
  type*, // "basic" or "token"
  refresh
}
```

</td><td>

```
{
  type: "basic"
  username: "octocat",
  password: "secret",
  credentials: "b2N0b2NhdDpzZWNyZXQ=",
  totp: "123456"
}
```

</td><td>

```
{
  type: "token"
  tokenType: "pat",
  token: "secret123",
  id: 123,
  username: "octocat",
  scopes: []
}
```

</td><td>

```
{
  type: "token"
  tokenType: "oauth",
  token: "secret123",
  id: 123,
  appClientId: "abc123",
  username: "octocat",
  scopes: []
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
  expriseAt: "2019-06-11T22:22:34Z"
}
```

</td><td colspan=2>

```
{
  type: "token",
  tokenType: "installation",
  token: "v1.secret123",
  installationId: 1234,
  expriseAt: "2019-06-11T22:22:34Z",
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

## Token authentication

Example

```js
const auth = createTokenAuth("1234567890abcdef1234567890abcdef12345678");
const { token, tokenType } = await auth();
```

See [@octokit/auth-token](https://github.com/octokit/auth-token.js#readme) for more details.

## Basic and personal access token authentication

Example

```js
const auth = createBasicAuth({
  username: "octocat",
  password: "secret",
  async on2Fa() {
    // prompt user for the one-time password retrieved via SMS or authenticator app
    return prompt("Two-factor authentication Code:");
  }
});

const { token } = await auth();
const { totp } = await auth({
  type: "basic"
});
```

See [`@octokit/auth-basic`](https://github.com/octokit/auth-basic.js#readme) for more details.

## GitHub App or installation authentication

Example

```js
const auth = createAppAuth({
  id: 1,
  privateKey: "-----BEGIN RSA PRIVATE KEY-----\n..."
});

const appAuthentication = await auth({ type: "auth" });
const installationAuthentication = await auth({
  type: "installation",
  installationId: 123
});
```

See [@octokit/auth-app](https://github.com/octokit/auth-app.js#readme) for more details.

## OAuth app and OAuth access token authentication

Example

```js
const auth = createOAuthAppAuth({
  clientId: "1234567890abcdef1234",
  clientSecret: "1234567890abcdef1234567890abcdef12345678",
  code: "random123" // code from OAuth web flow, see https://git.io/fhd1D
});

const appAuthentication = await auth({
  type: "oauth-app",
  url: "/orgs/:org/repos"
});
const tokenAuthentication = await auth({ type: "token" });
```

See [@octokit/auth-oauth-app](https://github.com/octokit/auth-oauth-app.js#readme) for more details.

## GitHub Action authentication

Example

```js
// expects process.env.GITHUB_ACTION and process.env.GITHUB_TOKEN to be set
const auth = createActionAuth();
const { token } = await auth();
```

See [@octokit/auth-action](https://github.com/octokit/auth-action.js#readme) for more details.

## License

[MIT](LICENSE)

# 🚧 THIS LIBRARY IS WORK IN PROGRESS

# auth.js

> GitHub API authentication library for browsers and Node.js

GitHub supports 4 authentication strategies. They are all implemented in `@octokit/auth`.

<!-- toc -->

- [Example usage](#example-usage)
- [Basic and personal access token authentication](#basic-and-personal-access-token-authentication)
- [GitHub App or installation authentication](#github-app-or-installation-authentication)
- [OAuth app and OAuth access token authentication](#oauth-app-and-oauth-access-token-authentication)
- [Token](#token)
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
  createTokenAuth
} = require("@octokit/auth");
// or:
// import {
//   createBasicAuth,
//   createAppAuth,
//   createOAuthAppAuth,
//   createTokenAuth
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

Additionally, `auth.hook()` can be used to directly hook into [`@octokit/request`](https://github.com/octokit/request.js#readme).

```js
const requestWithAuth = request.defaults({
  request: {
    hook: auth.hook
  }
});

const { data: authorizations } = await requestWithAuth("GET /authorizations");
```

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
import { request } from "@octokit/request";
import { createAppAuth } from "@octokit/auth-app";

const auth = createAppAuth({
  id: 1,
  privateKey: "-----BEGIN RSA PRIVATE KEY-----\n..."
});

(async () => {
  // Retrieve JSON Web Token (JWT) to authenticate as app
  const appAuthentication = await auth();
  const { data: appDetails } = await request("GET /app", {
    headers: appAuthentication.headers,
    previews: ["machine-man"]
  });

  // Retrieve installation access token
  const installationAuthentication = await auth({ installationId: 123 });
  const { data: repositories } = await request(
    "GET /installation/repositories",
    {
      headers: installationAuthentication.headers,
      previews: ["machine-man"]
    }
  );

  // Retrieve JSON Web Token (JWT) or installation access token based on request url
  const url = "/installation/repositories";
  const authentication = await auth({
    installationId: 123,
    url
  });
  const { data: repositories } = await request(url, {
    headers: authentication.headers,
    previews: ["machine-man"]
  });
})();
```

See [@octokit/auth-app](https://github.com/octokit/auth-app.js#readme) for more details.

## OAuth app and OAuth access token authentication

Example

```js
import { createOAuthAppAuth } from "@octokit/auth";
import { request } from "@octokit/request";

(async () => {
  const auth = createOAuthAppAuth({
    clientId,
    clientSecret
  });

  // Request private repos for "octokit" org using client ID/secret authentication
  const appAuthentication = await auth({ url: "/orgs/:org/repos" });
  const result = await request("GET /orgs/:org/repos", {
    org: "octokit",
    type: "private",
    headers: appAuthentication.headers,
    ...appAuthentication.query
  });

  // Request private repos for "octokit" org using OAuth token authentication.
  // "random123" is the authorization code from the web application flow, see https://git.io/fhd1D
  const tokenAuthentication = await auth({ code: "random123" });
  const result = await request("GET /orgs/:org/repos", {
    org: "octokit",
    type: "private",
    headers: tokenAuthentication.headers
  });
})();
```

See [@octokit/auth-oauth-app](https://github.com/octokit/auth-oauth-app.js#readme) for more details.

## Token

Example

```js
const auth = createTokenAuth("1234567890abcdef1234567890abcdef12345678");
const { token, tokenType } = await auth();
```

See [@octokit/auth-token](https://github.com/octokit/auth-token.js#readme) for more details.

## License

[MIT](LICENSE)

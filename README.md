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

<!-- tocstop -->

## Example usage

```js
import { createBasicAuth } from "@octokit/auth";

const auth = createBasicAuth({
  username: "monatheoctocat",
  password: "secret",
  on2fa() {
    return prompt("Two-factor authentication Code:");
  }
});
```

Each function exported by `@octokit/auth` returns an async `auth` function.

The `auth` function resolves with an authentication object which always has two keys: `headers` and `query`. Both objects can directly be applied to a request:

```js
import { request } from "@octokit/request";
const authentication = await auth();

const result = await request("GET /orgs/:org/repos", {
  headers: authentication.headers,
  org: "octokit",
  type: "private",
  ...authentication.query
});
```

The `.query` object is currently only required for authenticating as an OAuth application. In all other cases applying the `.headers` object is sufficient.

## Basic and personal access token authentication

Authenticating using username and password.

GitHub recommends to use basic authentication only for managing [personal access tokens](https://github.com/settings/tokens). Other endpoints won’t even work if a user enabled [two-factor authentication](https://github.com/settings/security) ith SMS as method, because an SMS with the time-based one-time password (TOTP) will only be sent if a request is made to one of these endpoints

- [`POST /authorizations`](https://developer.github.com/v3/oauth_authorizations/#create-a-new-authorization) - Create a new authorization
- [`PUT /authorizations/clients/:client_id`](https://developer.github.com/v3/oauth_authorizations/#get-or-create-an-authorization-for-a-specific-app) - Get-or-create an authorization for a specific app
- [`PUT /authorizations/clients/:client_id/:fingerprint`](https://developer.github.com/v3/oauth_authorizations/#get-or-create-an-authorization-for-a-specific-app-and-fingerprint) - Get-or-create an authorization for a specific app and fingerprint
- [`PATCH /authorizations/:authorization_id`](https://developer.github.com/v3/oauth_authorizations/#update-an-existing-authorization) - Update an existing authorization
- [`DELETE /authorizations/:authorization_id`](https://developer.github.com/v3/oauth_authorizations/#delete-an-authorization) - Delete an authorization

By default, `@octokit/auth` implements this best practice and retrieves a personal access token.

Some endpoint however do require basic authentication, such as [List your authorizations](https://developer.github.com/v3/oauth_authorizations/#list-your-authorizations) or [Delete an authorization](https://developer.github.com/v3/oauth_authorizations/#delete-an-authorization). In order to retrieve the right authentication for the right endpoint, you can pass an optional `url` parameter to `auth()`.

### Usage

Minimal

```js
import { createBasicAuth } from "@octokit/auth";

const auth = createBasicAuth({
  username: "octocat",
  password: "secret",
  async on2Fa() {
    // prompt user for the one-time password retrieved via SMS or authenticator app
    return prompt("Two-factor authentication Code:");
  }
});

const authentication = await auth();
```

All strategy options

```js
import { createBasicAuth } from "@octokit/auth";

const auth = createBasicAuth({
  username: "octocat",
  password: "secret",
  async on2Fa() {
    return prompt("Two-factor authentication Code:");
  },
  token: {
    note: "octokit 2019-04-03 abc4567",
    scopes: [],
    noteUrl: "https://github.com/octokit/auth.js#basic-auth",
    fingerprint: "abc4567",
    clientId: "1234567890abcdef1234",
    clientSecret: "1234567890abcdef1234567890abcdef12345678"
  }
});
```

Retrieve basic authentication

```js
const authentication = await auth({ url: "/authorizations/:authorization_id" });
```

### Strategy options

<table width="100%">
  <thead align=left>
    <tr>
      <th width=150>
        name
      </th>
      <th width=70>
        type
      </th>
      <th>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>username</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        <strong>Required</strong>. Username of the account to login with.
      </td>
    </tr>
    <tr>
      <th>
        <code>password</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        <strong>Required</strong>. Password of the account to login with.
      </td>
    </tr>
    <tr>
      <th>
        <code>on2Fa</code>
      </th>
      <th>
        <code>function</code>
      </th>
      <td>
        <strong>Required</strong>. If the user has <a href="https://help.github.com/en/articles/securing-your-account-with-two-factor-authentication-2fa">two-factor authentication (2FA)</a> enabled, the <code>on2Fa</code> method will be called and expected to return a time-based one-time password (TOTP) which the user retrieves either via SMS or an authenticator app, based on their account settings. You can pass an empty function if you are certain the account has 2FA disabled.<br>
        <br>
        Alias: <code>on2fa</code>
      </td>
    </tr>
    <tr>
      <th>
        <code>token</code>
      </th>
      <th>
        <code>object</code>
      </th>
      <td>
        An object matching <a href="https://developer.github.com/v3/oauth_authorizations/#parameters">"Create a new authorization" parameters</a>, but camelCased.
      </td>
    </tr>
    <tr>
      <th>
        <code>token.note</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        A note to remind you what the OAuth token is for. Personal access tokens must have a unique note. Attempting to create a token with with an existing note results in a <code>409 conflict error</code>.<br>
        <br>
        Defaults to "octokit <code>&lt;timestamp&gt;</code> <code>&lt;fingerprint></code>", where <code>&lt;timestamp&gt;</code> has the format <code>YYYY-MM-DD</code> and <code>&lt;fingerprint&gt;</code> is a random string. Example: "octokit 2019-04-03 abc4567".
      </td>
    </tr>
    <tr>
      <th>
        <code>token.scopes</code>
      </th>
      <th>
        <code>array of strings</code>
      </th>
      <td>
        A list of scopes that this authorization is in. See <a href="https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/#available-scopes">available scopes</a><br>
        <br>
        Defaults to an empty array
      </td>
    </tr>
    <tr>
      <th>
        <code>token.noteUrl</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        A URL to remind you what app the OAuth token is for.<br>
        <br>
        Defaults to "https://github.com/octokit/auth.js#basic-auth"
      </td>
    </tr>
    <tr>
      <th>
        <code>token.fingerprint</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        A unique string to distinguish an authorization from others created for the same client ID and user.<br>
        <br>
        Defaults to a random string
      </td>
    </tr>
    <tr>
      <th>
        <code>token.clientId</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        The 20 character OAuth app client key for which to create the token.
      </td>
    </tr>
    <tr>
      <th>
        <code>token.clientSecret</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        The 40 character OAuth app client secret for which to create the token.<br>
        <br>
        <strong>Note</strong>: do not share an OAuth app’s client secret with an untrusted client such as a website or native app.
      </td>
    </tr>
  </tbody>
</table>

### Auth options

<table width="100%">
  <thead align=left>
    <tr>
      <th width=150>
        name
      </th>
      <th width=70>
        type
      </th>
      <th>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>url</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        An absolute URL or endpoint route path. Examples
        <ul>
          <li><code>"https://enterprise.github.com/api/v3/authorizations"</code></li>
          <li><code>"/authorizations/123"</code></li>
          <li><code>"/authorizations/:authorization_id"</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <th>
        <code>refresh</code>
      </th>
      <th>
        <code>boolean</code>
      </th>
      <td>
        Information for a personal access token is retrieved from <a href="https://developer.github.com/v3/users/#get-the-authenticated-user"><code>GET /user</code></a> and cached for subsequent requests. To bypass and update cache, set <code>refresh</code> to <code>true</code>.<br>
        <br>
        Defaults to <code>false</code>.
      </td>
    </tr>
  </tbody>
</table>

### Authentication object

There are three possible results

1. **A personal access token authentication**  
   ❌ `url` parameter _does not_ match and endpoint requiring basic authentication  
   ❌ `basic.token.clientId` / `basic.token.clientSecret` not passed as strategy options.
2. **An oauth access token authentication**  
   ❌ `url` parameter _does not_ match and endpoint requiring basic authentication  
   ✅ `basic.token.clientId` / `basic.token.clientSecret` passed as strategy options.
3. **Basic authentication**  
   ✅ `url` parameter matches and endpoint requiring basic authentication.

#### Personal access token authentication

<table width="100%">
  <thead align=left>
    <tr>
      <th width=150>
        name
      </th>
      <th width=70>
        type
      </th>
      <th>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>type</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        <code>"token"</code>
      </td>
    </tr>
    <tr>
      <th>
        <code>token</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        The personal access token
      </td>
    </tr>
    <tr>
      <th>
        <code>user</code>
      </th>
      <th>
        <code>object</code>
      </th>
      <td>
        <code>{ login, id }</code> - username and database id
      </td>
    </tr>
    <tr>
      <th>
        <code>scopes</code>
      </th>
      <th>
        <code>array of strings</code>
      </th>
      <td>
        array of scope names
      </td>
    </tr>
    <tr>
      <th>
        <code>headers</code>
      </th>
      <th>
        <code>object</code>
      </th>
      <td>
        <code>{ authorization }</code> - value for the "Authorization" header.
      </td>
    </tr>
    <tr>
      <th>
        <code>query</code>
      </th>
      <th>
        <code>object</code>
      </th>
      <td>
        <code>{}</code> - not used
      </td>
    </tr>
  </tbody>
</table>

#### OAuth access token authentication

<table width="100%">
  <thead align=left>
    <tr>
      <th width=150>
        name
      </th>
      <th width=70>
        type
      </th>
      <th>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>type</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        <code>"token"</code>
      </td>
    </tr>
    <tr>
      <th>
        <code>token</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        The oauth access token
      </td>
    </tr>
    <tr>
      <th>
        <code>user</code>
      </th>
      <th>
        <code>object</code>
      </th>
      <td>
        <code>{ login }</code> - username
      </td>
    </tr>
    <tr>
      <th>
        <code>scopes</code>
      </th>
      <th>
        <code>array of strings</code>
      </th>
      <td>
        array of scope names
      </td>
    </tr>
    <tr>
      <th>
        <code>headers</code>
      </th>
      <th>
        <code>object</code>
      </th>
      <td>
        <code>{ authorization }</code> - value for the "Authorization" header.
      </td>
    </tr>
    <tr>
      <th>
        <code>query</code>
      </th>
      <th>
        <code>object</code>
      </th>
      <td>
        <code>{}</code> - not used
      </td>
    </tr>
  </tbody>
</table>

#### Basic authentication result

<table width="100%">
  <thead align=left>
    <tr>
      <th width=150>
        name
      </th>
      <th width=70>
        type
      </th>
      <th>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>type</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        <code>"basic"</code>
      </td>
    </tr>
    <tr>
      <th>
        <code>username</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        The decoded username
      </td>
    </tr>
    <tr>
      <th>
        <code>password</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        The decoded password
      </td>
    </tr>
    <tr>
      <th>
        <code>user</code>
      </th>
      <th>
        <code>object</code>
      </th>
      <td>
        <code>{ login, id }</code> - username and database id
      </td>
    </tr>
    <tr>
      <th>
        <code>headers</code>
      </th>
      <th>
        <code>object</code>
      </th>
      <td>
        <code>{ authorization }</code> - value for the "Authorization" header.
      </td>
    </tr>
    <tr>
      <th>
        <code>query</code>
      </th>
      <th>
        <code>object</code>
      </th>
      <td>
        <code>{}</code> - not used
      </td>
    </tr>
  </tbody>
</table>

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

See [@octokit/auth-app](https://github.com/octokit/auth-app.js) for more details.

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

See [@octokit/auth-oauth-app](https://github.com/octokit/auth-oauth-app.js) for more details.

## Token

Example

```js
import { createTokenAuth } from "@octokit/auth";
import { request } from "@octokit/request";

(async () => {
  const auth = createTokenAuth("1234567890abcdef1234567890abcdef12345678");
  const authentication = await auth();
  // {
  //   type: 'token',
  //   token: '1234567890abcdef1234567890abcdef12345678',
  //   tokenType: 'oauth',
  //   headers: {
  //     authorization: 'token 1234567890abcdef1234567890abcdef12345678'
  //   }
  // }

  // `authentication.headers` can be directly passed to a request
  const result = await request("GET /orgs/:org/repos", {
    headers: authentication.headers,
    org: "octokit",
    type: "private"
  });
})();
```

See [@octokit/auth-token](https://github.com/octokit/auth-token.js) for more details.

## License

[MIT](LICENSE)

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

Each function exported by `@octokit/auth` returns an async `auth` function which might accept parameteters, depending on the strategy.

The `auth` function resolves with an authentication object which always have both a `headers` and a `query` object which have to be applied to a request for authentication.

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
        <code>"personal-access-token"</code>
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
        <code>"oauth-access-token"</code>
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
        <code>token</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        The base64-encoded <code>username:password</code> string
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

Authenticating using a GitHub App’s ID and private key.

### Usage

Retrieve JSON Web Token (JWT) to authenticate as app

```js
import { createAppAuth } from "@octokit/auth";

const auth = createAppAuth({
  id: 1,
  privateKey: "-----BEGIN RSA PRIVATE KEY-----\n..."
});

const authentication = await auth();
```

Retrieve installation access token

```js
const authentication = await auth({ installationId: 123 });
```

Retrieve JSON Web Token or installation access token based on request url

```js
import { createAppAuth } from "@octokit/auth";

const auth = createAppAuth({
  id: 1,
  privateKey: "-----BEGIN RSA PRIVATE KEY-----\n...",
  installationId: 123
});

const authentication = await auth({ url });
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
        <code>id</code>
      </th>
      <th>
        <code>number</code>
      </th>
      <td>
        <strong>Required</strong>. Find <strong>App ID</strong> on the app’s about page in settings.
      </td>
    </tr>
    <tr>
      <th>
        <code>privateKey</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        <strong>Required</strong>. Content of the <code>*.pem</code> file you downloaded from the app’s about page. You can generate a new private key if needed.
      </td>
    </tr>
    <tr>
      <th>
        <code>installationId</code>
      </th>
      <th>
        <code>number</code>
      </th>
      <td>
        To limit authentication to a single installation, pass an <code>installationId</code> to the constructor.
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
        <code>installationId</code>
      </th>
      <th>
        <code>number</code>
      </th>
      <td>
        ID of installation to retrieve authentication for. If <code>installationId</code> was already passed as constructor option, then it will be ignored and a warning will be logged.
      </td>
    </tr>
    <tr>
      <th>
        <code>url</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        An absolute URL or endpoint route path. Examples:
        <ul>
          <li><code>"https://enterprise.github.com/api/v3/app"</code></li>
          <li><code>"/app/installations/123"</code></li>
          <li><code>"/app/installations/:installation_id"</code></li>
        </ul>
        If <code>installationId</code> was already passed as constructor option, the resulting authentication object is determined to be a JWT or an installation token authentication by the passed <code>url</code>.
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
        Installation tokens expire after one hour. By default, tokens are cached and returned from cache until expired. To bypass and update a cached token for the given <code>installationId</code>, set <code>refresh</code> to <code>true</code>.<br>
        <br>
        Defaults to <code>false</code>.
      </td>
    </tr>
  </tbody>
</table>

### Authentication object

There are two possible results

1. **JSON Web Token (JWT) authentication**  
   ❌ `installationId` was _not_ passed to either the constructor or `auth()`  
   ✅ `url` to `auth()` matches an endpoint that requires JWT authentication.
2. **Installation access token authentication**  
   ✅ `installationId` passed to either the constructor or `auth()`  
   ❌ `url` passed to `auth()` does not match an endpoint that requires JWT authentication.

#### JSON Web Token (JWT) authentication

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
        <code>"app"</code>
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
        The JSON Web Token (JWT) to authenticate as the app.
      </td>
    </tr>
    <tr>
      <th>
        <code>app</code>
      </th>
      <th>
        <code>object</code>
      </th>
      <td>
        <code>{ id }</code> - GitHub App database ID.
      </td>
    </tr>
    <tr>
      <th>
        <code>expiration</code>
      </th>
      <th>
        <code>number</code>
      </th>
      <td>
        Number of seconds from 1970-01-01T00:00:00Z UTC. A Date object can be created using <code>new Date(authentication.expiration * 1000)</code>.
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

#### Installation access token authentication

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
        <code>"installation"</code>
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
        The installation access token.
      </td>
    </tr>
    <tr>
      <th>
        <code>id</code>
      </th>
      <th>
        <code>number</code>
      </th>
      <td>
        Installation database ID.
      </td>
    </tr>
    <tr>
      <th>
        <code>permissions</code>
      </th>
      <th>
        <code>object</code>
      </th>
      <td>
        Key/value object, where they keys are permission names and values are either <code>"read"</code> or <code>"write"</code>. See <a href="https://developer.github.com/v3/apps/permissions/">GitHub App Permissions</a>.
      </td>
    </tr>
    <tr>
      <th>
        <code>events</code>
      </th>
      <th>
        <code>array of strings</code>
      </th>
      <td>
        Array of event names the app is recieving. See <a href="https://developer.github.com/v3/activity/events/types/">Event Types & Payloads</a>.
      </td>
    </tr>
    <tr>
      <th>
        <code>repositorySelection</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        Can be either `"all"` or `"selected"`, depending on whether installed on all or selected repositories.
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

## OAuth app and OAuth access token authentication

Authenticating using client ID and secret.

This is meant for the use on servers only, never expose an OAuth client secret on a client such as a web application. `clientId` and `clientSecret` can be passed as URL query parameters to get a higher rate limit, instead of sending unauthenticated requests.

The only exceptions are

- [`GET /applications/:client_id/tokens/:access_token`](https://developer.github.com/v3/oauth_authorizations/#check-an-authorization) - Check an authorization
- [`POST /applications/:client_id/tokens/:access_token`](https://developer.github.com/v3/oauth_authorizations/#reset-an-authorization) - Reset an authorization
- [`DELETE /applications/:client_id/tokens/:access_token`](https://developer.github.com/v3/oauth_authorizations/#revoke-an-authorization-for-an-application) - Revoke an authorization for an application

For these endpoints, `clientId` and `clientSecret` need to be passed as basic authentication in the `Authorization` header. Because of that it’s recommended to pass a `url` parameter to `auth()`.

To retrieve an OAuth access token using the web flow, see see [`@octokit/oauth-login-url`](https://github.com/octokit/oauth-login-url.js). The web flow will return a `code` which you can then pass to `auth()` in order to retrieve an OAuth access token authentication.

To retrieve an OAuth access token using username and password, use [Basic Authentication](#basic-authentication) instead.

### Usage

Retrieve OAuth authentication

```js
import { createOAuth } from "@octokit/auth";

const auth = createOAuth({
  clientId,
  clientSecret
});

const authentication = await auth({ url });
```

Retrieve OAuth access token authentication

```js
const authentication = auth({ code });
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
        <code>clientId</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        <strong>Required</strong>. Find your OAuth app’s <code>Client ID</code> in your account’s developer settings.
      </td>
    </tr>
    <tr>
      <th>
        <code>clientSecret</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        <strong>Required for OAuth apps</strong>. Find your OAuth app’s <code>Client Secret</code> in your account’s developer settings.
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
        An absolute URL or endpoint route path. Examples:
        <ul>
          <li><code>"https://enterprise.github.com/api/v3/applications/1234567890abcdef1234/tokens/secret123"</code></li>
          <li><code>"/applications/1234567890abcdef1234/tokens/secret123"</code></li>
          <li><code>"/applications/:client_id/tokens/:access_token"</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <th>
        <code>code</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        The <code>code</code> as passed as query parameter to the callback URL from the <a href="https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#2-users-are-redirected-back-to-your-site-by-github">OAuth web application flow</a>.
      </td>
    </tr>
  </tbody>
</table>

### Authentication object

There are two possible results

1. **OAuth authentication** if no `url` option was passed or the passed `url` does not match `/applications/:client_id/tokens/:access_token`.
2. **OAuth access token authentication** if `code` option was passed.

#### OAuth authentication

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
        <code>"oauth"</code>
      </td>
    </tr>
    <tr>
      <th>
        <code>clientId</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        The client ID as passed to the constructor.
      </td>
    </tr>
    <tr>
      <th>
        <code>clientSecret</code>
      </th>
      <th>
        <code>string</code>
      </th>
      <td>
        The client secret as passed to the constructor.
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
        <code>{}</code> if no <code>url</code> option was passed or the passed <code>url</code> option <em>does not</em> match <code>/applications/:client_id/tokens/:access_token</code>.<br>
        <br>
        <code>{ authorization }</code> if the passed <code>url</code> option <em>does</em> match <code>/applications/:client_id/tokens/:access_token</code>.
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
        <code>{ client_id, client_secret }</code> if no <code>url</code> option was passed or the passed <code>url</code> option <em>does not</em> match <code>/applications/:client_id/tokens/:access_token</code>.<br>
        <br>
        <code>{}</code> if the passed <code>url</code> option <em>does</em> match <code>/applications/:client_id/tokens/:access_token</code>.
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
        <code>"oauth-access-token"</code>
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
        <code>{ authorization }</code> - value for the "Authorization" header
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

## Token

Authenticating using a token, which maybe be either a personal access token, an oauth access token, or an installation access token.

### Usage

```js
import { createTokenAuth } from "@octokit/auth";

const auth = createTokenAuth("secret123");

const authentication = await auth();
```

### Strategy options

The `token` strategy method accepts a single argument of type string, which is the token.

### Auth options

There are no options for token authentication.

### Authentication object

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
        The provided token.
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
</tbody>

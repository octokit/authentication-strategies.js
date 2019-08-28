import { createBasicAuth } from "@octokit/auth-basic";
import { createAppAuth } from "@octokit/auth-app";
import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import { createTokenAuth } from "@octokit/auth-token";
import { createActionAuth } from "@octokit/auth-action";

export {
  createBasicAuth,
  createAppAuth,
  createOAuthAppAuth,
  createTokenAuth,
  createActionAuth
};

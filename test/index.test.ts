import {
  createBasicAuth,
  createAppAuth,
  createOAuthAppAuth,
  createTokenAuth,
  createActionAuth
} from "../src/index";

test("smoke", async () => {
  expect(createBasicAuth).toBeInstanceOf(Function);
  expect(createAppAuth).toBeInstanceOf(Function);
  expect(createOAuthAppAuth).toBeInstanceOf(Function);
  expect(createTokenAuth).toBeInstanceOf(Function);
  expect(createActionAuth).toBeInstanceOf(Function);
});

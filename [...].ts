import { NuxtAuthHandler } from '#auth';
import { type JWT } from 'next-auth/jwt';
import AzureADProvider from 'next-auth/providers/azure-ad';
const {
  authSecret,
  azureAdClientId,
  azureAdClientSecret,

  public: publicConfig,
} = useRuntimeConfig();

export default NuxtAuthHandler({
  secret: authSecret,
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    AzureADProvider.default({
      clientId: azureAdClientId,
      clientSecret: azureAdClientSecret,
      tenantId: publicConfig.azureAdTenantId,
      checks: ['none'],
      authorization: {
        params: {
          scope: `offline_access openid profile email`,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, profile, account }) {
      if (account && profile) {
        token.picture = null;
        token.roles = profile.roles;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : 0;
        token.refreshToken = account.refresh_token;
      }
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }
      return refreshAccessToken(token);
    },
    session({ session, token }) {
      session.user.roles = token.roles ?? [];
      return session;
    },
  },
});

async function refreshAccessToken(accessToken: JWT) {
  try {
    const url = `https://login.microsoftonline.com/${publicConfig.azureAdTenantId}/oauth2/v2.0/token`;
    const req = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body:
        `grant_type=refresh_token` +
        `&client_secret=${azureAdClientSecret}` +
        `&refresh_token=${accessToken.refreshToken}` +
        `&client_id=${azureAdClientId}`,
    });
    const res = await req.json();
    return {
      ...accessToken,
      accessTokenExpires: Date.now() + res.expires_in * 1000,
      refreshToken: res.refresh_token ?? accessToken.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.log(error);
    return {
      ...accessToken,
      error: 'RefreshAccessTokenError',
    };
  }
}

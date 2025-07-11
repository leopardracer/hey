import { STATIC_IMAGES_URL, TRANSFORMS } from "@hey/data/constants";
import escapeHtml from "@hey/helpers/escapeHtml";
import { default as getAccountData } from "@hey/helpers/getAccount";
import getAvatar from "@hey/helpers/getAvatar";
import { AccountDocument } from "@hey/indexer";
import type { Context } from "hono";
import { html, raw } from "hono/html";
import generateOg from "./ogUtils";

const getAccount = async (ctx: Context) => {
  const { username } = ctx.req.param();
  const cacheKey = `og:account:${username}`;

  return generateOg({
    ctx,
    cacheKey,
    query: AccountDocument,
    variables: { request: { username: { localName: username } } },
    extractData: (data) => data.account,
    buildJsonLd: (account) => {
      const { name, usernameWithPrefix } = getAccountData(account);
      const title = `${name} (${usernameWithPrefix}) on Hey`;
      const description = (account?.metadata?.bio || title).slice(0, 155);

      return {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": `https://hey.xyz/u/${username}`,
        name,
        alternateName: username,
        description,
        image: getAvatar(account, TRANSFORMS.AVATAR_BIG),
        url: `https://hey.xyz/u/${username}`,
        memberOf: { "@type": "Organization", name: "Hey.xyz" }
      };
    },
    buildHtml: (account, escapedJsonLd) => {
      const { name, link, usernameWithPrefix } = getAccountData(account);
      const title = `${name} (${usernameWithPrefix}) on Hey`;
      const description = (account?.metadata?.bio || title).slice(0, 155);
      const avatar = getAvatar(account, TRANSFORMS.AVATAR_BIG);

      const escTitle = escapeHtml(title);
      const escDescription = escapeHtml(description);
      const escName = escapeHtml(name);
      const escUsernameWithPrefix = escapeHtml(usernameWithPrefix);

      return html`
        <html>
          <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width" />
            <title>${escTitle}</title>
            <meta name="description" content="${escDescription}" />
            <meta property="og:title" content="${escTitle}" />
            <meta property="og:description" content="${escDescription}" />
            <meta property="og:type" content="profile" />
            <meta property="og:site_name" content="Hey" />
            <meta property="og:url" content="https://hey.xyz${link}" />
            <meta property="og:image" content="${avatar}" />
            <meta property="og:logo" content="${STATIC_IMAGES_URL}/app-icon/0.png" />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content="${escTitle}" />
            <meta name="twitter:description" content="${escDescription}" />
            <meta property="twitter:image" content="${avatar}" />
            <meta name="twitter:site" content="@heydotxyz" />
            <link rel="canonical" href="https://hey.xyz${link}" />
          </head>
          <body>
            <script type="application/ld+json">${raw(escapedJsonLd)}</script>
            <img src="${avatar}" alt="${escName}" height="100" width="100" />
            <h1>${escName || username}</h1>
            <h2>${escUsernameWithPrefix}</h2>
            <h3>${escDescription}</h3>
          </body>
        </html>
      `;
    }
  });
};

export default getAccount;

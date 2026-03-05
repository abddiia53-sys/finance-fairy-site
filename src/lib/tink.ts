const TINK_CLIENT_ID = "111707427676486fa468b006edd031f0";

export function openTinkLink() {
  const redirectUri = `${window.location.origin}/`;
  const tinkUrl = new URL("https://link.tink.com/1.0/transactions/connect-accounts");
  tinkUrl.searchParams.set("client_id", TINK_CLIENT_ID);
  tinkUrl.searchParams.set("redirect_uri", redirectUri);
  tinkUrl.searchParams.set("scope", "accounts:read,transactions:read");
  tinkUrl.searchParams.set("market", "SE");
  tinkUrl.searchParams.set("locale", "sv_SE");

  window.location.href = tinkUrl.toString();
}

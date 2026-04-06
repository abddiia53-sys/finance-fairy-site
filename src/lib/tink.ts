const TINK_CLIENT_ID = "111707427676486fa468b006edd031f0";

function generateRandomState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function openTinkLink() {
  const redirectUri = `${window.location.origin}/tink-callback`;
  const state = generateRandomState();
  sessionStorage.setItem("tink_oauth_state", state);

  const tinkUrl = new URL("https://link.tink.com/1.0/transactions/connect-accounts");
  tinkUrl.searchParams.set("client_id", TINK_CLIENT_ID);
  tinkUrl.searchParams.set("redirect_uri", redirectUri);
  tinkUrl.searchParams.set("scope", "accounts:read,transactions:read");
  tinkUrl.searchParams.set("market", "SE");
  tinkUrl.searchParams.set("locale", "sv_SE");
  tinkUrl.searchParams.set("state", state);

  window.location.href = tinkUrl.toString();
}

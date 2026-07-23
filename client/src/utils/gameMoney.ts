const GAME_MONEY_SYMBOL = "₩";

// Keep game money formatting consistent anywhere player balances, prices, or rent appear.
export function formatMoney(amount: number | null | undefined) {
  // Some transitional UI states can pass undefined before tile/player data resolves.
  const normalizedAmount = Number(amount ?? 0);
  if (!Number.isFinite(normalizedAmount)) {
    console.warn("Invalid money amount:", amount);
    return `${GAME_MONEY_SYMBOL}?`;
  }

  return normalizedAmount < 0
    ? `-${GAME_MONEY_SYMBOL}${Math.abs(normalizedAmount)}`
    : `${GAME_MONEY_SYMBOL}${normalizedAmount}`;
}

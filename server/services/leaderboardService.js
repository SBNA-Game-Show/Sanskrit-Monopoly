import { firestore } from "../config/firebaseAdmin.js";

const LEADERBOARD_COLLECTION = "leaderboards-staging";
const GAME_TITLE = "sanskrit-monopoly";

function getYearMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
}

function getTimePlayedInSeconds(lobby) {
    if (!lobby.startTime || !lobby.endTime) {
        return 0;
    }

    return Math.floor((lobby.endTime - lobby.startTime) / 1000);
}

export async function submitScoresToLeaderboard(lobby) {
    if (!lobby || !Array.isArray(lobby.players)) {
        console.warn("Leaderboard submission skipped: invalid lobby data.");
        return;
    }

    const yearMonth = getYearMonth();
    const timestamp = Date.now();
    const timePlayedInSeconds = getTimePlayedInSeconds(lobby);

    const entries = {};

    lobby.players.forEach((player) => {
        if (!player.uid) return;

        const entryKey = `${timestamp}_${player.uid}_${timePlayedInSeconds}`;
        const score = Number(player.points ?? player.score ?? 0);

        entries[entryKey] = Number.isFinite(score) ? score : 0;
    });

    if (Object.keys(entries).length === 0) {
        console.warn("Leaderboard submission skipped: no valid player entries.");
        return;
    }

    const gameHistoryDoc = firestore
        .collection(LEADERBOARD_COLLECTION)
        .doc(GAME_TITLE)
        .collection("gameHistory")
        .doc(yearMonth);

    const globalHistoryDoc = firestore
        .collection(LEADERBOARD_COLLECTION)
        .doc("Global")
        .collection("gameHistory")
        .doc(yearMonth);

    const batch = firestore.batch();

    batch.set(
        firestore.collection(LEADERBOARD_COLLECTION).doc(GAME_TITLE),
        { label: GAME_TITLE },
        { merge: true }
    );

    batch.set(
        firestore.collection(LEADERBOARD_COLLECTION).doc("Global"),
        { label: "Global" },
        { merge: true }
    );

    batch.set(gameHistoryDoc, { entries }, { merge: true });
    batch.set(globalHistoryDoc, { entries }, { merge: true });

    await batch.commit();
    console.log("Leaderboard scores submitted successfully.");

}
/**
 * Tính quality SRS dựa trên tính đúng/sai và thời gian trả lời.
 * Dùng cho các chế độ gõ: ReadType, ListenType, FillInBlank.
 *
 * Bảng mapping:
 *  Sai               → AGAIN
 *  Đúng, ≤ 4s        → EASY   (+2 level)
 *  Đúng, 4–10s       → GOOD   (+1 level)
 *  Đúng, 10–13s      → HARD   (giữ level)
 *  Đúng, > 13s       → AGAIN  (nhớ quá lâu tương đương không nhớ)
 *
 * @param {boolean} isCorrect  - Người dùng trả lời đúng hay sai
 * @param {number}  elapsedMs  - Thời gian từ lúc từ xuất hiện tới khi submit (ms)
 * @returns {"AGAIN"|"HARD"|"GOOD"|"EASY"}
 */
export const calcQualityByTime = (isCorrect, elapsedMs) => {
    if (!isCorrect) return "AGAIN";

    const seconds = elapsedMs / 1000;

    if (seconds <= 8) return "EASY";
    if (seconds <= 15) return "GOOD";
    if (seconds <= 18) return "HARD";
    return "AGAIN"; // đúng nhưng phải nghĩ quá lâu → học lại
};

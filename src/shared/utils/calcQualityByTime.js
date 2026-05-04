/**
 * Tính quality SRS dựa trên tính đúng/sai và thời gian trả lời.
 * Dùng cho các chế độ gõ: ReadType, ListenType, FillInBlank.
 *
 * Bảng mapping:
 *  Sai               → AGAIN
 *  Đúng, ≤ 4s        → EASY   (+2 level)
 *  Đúng, 4–8s        → GOOD   (+1 level)
 *  Đúng, 8–12s       → HARD   (giữ level)
 *  Đúng, > 12s       → AGAIN  (reset — nhớ quá lâu tương đương không nhớ)
 *
 * @param {boolean} isCorrect  - Người dùng trả lời đúng hay sai
 * @param {number}  elapsedMs  - Thời gian từ lúc từ xuất hiện tới khi submit (ms)
 * @returns {"AGAIN"|"HARD"|"GOOD"|"EASY"}
 */
export const calcQualityByTime = (isCorrect, elapsedMs) => {
    if (!isCorrect) return "AGAIN";

    const seconds = elapsedMs / 1000;

    if (seconds <= 4) return "EASY";
    if (seconds <= 8) return "GOOD";
    if (seconds <= 12) return "HARD";
    return "AGAIN"; // đúng nhưng phải nghĩ quá lâu → học lại
};

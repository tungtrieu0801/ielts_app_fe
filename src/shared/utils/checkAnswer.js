/**
 * Trả về danh sách các chuỗi mục tiêu hợp lệ để so khớp từ vựng.
 * Hỗ trợ các từ có chứa ngoặc đơn (phần tùy chọn hoặc cụm từ giải thích), ví dụ: "blend (into)"
 * 
 * @param {string} target - Từ vựng gốc trong database (ví dụ: "blend (into)")
 * @returns {string[]} Mảng các chuỗi mục tiêu hợp lệ đã được chuẩn hóa (chữ thường, gọn khoảng trắng)
 */
export const getValidTargets = (target) => {
    if (!target) return [];

    const clean = (str) => {
        return str
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ");
    };

    const cleanedTarget = clean(target);
    const targets = new Set();

    // 1. Bản gốc đã chuẩn hóa khoảng trắng/chữ thường (ví dụ: "blend (into)")
    targets.add(cleanedTarget);

    // 2. Bỏ dấu ngoặc nhưng giữ lại từ bên trong (ví dụ: "blend (into)" -> "blend into")
    const withInner = cleanedTarget.replace(/[()]/g, "").replace(/\s+/g, " ").trim();
    targets.add(withInner);

    return Array.from(targets);
};

/**
 * Kiểm tra xem câu trả lời của người dùng có chính xác không.
 *
 * @param {string} input - Câu trả lời người dùng nhập
 * @param {string} target - Từ vựng gốc trong database
 * @returns {boolean}
 */
export const checkAnswer = (input, target) => {
    if (!input || !target) return false;
    const cleanedInput = input.toLowerCase().trim().replace(/\s+/g, " ");
    const validTargets = getValidTargets(target);
    return validTargets.includes(cleanedInput);
};

/**
 * Kiểm tra xem người dùng có đang gõ đúng hướng hay không (dùng cho gợi ý/đường ray đúng hướng).
 *
 * @param {string} input - Câu trả lời người dùng đang nhập dở
 * @param {string} target - Từ vựng gốc trong database
 * @returns {boolean}
 */
export const checkOnRightTrack = (input, target) => {
    if (!input) return false;
    const cleanedInput = input.toLowerCase().replace(/\s+/g, " ");
    if (cleanedInput.length === 0) return false;

    const validTargets = getValidTargets(target);
    return validTargets.some(validTarget => validTarget.startsWith(cleanedInput));
};

const norm = (s) => s.toLowerCase().trim().replace(/[.,;:!?'"‘’“”\-\(\)\[\]]/g, "").replace(/\s+/g, " ");

function getHintParts(answer, correct) {
    const ansWords = answer.trim().split(/\s+/).filter(Boolean);
    const corWords = norm(correct).split(" ").filter(Boolean);
    let okCount = 0;
    for (let i = 0; i < Math.min(ansWords.length, corWords.length); i++) {
        if (norm(ansWords[i]) === corWords[i]) okCount = i + 1;
        else {
            console.log("Mismatch at index", i);
            console.log("ansWords[i] =", ansWords[i], " -> norm =", norm(ansWords[i]));
            console.log("corWords[i] =", corWords[i]);
            break;
        }
    }
    const origWords = correct.trim().split(/\s+/).filter(Boolean);
    const correctPrefix = origWords.slice(0, okCount).join(" ");
    
    return { okCount, correctPrefix };
}

const correct = "This includes personal conversations like “I need to work on my free throw.” But it also includes reflections you have throughout the day, like “The gym is crowded tonight. I’ll come back tomorrow.”";

const user1 = "This includes personal conversations like I need to work on my free throw.";
console.log("User 1:", getHintParts(user1, correct));

const user2 = 'This includes personal conversations like "I';
console.log("User 2:", getHintParts(user2, correct));

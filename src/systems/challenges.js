/**
 * Challenges System
 * 
 * Pure functions for generating skill challenges:
 * - Reading word selection
 * - Math problem generation
 * - Writing/spelling word selection
 */

import {
    READING_WORDS,
    FUNNY_LONG_WORDS,
    DIFFICULTY_CONTENT,
    SPELLING_ITEMS,
    BASE_ASSETS,
    WRITING_WORD_INDEX,
    WRITING_DIFFICULTY_POOLS
} from '../constants/gameData';

// ===== Reading Challenges =====

/**
 * Get a reading word based on difficulty level
 */
export const getReadingWord = (difficulty) => {
    if (difficulty === 7) {
        return FUNNY_LONG_WORDS[Math.floor(Math.random() * FUNNY_LONG_WORDS.length)];
    }
    const config = DIFFICULTY_CONTENT.reading[difficulty] || DIFFICULTY_CONTENT.reading[1];
    const charLength = config.charLength || 3;
    const words = READING_WORDS[charLength] || READING_WORDS[3];
    return words[Math.floor(Math.random() * words.length)];
};

// ===== Math Challenges =====

/**
 * Generate a math problem based on difficulty tier
 */
export const generateMathProblem = (difficulty) => {
    const config = DIFFICULTY_CONTENT.math[difficulty] || DIFFICULTY_CONTENT.math[1];

    // Difficulty 7: Nightmare - Extremely complex multi-step PEMDAS expressions
    if (config.nightmare) {
        const nightmareProblems = [
            { question: '((25 - 10) × 4 + 18) ÷ 2 - 7', answer: '32' },
            { question: '(50 ÷ 5 + 3) × 6 - 28', answer: '50' },
            { question: '100 - (8 × 7 - 12) ÷ 2', answer: '78' },
            { question: '((15 + 9) × 3 - 20) ÷ 4', answer: '13' },
            { question: '(80 - 32) ÷ 6 + 15 × 2', answer: '38' },
            { question: '((40 ÷ 8 + 7) × 6 - 18) ÷ 3', answer: '18' },
            { question: '120 ÷ (12 - 2) + 8 × 5', answer: '52' },
            { question: '(18 + 22) × 2 - 35 ÷ 7', answer: '75' },
            { question: '((64 - 16) ÷ 4 + 9) × 3', answer: '63' },
            { question: '(100 - 45) ÷ 5 + 17 × 2', answer: '45' },
            { question: '((36 ÷ 6 + 8) × 4 - 20) ÷ 2', answer: '18' },
            { question: '(72 ÷ 9 - 3) × 7 + 15', answer: '50' },
            { question: '150 - ((20 + 10) × 3 - 15)', answer: '75' },
            { question: '((48 - 12) ÷ 9 + 11) × 5', answer: '75' },
            { question: '(90 ÷ 6 + 25) × 2 - 18', answer: '62' },
            { question: '((56 + 24) ÷ 8 - 3) × 6', answer: '42' },
            { question: '200 - (15 × 6 + 20) ÷ 2', answer: '145' },
            { question: '((32 + 8) × 3 - 40) ÷ 10', answer: '8' },
            { question: '(144 ÷ 12 + 16) × 2 - 25', answer: '31' },
            { question: '((75 - 30) ÷ 5 + 8) × 4', answer: '68' },
            { question: '(180 ÷ 9 - 10) × 6 + 24', answer: '84' },
            { question: '((100 + 50) ÷ 6 - 5) × 3', answer: '60' },
            { question: '(96 - 36) ÷ 12 + 9 × 7', answer: '68' },
            { question: '((84 ÷ 7 + 18) × 2 - 16) ÷ 4', answer: '11' },
            { question: '250 - ((18 + 12) × 4 - 25)', answer: '155' }
        ];
        const problem = nightmareProblems[Math.floor(Math.random() * nightmareProblems.length)];
        return { type: 'math', question: `${problem.question} = ?`, answer: problem.answer, isNightmare: true };
    }

    // Difficulty 6: PEMDAS/Order of Operations
    if (config.pemdas) {
        const pemdasProblems = [
            { question: '3 + 4 × 2', answer: '11' },
            { question: '(2 + 3) × 4', answer: '20' },
            { question: '10 - 2 × 3', answer: '4' },
            { question: '(5 + 5) ÷ 2', answer: '5' },
            { question: '8 ÷ 2 + 3', answer: '7' },
            { question: '2 × 3 + 4', answer: '10' },
            { question: '15 - 3 × 3', answer: '6' },
            { question: '(4 + 2) × 3', answer: '18' },
            { question: '12 ÷ 3 + 5', answer: '9' },
            { question: '2 + 6 ÷ 2', answer: '5' },
            { question: '(8 - 3) × 2', answer: '10' },
            { question: '4 × 2 - 1', answer: '7' }
        ];
        const problem = pemdasProblems[Math.floor(Math.random() * pemdasProblems.length)];
        return { type: 'math', question: `${problem.question} = ?`, answer: problem.answer, isPemdas: true };
    }

    // Difficulties 1-5: Standard operations
    const operations = config.operations || ['+'];
    const [minVal, maxVal] = config.range || [1, 9];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let a, b, question, answer;

    switch (operation) {
        case '+':
            a = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
            b = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
            question = `${a} + ${b} = ?`;
            answer = (a + b).toString();
            break;
        case '-':
            // Ensure positive result
            a = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
            b = Math.floor(Math.random() * a) + 1; // b is always less than or equal to a
            question = `${a} - ${b} = ?`;
            answer = (a - b).toString();
            break;
        case '*': {
            const [multMin, multMax] = config.multiplyRange || [1, 12];
            a = Math.floor(Math.random() * (multMax - multMin + 1)) + multMin;
            b = Math.floor(Math.random() * (multMax - multMin + 1)) + multMin;
            question = `${a} × ${b} = ?`;
            answer = (a * b).toString();
            break;
        }
        case '/': {
            // Ensure clean division
            const [divMin, divMax] = config.divisionRange || [1, 12];
            b = Math.floor(Math.random() * (divMax - divMin + 1)) + divMin;
            const quotient = Math.floor(Math.random() * 10) + 1;
            a = b * quotient;
            question = `${a} ÷ ${b} = ?`;
            answer = quotient.toString();
            break;
        }
        default:
            a = Math.floor(Math.random() * 9) + 1;
            b = Math.floor(Math.random() * 9) + 1;
            question = `${a} + ${b} = ?`;
            answer = (a + b).toString();
    }

    return { type: 'math', question, answer };
};

// ===== Writing/Spelling Challenges =====

/**
 * Get a word from the appropriate difficulty pool
 * Uses difficulty pools with overlapping character ranges to ensure variety
 */
export const getWordForDifficulty = (difficulty) => {
    // Map difficulty (1-7) to pool (1-5), with difficulties 6-7 using pool 5
    const poolNumber = Math.min(difficulty, 5);
    const pool = WRITING_DIFFICULTY_POOLS[poolNumber];

    if (!pool || pool.length === 0) {
        // Fallback to difficulty 1 pool if something goes wrong
        const fallbackPool = WRITING_DIFFICULTY_POOLS[1];
        const item = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
        return {
            word: item.word.toUpperCase(),
            displayName: item.displayName,
            image: item.imagePath
        };
    }

    // Select a random word from the pool
    const item = pool[Math.floor(Math.random() * pool.length)];
    return {
        word: item.word.toUpperCase(),
        displayName: item.displayName,
        image: item.imagePath
    };
};

/**
 * Legacy function: Get items for a target character length
 * This is kept for backward compatibility but now uses the comprehensive word index
 * Returns single item or combination of items
 */
export const getItemsForLength = (targetLength) => {
    // First, try to find a single item matching the length from the comprehensive index
    const matchingWords = WRITING_WORD_INDEX.filter(item => item.length === targetLength);
    if (matchingWords.length > 0) {
        const item = matchingWords[Math.floor(Math.random() * matchingWords.length)];
        return {
            items: [{ word: item.word.toUpperCase(), length: item.length }],
            combinedAnswer: item.word.toUpperCase(),
            images: [item.imagePath]
        };
    }

    // If no single item, try combinations
    // For simplicity, try combining two items
    for (let i = 0; i < SPELLING_ITEMS.length; i++) {
        for (let j = 0; j < SPELLING_ITEMS.length; j++) {
            if (i !== j) {
                const item1 = SPELLING_ITEMS[i];
                const item2 = SPELLING_ITEMS[j];
                if (item1.length + item2.length === targetLength) {
                    return {
                        items: [item1, item2],
                        combinedAnswer: item1.word + item2.word,
                        images: [
                            BASE_ASSETS.items[item1.word] || BASE_ASSETS.items['TNT'],
                            BASE_ASSETS.items[item2.word] || BASE_ASSETS.items['TNT']
                        ]
                    };
                }
            }
        }
    }

    // Fallback: return the closest single item from comprehensive index
    const sortedByLength = [...WRITING_WORD_INDEX].sort((a, b) =>
        Math.abs(a.length - targetLength) - Math.abs(b.length - targetLength)
    );
    const fallbackItem = sortedByLength[0];
    return {
        items: [{ word: fallbackItem.word.toUpperCase(), length: fallbackItem.length }],
        combinedAnswer: fallbackItem.word.toUpperCase(),
        images: [fallbackItem.imagePath]
    };
};

// ===== Challenge Generation =====

/**
 * Generate a challenge of the specified type at the given difficulty
 * Handles all skill challenge types including special cases
 */
export const generateChallenge = (type, difficulty) => {
    switch (type) {
        case 'math':
            return generateMathProblem(difficulty);

        case 'patterns':
            // Simon Says - no challenge data needed, handled in SkillCard
            return { type: 'patterns', question: "Simon Says!", answer: "WIN" };

        case 'reading': {
            const word = getReadingWord(difficulty);
            return { type: 'reading', question: word, answer: word };
        }

        case 'writing': {
            const wordData = getWordForDifficulty(difficulty);
            // Use displayName in uppercase for the answer (handles multi-word items with spaces)
            const answer = wordData.displayName.toUpperCase();
            return {
                type: 'writing',
                question: "Spell it!",
                answer,
                images: [wordData.image],
                displayName: wordData.displayName
            };
        }

        case 'memory':
            // No specific challenge data, handled in SkillCard
            return { type: 'memory', question: "Find Pairs!", answer: "WIN" };

        case 'cleaning':
        case 'manual':
        default:
            // Manual task
            return { type: 'manual', question: "Task Complete?", answer: "yes" };
    }
};

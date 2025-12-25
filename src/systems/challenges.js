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
 * All problems are algorithmically generated with clean integer answers
 * 
 * Difficulty tiers:
 * D1: (0-9) + (0-9) - single digit addition only
 * D2: (0-9) +/- (0-9) - adds subtraction
 * D3: (0-19) +/- (0-19) - expanded range
 * D4: (0-20) with multiplication - adds multiplication
 * D5: (0-50) with all operations - adds division, expanded range
 * D6: (0-20) with PEMDAS - order of operations with parentheses
 * D7: (50-99) with 3-step PEMDAS - nightmare complexity
 */
export const generateMathProblem = (difficulty) => {
    console.log(`[Challenges] Generating math problem for difficulty ${difficulty}`);
    const config = DIFFICULTY_CONTENT.math[difficulty] || DIFFICULTY_CONTENT.math[1];

    // Difficulty 7: Nightmare - Complex 3-step PEMDAS with large numbers
    if (config.nightmare) {
        return generateNightmareProblem();
    }

    // Difficulty 6: PEMDAS/Order of Operations
    if (config.pemdas) {
        return generatePemdasProblem();
    }

    // Difficulties 1-5: Standard operations
    return generateStandardProblem(config);
};

/**
 * Generate standard arithmetic problems (D1-D5)
 */
const generateStandardProblem = (config) => {
    const operations = config.operations || ['+'];
    const [minVal, maxVal] = config.range || [0, 9];
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
            b = Math.floor(Math.random() * (a + 1)); // b is 0 to a
            question = `${a} - ${b} = ?`;
            answer = (a - b).toString();
            break;
        case '*': {
            const [multMin, multMax] = config.multiplyRange || [1, 10];
            a = Math.floor(Math.random() * (multMax - multMin + 1)) + multMin;
            b = Math.floor(Math.random() * (multMax - multMin + 1)) + multMin;
            question = `${a} × ${b} = ?`;
            answer = (a * b).toString();
            break;
        }
        case '/': {
            // Ensure clean division with integer result
            const [divMin, divMax] = config.divisionRange || [1, 10];
            b = Math.floor(Math.random() * (divMax - divMin + 1)) + divMin;
            if (b === 0) b = 1; // Safety check
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

    console.log(`[Challenges] Generated: ${question} = ${answer}`);
    return { type: 'math', question, answer };
};

/**
 * Generate PEMDAS problems (D6) - 2-step order of operations
 * All problems guarantee integer answers
 */
const generatePemdasProblem = () => {
    // Choose a random pattern that ensures clean integer answers
    const patterns = [
        // Pattern: a + b × c
        () => {
            const b = Math.floor(Math.random() * 5) + 2; // 2-6
            const c = Math.floor(Math.random() * 5) + 2; // 2-6
            const a = Math.floor(Math.random() * 10) + 1; // 1-10
            return { question: `${a} + ${b} × ${c}`, answer: a + (b * c) };
        },
        // Pattern: a - b × c (ensure positive)
        () => {
            const b = Math.floor(Math.random() * 3) + 2; // 2-4
            const c = Math.floor(Math.random() * 3) + 2; // 2-4
            const product = b * c;
            const a = product + Math.floor(Math.random() * 10) + 1; // a > b*c
            return { question: `${a} - ${b} × ${c}`, answer: a - product };
        },
        // Pattern: (a + b) × c
        () => {
            const a = Math.floor(Math.random() * 5) + 1; // 1-5
            const b = Math.floor(Math.random() * 5) + 1; // 1-5
            const c = Math.floor(Math.random() * 4) + 2; // 2-5
            return { question: `(${a} + ${b}) × ${c}`, answer: (a + b) * c };
        },
        // Pattern: a × b + c
        () => {
            const a = Math.floor(Math.random() * 5) + 2; // 2-6
            const b = Math.floor(Math.random() * 5) + 2; // 2-6
            const c = Math.floor(Math.random() * 10) + 1; // 1-10
            return { question: `${a} × ${b} + ${c}`, answer: (a * b) + c };
        },
        // Pattern: a ÷ b + c (clean division)
        () => {
            const b = Math.floor(Math.random() * 4) + 2; // 2-5
            const quotient = Math.floor(Math.random() * 5) + 1; // 1-5
            const a = b * quotient;
            const c = Math.floor(Math.random() * 10) + 1; // 1-10
            return { question: `${a} ÷ ${b} + ${c}`, answer: quotient + c };
        },
        // Pattern: (a - b) × c
        () => {
            const a = Math.floor(Math.random() * 8) + 3; // 3-10
            const b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to a-1
            const c = Math.floor(Math.random() * 4) + 2; // 2-5
            return { question: `(${a} - ${b}) × ${c}`, answer: (a - b) * c };
        }
    ];

    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const result = pattern();
    console.log(`[Challenges] Generated PEMDAS: ${result.question} = ${result.answer}`);
    return { type: 'math', question: `${result.question} = ?`, answer: result.answer.toString(), isPemdas: true };
};

/**
 * Generate Nightmare problems (D7) - Complex 3-step PEMDAS with larger numbers
 * All problems guarantee integer answers
 */
const generateNightmareProblem = () => {
    // Complex patterns with 3+ operations and larger numbers
    const patterns = [
        // Pattern: ((a - b) × c + d) ÷ e
        () => {
            const a = Math.floor(Math.random() * 20) + 30; // 30-49
            const b = Math.floor(Math.random() * 15) + 5; // 5-19
            const c = Math.floor(Math.random() * 4) + 2; // 2-5
            const intermediate = (a - b) * c;
            // Make d so that (intermediate + d) is divisible by e
            const e = Math.floor(Math.random() * 4) + 2; // 2-5
            const finalResult = Math.floor(Math.random() * 20) + 10; // 10-29
            const d = (finalResult * e) - intermediate;
            if (d < 0) return patterns[1](); // Retry with different pattern
            return { question: `((${a} - ${b}) × ${c} + ${d}) ÷ ${e}`, answer: finalResult };
        },
        // Pattern: a - (b × c - d) ÷ e
        () => {
            const b = Math.floor(Math.random() * 6) + 4; // 4-9
            const c = Math.floor(Math.random() * 6) + 4; // 4-9
            const product = b * c;
            const e = Math.floor(Math.random() * 4) + 2; // 2-5
            // d must make (product - d) divisible by e
            const quotientResult = Math.floor(Math.random() * 8) + 2; // 2-9
            const d = product - (quotientResult * e);
            if (d < 0) return patterns[2](); // Retry with different pattern
            const a = Math.floor(Math.random() * 50) + 50; // 50-99
            return { question: `${a} - (${b} × ${c} - ${d}) ÷ ${e}`, answer: a - quotientResult };
        },
        // Pattern: (a ÷ b + c) × d - e
        () => {
            const b = Math.floor(Math.random() * 5) + 2; // 2-6
            const quotient = Math.floor(Math.random() * 8) + 2; // 2-9
            const a = b * quotient;
            const c = Math.floor(Math.random() * 10) + 5; // 5-14
            const d = Math.floor(Math.random() * 4) + 2; // 2-5
            const beforeSubtract = (quotient + c) * d;
            const e = Math.floor(Math.random() * 15) + 5; // 5-19
            if (beforeSubtract - e < 0) return patterns[0](); // Retry
            return { question: `(${a} ÷ ${b} + ${c}) × ${d} - ${e}`, answer: beforeSubtract - e };
        },
        // Pattern: a + b × c - d ÷ e
        () => {
            const b = Math.floor(Math.random() * 8) + 3; // 3-10
            const c = Math.floor(Math.random() * 8) + 3; // 3-10
            const e = Math.floor(Math.random() * 5) + 2; // 2-6
            const divResult = Math.floor(Math.random() * 8) + 1; // 1-8
            const d = e * divResult;
            const a = Math.floor(Math.random() * 30) + 20; // 20-49
            return { question: `${a} + ${b} × ${c} - ${d} ÷ ${e}`, answer: a + (b * c) - divResult };
        },
        // Pattern: ((a + b) × c - d) ÷ e
        () => {
            const e = Math.floor(Math.random() * 4) + 2; // 2-5
            const finalAnswer = Math.floor(Math.random() * 20) + 10; // 10-29
            const beforeDiv = finalAnswer * e;
            const c = Math.floor(Math.random() * 4) + 2; // 2-5
            // We need (a+b)*c - d = beforeDiv, so d = (a+b)*c - beforeDiv
            const sum = Math.floor(Math.random() * 15) + 10; // 10-24
            const a = Math.floor(Math.random() * (sum - 2)) + 1;
            const b = sum - a;
            const d = (sum * c) - beforeDiv;
            if (d < 0 || d > 100) return patterns[3](); // Retry
            return { question: `((${a} + ${b}) × ${c} - ${d}) ÷ ${e}`, answer: finalAnswer };
        }
    ];

    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const result = pattern();
    console.log(`[Challenges] Generated Nightmare: ${result.question} = ${result.answer}`);
    return { type: 'math', question: `${result.question} = ?`, answer: result.answer.toString(), isNightmare: true };
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

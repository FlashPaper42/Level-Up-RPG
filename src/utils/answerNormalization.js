import { HOMOPHONES } from '../constants/gameData';

export const normalizeAnswer = value => String(value ?? '')
    .toUpperCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const isAnswerCorrect = (value, expected) => {
    const normalizedValue = normalizeAnswer(value);
    const normalizedExpected = normalizeAnswer(expected);
    if (!normalizedValue || !normalizedExpected) return false;
    if (normalizedValue === normalizedExpected) return true;

    const spokenWords = normalizedValue.split(' ');
    const homophones = HOMOPHONES[normalizedExpected] || [];
    return spokenWords.some(word => homophones.some(homophone => normalizeAnswer(homophone) === word));
};

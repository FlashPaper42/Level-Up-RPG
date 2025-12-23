import React from 'react';
import ReadingSkillCard from './cards/ReadingSkillCard';
import MathSkillCard from './cards/MathSkillCard';
import WritingSkillCard from './cards/WritingSkillCard';
import CleaningSkillCard from './cards/CleaningSkillCard';
import MemorySkillCard from './cards/MemorySkillCard';
import PatternsSkillCard from './cards/PatternsSkillCard';

/**
 * SkillCardFactory - Dynamically selects the appropriate skill card component
 * based on the config.id. This enables modular skill cards while maintaining
 * a single entry point for the carousel.
 */
const SKILL_CARD_COMPONENTS = {
    reading: ReadingSkillCard,
    math: MathSkillCard,
    writing: WritingSkillCard,
    cleaning: CleaningSkillCard,
    memory: MemorySkillCard,
    patterns: PatternsSkillCard
};

const SkillCardFactory = ({ config, ...props }) => {
    const CardComponent = SKILL_CARD_COMPONENTS[config.id];

    if (!CardComponent) {
        console.warn(`No skill card component found for skill id: ${config.id}`);
        return null;
    }

    return <CardComponent config={config} {...props} />;
};

export default SkillCardFactory;

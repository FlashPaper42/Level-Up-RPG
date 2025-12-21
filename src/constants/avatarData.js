// Avatar data for profile pictures
// Using Unicode emojis for zero-asset implementation
// Avatar categories for organized selection
export const AVATAR_CATEGORIES = {
    animals: [
        { id: 'dog', emoji: '🐕', name: 'Dog' },
        { id: 'cat', emoji: '🐈', name: 'Cat' },
        { id: 'panda', emoji: '🐼', name: 'Panda' },
        { id: 'koala', emoji: '🐨', name: 'Koala' },
        { id: 'lion', emoji: '🦁', name: 'Lion' },
        { id: 'tiger', emoji: '🐯', name: 'Tiger' },
        { id: 'fox', emoji: '🦊', name: 'Fox' },
        { id: 'wolf', emoji: '🐺', name: 'Wolf' },
        { id: 'bear', emoji: '🐻', name: 'Bear' },
        { id: 'pig', emoji: '🐷', name: 'Pig' }
    ],
    people: [
        { id: 'person', emoji: '👤', name: 'Person' },
        { id: 'boy', emoji: '👦', name: 'Boy' },
        { id: 'girl', emoji: '👧', name: 'Girl' },
        { id: 'baby', emoji: '👶', name: 'Baby' },
        { id: 'superhero', emoji: '🦸', name: 'Superhero' }
    ],
    objects: [
        { id: 'star', emoji: '⭐', name: 'Star' },
        { id: 'fire', emoji: '🔥', name: 'Fire' },
        { id: 'gem', emoji: '💎', name: 'Gem' },
        { id: 'crown', emoji: '👑', name: 'Crown' },
        { id: 'trophy', emoji: '🏆', name: 'Trophy' },
        { id: 'rocket', emoji: '🚀', name: 'Rocket' },
        { id: 'pizza', emoji: '🍕', name: 'Pizza' },
        { id: 'donut', emoji: '🍩', name: 'Donut' },
        { id: 'robot', emoji: '🤖', name: 'Robot' }
    ]
};

// Flattened list for backwards compatibility
export const AVATAR_OPTIONS = [
    ...AVATAR_CATEGORIES.animals,
    ...AVATAR_CATEGORIES.people,
    ...AVATAR_CATEGORIES.objects
];

export const DEFAULT_AVATAR = '👤';

// Helper functions
export const getAvatarById = (id) => {
    return AVATAR_OPTIONS.find(avatar => avatar.id === id) || AVATAR_OPTIONS[0];
};

export const getAvatarEmoji = (id) => {
    const avatar = getAvatarById(id);
    return avatar ? avatar.emoji : DEFAULT_AVATAR;
};

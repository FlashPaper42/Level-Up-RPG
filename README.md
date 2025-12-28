# 🎮 Level Up RPG - Educational Adventure Game

**Level Up RPG** is an educational game designed to make learning fun for children ages 4-10 through engaging Minecraft-themed adventures. Kids battle mobs by completing educational challenges in reading, math, spelling, memory, and pattern recognition!

---

## 📥 Download & Play (Windows)

### Option 1: Download from Releases (Recommended)
1. Go to the [Releases page](https://github.com/FlashPaper42/Level-Up-RPG/releases)
2. Download the latest `LevelUp_RPG.exe` file
3. Double-click to launch — **no installation required!**
4. Perfect for sharing via USB drive

### Option 2: Download from GitHub Actions
1. Go to the [Actions tab](https://github.com/FlashPaper42/Level-Up-RPG/actions)
2. Click on the most recent successful workflow run (green checkmark)
3. Download the `LevelUpRPG-Windows-Portable` artifact
4. Extract and double-click to play

---

## 📚 How to Play

### Skill Cards
The game features 6 different skill cards, each with a unique educational challenge:

| Skill | Challenge Type | Description |
|-------|---------------|-------------|
| 📖 **Reading** | Voice Recognition | Speak words aloud to attack enemies |
| 🔢 **Math** | Type Answers | Solve math problems to power your attacks |
| ✍️ **Writing** | Spelling | Type Minecraft item/creature names |
| 🧠 **Memory** | Card Matching | Find matching pairs of cards |
| 🧩 **Patterns** | Sequence Memory | Repeat color patterns with axolotls |
| ✨ **Cleaning** | Real Life Chore | Complete real-world chores for rewards |

### Combat System
- **Click a skill card** to start a battle
- **Complete challenges** to deal damage to enemies
- **Choose actions**: Attack, Defend, Heal, or charge up for Special attacks
- **Watch the mob's next action** indicator to strategize
- **Defeat mobs** to earn XP and level up!

### Progression
- Gain XP by defeating mobs and completing challenges
- Level up to unlock harder difficulties (auto-scales every 20 levels)
- Earn badges to unlock cosmetic border effects
- Fight minibosses every 10 levels and bosses every 50 levels!

### Parent Tools
Access **Parent Tools** from the Settings menu to:
- Set difficulty levels for each skill (password protected)
- View age-appropriate recommendations for each difficulty
- Adjust reading words from 3-letter to 8-letter complexity
- Set math from simple addition to order of operations

---

## 🎯 Target Age Range

| Difficulty | Recommended Age | Example Content |
|------------|----------------|-----------------|
| Level 1 | Ages 4-5 | 3-letter words, single-digit addition |
| Level 2 | Ages 5-6 | 4-letter words, addition to 20 |
| Level 3 | Ages 6-7 | 5-letter words, subtraction |
| Level 4 | Ages 7-8 | 6-letter words, multiplication |
| Level 5 | Ages 8-9 | 7-letter words, all operations |
| Level 6 | Ages 9+ | 8-letter words, order of operations |
| Level 7 | For fun! | NIGHTMARE mode - extremely difficult! |

---

## 💻 Technical Requirements

### System Requirements
- **OS**: Windows 10 or later (64-bit)
- **RAM**: 4GB minimum
- **Storage**: ~200MB
- **Microphone**: Required for Reading skill (voice recognition)
- **Internet**: Required for voice recognition (Azure Speech Services)

### Microphone Setup
The Reading skill uses your microphone for speech recognition:
1. Allow microphone access when prompted
2. Click the microphone button to toggle listening
3. Speak words clearly into your microphone
4. For best results, use a quiet environment

---

## 🛠️ Development

### Run in Development Mode
```bash
npm install
npm run dev
```

### Build the Portable Executable
```bash
npm run electron:build
```
The built `.exe` will be in the `release/` folder.

### Project Structure
```
Level-Up-RPG/
├── src/                    # React source code
│   ├── components/         # UI components
│   ├── hooks/             # React hooks
│   ├── systems/           # Game systems (combat, leveling)
│   ├── contexts/          # React contexts
│   └── constants/         # Game data and config
├── electron/              # Electron main process
├── public/                # Static assets (images, sounds)
└── release/               # Built executables
```

---

## 📸 Screenshots

![Screenshot 1](screenshots/image1.png)

![Screenshot 2](screenshots/image2.png)

![Screenshot 3](screenshots/image3.png)

![Screenshot 4](screenshots/image4.png)

![Screenshot 5](screenshots/image5.png)

![Screenshot 6](screenshots/image6.png)

![Screenshot 7](screenshots/image7.png)

![Screenshot 8](screenshots/image8.png)

![Screenshot 9](screenshots/image9.png)

---

## 📄 License

This project is for educational purposes. All Minecraft-related imagery is used under fair use for educational content.

---

**Have fun learning!** 🎉
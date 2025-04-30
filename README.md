[![Take The Deal](/logo.png)](https://dalpalcarl.github.io/takethedeal/)

**Take The Deal** is a multiplayer party game inspired by *Deal or No Deal*. Designed for 3–10 players, this game blends strategy and chance into a single hilarious, unpredictable experience.

## 🍻 Game Overview

Unlike the original *Deal or No Deal*, your goal in *Take The Deal* is to **collect the lowest or highest number of penalties**. The game flows similarly to multiplayer party games like *Piccolo*, encouraging group interaction, competition, and lots of laughs.

## 🕹️ How to Play

### Game Setup
1. **Add Players**: Enter 3–10 player names. Click on names to remove them from the Player Setup List. Order will be randomly assigned at start.
2. **Select Modifier Setting** - Modifier types will be randomly picked at start:
   - **Low** – 3 total modifiers
   - **Medium** – 1/4 of total cases
   - **Volatile** – 1/2 of total cases
3. The game generates a penalty list and shuffles them into randomly numbered cases.

### Gameplay Flow
#### Round 0: Case Selection
- Each player chooses one case to keep until the end.

#### Rounds 1 to (ROUNDS - 1): Penalty Picking
- Each player takes turns choosing an unopened case and must accept the penalty inside.

#### Final Round: Take or Leave
- Players choose to either:
  - **Drink**: Open their own case and take the penalty.
  - **No Drink**: Put their case back into the pool for someone else to potentially claim.

##### Endgame Scenarios
- **Everyone Drinks**: The game ends with everyone taking their own penalties.
- **One No Drink**: That player must take their case.
- **Multiple No Drinks**: Remaining players take turns picking from the pool until one case remains.

## 🌀 Modifiers

Modifiers add unpredictable twists and can stack with penalties:

| Modifier        | Description                                                                 |
|----------------|-----------------------------------------------------------------------------|
| Double Penalty | Doubles the penalty value.                                                  |
| Triple Penalty | Triples the penalty value.                                                  |
| Give Out       | Give the penalty to another player.                                         |
| Choose Buddy   | Share your penalty with another player.                                     |
| Everyone Drinks| All players take the penalty.                                               |

Modifiers can be added to cases based on the selected game volatility level.

## 📊 Scoring

At the end of the game, players are ranked based on:
- **Most Penalties**
- **Least Penalties**
- **Max Penalty** (largest single penalty drawn)

This gives players multiple reasons to strategize — whether to go big or stay safe!

## ⚙️ Mechanics

- **Case States**:
  - `Unopened`: Available to pick.
  - `Selected`: Chosen but not opened.
  - `Opened`: Revealed and resolved.
- **Player States**:
  - `Active`: Player's turn.
  - `Waiting`: Awaiting their turn.
  - `Finished`: Player has resolved their case.

### Animation & Reveal
- When a case is revealed:
  - Case is centered and revealed after a 3-second animation.
  - Penalty and any modifier effects are displayed.
  - Player score is updated accordingly.

## 🧠 Game Logic Highlights

- Penalties are pre-generated and shuffled at game start.
- Total number of cases = `playerCount * rounds`.
- Final round introduces strategic complexity with the Take / Leave mechanic.
- Modifier rules are defined in JSON format, allowing for extensibility.

## 🛠 Modifier JSON Structure
```json
{
  "name": "double_penalty",
  "info": "Doubles the penalty drawn.",
  "player_selection": false,
  "update_score_function": "penalty *= 2"
}

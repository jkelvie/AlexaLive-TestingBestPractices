module.exports = Object.freeze({
  // define the application states to handle the different interactions
  STATES: {
    START: `_START`,
    QUIZ: `_QUIZ`,
    END: `_END`
  },

  // State variables
  STATE: 'SKILL_STATE',
  SPEAK: 'SPEAK',
  REPEAT: 'REPEAT',
  PREVIOUS_STATE: 'PREVIOUS_STATE',
  PREVIOUS_INTENT: 'PREVIOUS_INTENT',
  FIRST_RUN: 'FIRST_RUN',

  // Confirmation and dialog states
  CONFIRMED: 'CONFIRMED',
  NONE: 'NONE',
  DENIED: 'DENIED',
  STARTED: 'STARTED',
  COMPLETE: 'COMPLETE',
  IN_PROGRESS: 'IN PROGRESS',

  // Game variables
  CORRECT: 'CORRECT',
  WRONG: 'WRONG',
  ROUND: 'ROUND',
  PLAYERS: 'PLAYERS',
  CURRENT: 'CURRENT_PLAYER',
  SCORES: 'SCORES',
  RANK: 'RANK',
  CATEGORY: 'CATEGORY',
  QUESTION: 'QUESTION'
});

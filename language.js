'use strict';
const SKILL_NAME = 'Classic Movie Musts Quiz';
// const SKILL_NAME_DE = 'U.S. Universitätsfinder';

module.exports = Object.freeze({
  CORRECT: [
    'Booya',
    'All righty',
    'Bam',
    'Bazinga',
    'Bingo',
    'Boom',
    'Bravo',
    'Cha Ching',
    'Cheers',
    'Dynomite',
    'Hip hip hooray',
    'Hurrah',
    'Hurray',
    'Huzzah',
    'Oh dear.  Just kidding.  Hurray',
    'Kaboom',
    'Kaching',
    'Oh snap',
    'Phew',
    'Righto',
    'Way to go',
    'Well done',
    'Whee',
    'Woo hoo',
    'Yay',
    'Wowza',
    'Yowsa'
  ],
  WRONG: [
    'Argh',
    'Aw man',
    'Blarg',
    'Blast',
    'Boo',
    'Bummer',
    'Darn',
    "D'oh",
    'Dun dun dun',
    'Eek',
    'Honk',
    'Le sigh',
    'Mamma mia',
    'Oh boy',
    'Oh dear',
    'Oof',
    'Ouch',
    'Ruh roh',
    'Shucks',
    'Uh oh',
    'Wah wah',
    'Whoops a daisy',
    'Yikes'
  ],
  WELCOME: 'Welcome to the ' + SKILL_NAME + '! ',
  WELCOME_BACK: 'Welcome back to the' + SKILL_NAME + '! ',
  MAIN_MENU: 'You can start a game or hear your stats. What do you want to do?',
  QUIZSTART: 'OK.  The category is %%CATEGORY%%. %%PLAYER%% here is your question. ',
  NEXTQUESTION: '%%PLAYER%%. Your question is ',
  EXIT: 'Thank you for playing the ' + SKILL_NAME + "!  Let's play again soon!",
  REPROMPT: 'Which other state or capital would you like to know about?',
  ERROR_CANT: "It doesn't look like I can do that. ",
  ERROR_NOT_UNDERSTOOD: "I didn't quite get that. ",
  HELP:
    'This simple quiz game features multiplayer and single player trivia. You can select from three categories, People, Places, and Points in Time. '
});
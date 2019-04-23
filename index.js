/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */

/**
 * TO DO Errors:
 * 1. Not duplicating the language model when there are multiple locales – have an en_US and the en_CA is out of date
 * 2. Multi-part dialogs that not so randomly go to a different intent - Gamer profile
 * 3. Niche failure path that users rarely hit but it throws an error due to a typo - Multiplayer with three people
 * 4. Infinite loop on a decision due to a variable not being set - YesIntent for new game
 * 5. My favorite error: O.K. when used with a USState slot causes the slot to trigger and not Yes - Game question with dialog management
 */

/**
  * Intents
  * -----------
  * LaunchRequest
  * QuizStart - DM for category, number of players, and difficulty
  * Error
  * Help
  * Cancel/Stop
  * PlayerProfile
  */

// Use the ASK SDK for v2
const Alexa = require("ask-sdk");
const config = require("./config");
const constants = require("./constants");

const lang = require("./language");
const questions = require("./questions");
const helpers = require("./helpers");

/**
 * If this is the first start of the skill, grab the user's data from Dynamo and
 * set the session attributes to the persistent data.
 */
const GetUserDataInterceptor = {
  process(handlerInput) {
    console.log("Request: ", JSON.stringify(handlerInput));
    let attributes = handlerInput.attributesManager.getSessionAttributes();
    if (
      handlerInput.requestEnvelope.request.type === "LaunchRequest" ||
      !attributes.isInitialized
    ) {
      return new Promise((resolve, reject) => {
        handlerInput.attributesManager
          .getPersistentAttributes()
          .then(attributes => {
            if (attributes[constants.FIRST_RUN] === undefined) {
              // Set the starting attributes for new user
              attributes[constants.FIRST_RUN] = true;
              attributes[constants.RANK] = 0;
            }
            attributes.isInitialized = true;
            handlerInput.attributesManager.setSessionAttributes(attributes);
            resolve();
          })
          .catch(error => {
            reject(error);
          });
      });
    }
  },
};

/* INTENT HANDLERS */

/* COMMON HANDLERS */
/**
   * Handler for when a skill is launched. Delivers a response based on if a user is new or
   * returning.
   */
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "LaunchRequest" ||
      (handlerInput.requestEnvelope.request.type === "IntentRequest" &&
        handlerInput.requestEnvelope.request.intent.name === "AMAZON.StartOverIntent")
    );
  },
  handle(handlerInput) {
    console.info("LaunchRequest");
    let attributes = handlerInput.attributesManager.getSessionAttributes();

    if (attributes[constants.FIRST_RUN]) {
      attributes[constants.SPEAK] = lang["WELCOME"];
    } else {
      attributes[constants.SPEAK] = lang["WELCOME_BACK"];
    }
    attributes[constants.STATE] = constants.STATES.START;
    attributes[constants.REPEAT] = lang["MAIN_MENU"];
    attributes[constants.SPEAK] = attributes[constants.SPEAK] + attributes[constants.REPEAT];
    helpers.saveUser(handlerInput, attributes, "session");

    return handlerInput.responseBuilder
      .speak(attributes[constants.SPEAK])
      .reprompt(attributes[constants.SPEAK])
      .getResponse();
  },
};

/**
   * Repeats the previous speak and reprompt message from the session
   * */
const RepeatHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.RepeatIntent"
    );
  },
  handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return handlerInput.responseBuilder
      .speak(attributes[constants.SPEAK])
      .reprompt(attributes[constants.REPEAT])
      .getResponse();
  },
};

/**
   * Basic AMAZON.YesIntent handler for any action the skill takes that is based on
   * the STATE the user is in.
   */
const YesHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.YesIntent"
    );
  },
  handle(handlerInput) {
    let attributes = handlerInput.attributesManager.getSessionAttributes();
    console.info("Generic AMAZON.YesIntent");

    if (attributes[constants.STATE] === constants.STATES.INTRO) {
      attributes[constants.SPEAK] = lang["QUIZ_INTRO"];
    } else {
      attributes[constants.SPEAK] = lang["MAIN_MENU"];
    }

    return handlerInput.responseBuilder
      .speak(attributes[constants.SPEAK])
      .reprompt(attributes[constants.SPEAK])
      .getResponse();
  },
};

/**
   * Basic AMAZON.NoIntent handler for any action the skill takes that is based on
   * the STATE the user is in. Used for simple responses to route users out of
   * other states in the skill.
   */
const NoHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.NoIntent"
    );
  },
  handle(handlerInput) {
    let attributes = handlerInput.attributesManager.getSessionAttributes();
    console.info("Generic AMAZON.NoIntent");

    // Message is determined by the State of the user in the skill
    if (attributes[constants.STATE] === constants.STATES.INTRO) {
      return handlerInput.responseBuilder
        .speak(lang["EXIT"])
        .withShouldEndSession(true)
        .getResponse();
    } else {
      attributes[constants.SPEAK] = lang["MAIN_MENU"];
      attributes[constants.STATE] = constants.STATES.INTRO;
    }

    return handlerInput.responseBuilder
      .speak(attributes[constants.SPEAK])
      .reprompt(attributes[constants.SPEAK])
      .getResponse();
  },
};
/**
   * Central handler for the AMAZON.HelpIntent. Help messages are contextual based on
   * STATE/completed attributes or return the generic help if there is no
   * contextual response defined.
   */
const HelpHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    let attributes = handlerInput.attributesManager.getSessionAttributes();
    console.log(`${attributes[constants.STATE]}, AMAZON.HelpIntent`);

    switch (attributes[constants.STATE]) {
      case constants.STATES.INTRO: {
        attributes[constants.SPEAK] = lang["HELP"] + " " + lang["MAIN_MENU"];

        break;
      }
      default: {
        attributes[constants.SPEAK] = lang["HELP"] + " " + attributes[constants.SPEAK];
      }
    }

    return handlerInput.responseBuilder
      .speak(attributes[constants.SPEAK])
      .reprompt(attributes[constants.SPEAK])
      .getResponse();
  },
};
/**
   * Central handler for the AMAZON.StopIntent and AMAZON.CancelIntent.
   * Handler saves the session to DynamoDB and then sends a goodbye message.
   */
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name === "AMAZON.CancelIntent" ||
        handlerInput.requestEnvelope.request.intent.name === "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    console.info("Cancel and Stop Handler");

    let attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes = helpers.clearSessionAttributes(attributes);
    helpers.saveUser(handlerInput, attributes, "persistent");

    return handlerInput.responseBuilder
      .speak(lang["EXIT"])
      .withShouldEndSession(true)
      .getResponse();
  },
};
/**
   * Central handler for the SessionEndedRequest when the user says exit
   * or another session ending event occurs. Handler saves the session to
   * DynamoDB and exits.
   */
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    console.info(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    let attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes = helpers.clearSessionAttributes(attributes);

    helpers.saveUser(handlerInput, attributes, "persistent");

    return handlerInput.responseBuilder
      .addDirective(helpers.clearDynamicSlots())
      .withShouldEndSession(true)
      .getResponse();
  },
};
/**
   * Catch all for when the skill cannot find a canHandle() that returns true.
   */
const UnhandledIntentHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    console.info("Unhandled");
    let attributes = handlerInput.attributesManager.getSessionAttributes();

    if (attributes[constants.SPEAK]) {
      return handlerInput.responseBuilder
        .speak(lang["ERROR_CANT"] + attributes[constants.SPEAK])
        .reprompt(attributes[constants.SPEAK])
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(lang["ERROR_CANT"] + " " + lang["MAIN_MENU"])
        .reprompt(lang["MAIN_MENU"])
        .getResponse();
    }
  },
};
/**
   * Central error handler with contextual messaging.
   */
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`Error handled: ${error.message}`);
    console.info("Full error: ", error);
    let attributes = handlerInput.attributesManager.getSessionAttributes();

    let message = lang["ERROR_NOT_UNDERSTOOD"] + " " + attributes[constants.SPEAK];

    return handlerInput.responseBuilder
      .speak(message)
      .reprompt(attributes[constants.SPEAK])
      .getResponse();
  },
};

/* GAME HANDLERS */

/**
 * Starts the game. Solicits number of players and the category.
 */
const QuizHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name === "QuizIntent" ||
        (handlerInput.requestEnvelope.request.intent.name === "AMAZON.YesIntent" &&
          attributes[constants.STATE] === constants.STATES.END))
    );
  },
  handle(handlerInput) {
    let attributes = handlerInput.attributesManager.getSessionAttributes();
    console.log(`${attributes[constants.STATE]}, QuizIntent`);
    attributes[constants.STATE] = constants.STATES.QUIZ;

    const players = parseInt(helpers.getSlotResolutionId(handlerInput, "PLAYERS"));
    const category = helpers.getSlotResolution(handlerInput, "CATEGORY");
    let scores = [];
    let currentPlayer = 1;
    let round = 1;

    if (players) {
      while (scores.length < players) {
        scores.push(0);
      }
    }
    // Set up the first question
    const quizStart = players > 1 ? "Player " + currentPlayer + "," : " ";
    var question = questions[category.toUpperCase()][round - 1].question;

    attributes[constants.SPEAK] =
      lang["QUIZSTART"].replace("%%CATEGORY%%", category).replace("%%PLAYER%%", quizStart) +
      question;
    attributes[constants.REPEAT] = question;
    attributes[constants.SCORES] = scores;
    attributes[constants.CATEGORY] = category;
    attributes[constants.QUESTION] = questions[category.toUpperCase()][round - 1];
    attributes[constants.CURRENT] = currentPlayer;
    attributes[constants.PLAYERS] = players;

    helpers.saveUser(handlerInput, attributes, "session");

    return handlerInput.responseBuilder
      .speak(attributes[constants.SPEAK])
      .reprompt(attributes[constants.REPEAT])
      .getResponse();
  },
};

/**
 * Handles user answer and either ends the game or starts the next question.
 */
const QuizAnswerHandler = {
  canHandle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    return (
      attributes[constants.STATE] === constants.STATES.QUIZ &&
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      rhandlerInput.requestEnvelope.request.intent.name === "AnswerIntent"
    );
  },
  handle(handlerInput) {
    let attributes = handlerInput.attributesManager.getSessionAttributes();
    console.log(`${attributes[constants.STATE]}, AnswerIntent`);

    return handleUserGuess(handlerInput);
  },
};

/**
 * Checks if the user's answers matches the answer for the current question.
 *
 * @param {Object} handlerInput
 */
function handleUserGuess(handlerInput) {
  let message = "";
  let answer;
  let score;
  const win = 3;

  // Populate the attributes from the session
  let attributes = handlerInput.attributesManager.getSessionAttributes();
  answer = helpers.getSlotResolution(handlerInput, attributes[constants.CATEGORY].toUpperCase());

  // Current question being answered
  let question = attributes[constants.QUESTION].question;
  const correctAnswer = attributes[constants.QUESTION].answer;

  console.info("Full slot body: ", JSON.stringify(handlerInput.requestEnvelope.request.intent));
  console.info("User answer is: ", answer);
  console.info("Expected answer is: " + correctAnswer);

  if (answer === correctAnswer) {
    message = helpers.randomMessage(lang["CORRECT"]);
    score = attributes[constants.SCORES][attributes[constants.CURRENT - 1]] + 1;
  } else {
    message = helpers.randomMessage(lang["WRONG"]);
  }

  message = `<say-as interpret-as='interjection'>${message}! </say-as><break strength='strong'/>`;

  // Check if the game is over
  if (score >= win) {
    let gameEnd =
      attributes[constants.PLAYERS] > 1
        ? lang["WIN"].replace("%%PLAYER%%", `Player ${attributes[constants.CURRENT]} `)
        : lang["WIN"].replace("%%PLAYER%%", "You ");

    attributes[constants.SPEAK] = message + gameEnd;
    attributes[constants.REPEAT] = gameEnd;
    attributes[constants.STATE] = constants.STATES.END;
    attributes[constants.RANK] += win;

    helpers.saveUser(handlerInput, attributes, "session");

    return handlerInput.responseBuilder
      .speak(attributes[constants.SPEAK])
      .reprompt(attributes[constants.REPEAT])
      .getResponse();
  }

  // Otherwise keep playing til a player hits three points
  attributes[constants.CURRENT] =
    attributes[constants.CURRENT] == 3 ? attributes[constants.CURRENT] + 1 : 1;
  attributes[constants.ROUND] =
    attributes[constants.ROUND] == 3 ? 1 : (attributes[constants.ROUND] += 1);
  attributes[constants.QUESTION] =
    questions[attributes[constants.CATEGORY].toUpperCase()][round - 1];

  // Set up the question
  const quizStart = players > 1 ? "Player " + currentPlayer + "," : " ";
  question = attributes[constants.QUESTION].question;

  attributes[constants.SPEAK] =
    lang["NEXTQUESTION"].replace("%%CATEGORY%%", category).replace("%%PLAYER%%", quizStart) +
    question;
  attributes[constants.REPEAT] = question;

  helpers.saveUser(handlerInput, attributes, "session");

  return handlerInput.responseBuilder
    .speak(attributes[constants.SPEAK])
    .reprompt(attributes[constants.REPEAT])
    .getResponse();
}

function getCurrentScore(score, counter) {
  return `Your current score is ${score} out of ${counter}. `;
}

function getFinalScore(score, counter) {
  return `Your final score is ${score} out of ${counter}. `;
}

/**
 * SKILL
 */

exports.handler = Alexa.SkillBuilders
  .standard()
  .addRequestHandlers(
    LaunchRequestHandler,
    NoHandler,
    YesHandler,
    CancelAndStopIntentHandler,
    QuizHandler,
    QuizAnswerHandler,
    RepeatHandler,
    HelpHandler,
    SessionEndedRequestHandler,
    UnhandledIntentHandler
  )
  .addRequestInterceptors(GetUserDataInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withTableName(config.TABLE_NAME)
  .withAutoCreateTable(true)
  .withDynamoDbClient()
  .lambda();

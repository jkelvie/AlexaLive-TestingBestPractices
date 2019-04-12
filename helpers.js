const constants = require('./constants');

module.exports = {
  /**
   * Gets the root value of the slot even if synonyms are provided.
   *
   * @param {Object} handlerInput
   * @param {String} slot
   * @returns {String} The root value of the slot
   */
  getSlotResolution (handlerInput, slot) {
    const intent = handlerInput.requestEnvelope.request.intent;
    if (
      intent.slots[slot] &&
      intent.slots[slot].resolutions &&
      intent.slots[slot].resolutions.resolutionsPerAuthority[0]
    ) {
      const resolutions = intent.slots[slot].resolutions.resolutionsPerAuthority;

      for (let i = 0; i < resolutions.length; i++) {
        const authoritySource = resolutions[i];

        if (
          authoritySource.authority.includes('amzn1.er-authority.echo-sdk.') &&
          authoritySource.authority.includes(slot)
        ) {
          if (authoritySource.status.code === 'ER_SUCCESS_MATCH') {
            return authoritySource.values[0].value.name;
          }
        }
      }
      return false;
    } else if (intent.slots[slot].value && !intent.slots[slot].resolutions) {
      // For built-in intents that haven't been extended with ER
      return intent.slots[slot].value;
    }

    return false;
  },
  /**
   * Gets the ID for the slot for API search values that are not user friendly.
   *
   * @param {Object} handlerInput
   * @param {String} slot
   * @returns {String} The id for the given slot
   */
  getSlotResolutionId (handlerInput, slot) {
    const intent = handlerInput.requestEnvelope.request.intent;
    if (
      intent.slots[slot] &&
      intent.slots[slot].resolutions &&
      intent.slots[slot].resolutions.resolutionsPerAuthority[0]
    ) {
      const resolutions = intent.slots[slot].resolutions.resolutionsPerAuthority;

      for (let i = 0; i < resolutions.length; i++) {
        const authoritySource = resolutions[i];

        if (
          authoritySource.authority.includes('amzn1.er-authority.echo-sdk.') &&
          authoritySource.authority.includes(slot)
        ) {
          if (authoritySource.status.code === 'ER_SUCCESS_MATCH') {
            return authoritySource.values[0].value.id;
          }
        }
      }

      return false;
    } else if (intent.slots[slot].value && !intent.slots[slot].resolutions) {
      // For built-in intents that haven't been extended with ER
      return intent.slots[slot].value;
    }

    return false;
  },
  /**
   * Picks a random string from an array of strings
   *
   * @param {Array} messages
   */
  randomMessage (messages) {
    return messages[Math.floor(Math.random() * messages.length)];
  },
  /**
   * Saves the current attributes objects to either the session or to DynamoDB.
   *
   * @param {Object} handlerInput
   * @param {Object} attributes
   * @param {String} mode The save type of persistent or session
   */
  saveUser (handlerInput, attributes, mode) {
    if (mode === 'session') {
      handlerInput.attributesManager.setSessionAttributes(attributes);
    } else if (mode === 'persistent') {
      console.info('Saving to Dynamo: ', attributes);

      if (attributes[constants.FIRST_RUN]) {
        attributes[constants.FIRST_RUN] = false;
      }

      handlerInput.attributesManager.setSessionAttributes(attributes);
      handlerInput.attributesManager.setPersistentAttributes(attributes);
      return handlerInput.attributesManager.savePersistentAttributes();
    }
  },
  /**
   * Helper function to clear out temporary search attributes on
   * session exit.
   *
   * @param {Object} attributes
   */
  clearSessionAttributes (attributes) {
    let session = attributes;

    delete session['isInitialized'];

    return session;
  },

  /**
   * Concatenates two language strings together for contextual messaging.
   *
   * @param {Object} attributes
   * @param {String} promptMessage The variable name for the language string in language.js
   * @returns {String} The combined message to be spoken by Alexa
   */
  getPromptMessage (attributes, promptMessage) {
    let intro = ' ';
    if (attributes[constants.INTRO_MESSAGE]) {
      intro = attributes[constants.INTRO_MESSAGE];
      attributes[constants.PREVIOUS_INTRO_MESSAGE] = attributes[constants.INTRO_MESSAGE];
      attributes[constants.INTRO_MESSAGE] = promptMessage;
    }
    if (intro.length > 1) {
      intro = `${intro}<break time="500ms"/>`;
    }
    return `${intro} ${promptMessage}`;
  },
  getQuizQuestions (handlerInput, attributes) {
    const locale = handlerInput.requestEnvelope.request.locale.substring(0, 2);
    const level = attributes[constants.LEVEL] - 1;

    return eval(locale)['TRIVIA'][level]['QUESTIONS'];
  },
  /**
   * Checks to see if the Display interface is supported by the user's device.
   *
   * @param {Object} handlerInput
   * @return {Boolean}
   */
  hasDisplay (handlerInput) {
    return (
      handlerInput.requestEnvelope.context &&
      handlerInput.requestEnvelope.context.System &&
      handlerInput.requestEnvelope.context.System.device &&
      handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
      handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display
    );
  },
  supportsAPL (handlerInput) {
    return (
      handlerInput.requestEnvelope.context &&
      handlerInput.requestEnvelope.context.System &&
      handlerInput.requestEnvelope.context.System.device &&
      handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
      handlerInput.requestEnvelope.context.System.device.supportedInterfaces[
        'Alexa.Presentation.APL'
      ]
    );
  }
};

export function createLogger() {
  return {
    info: function (message) {
      this.messages.info.push(message);
      this.callCount.info++;
    },
    warn: function (message) {
      this.messages.warn.push(message);
      this.callCount.warn++;
    },
    fatal: function (message) {
      this.messages.fatal.push(message);
      this.callCount.fatal++;
    },
    messages: {
      info: [],
      warn: [],
      fatal: [],
    }, // Initialize messages object
    callCount: {
      info: 0,
      warn: 0,
      fatal: 0,
    },
  };
}

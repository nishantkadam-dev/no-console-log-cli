const noConsoleLog = {
  meta: {
    type: "suggestion",
    messages: {
      noConsoleLog: "Unexpected console.log — remove before production. Use a proper logger instead.",
    },
    schema: [],
  },

  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.name === "console" &&
          node.callee.property.name === "log"
        ) {
          context.report({
            node,
            messageId: "noConsoleLog",
          });
        }
      },
    };
  },
};

export default noConsoleLog;
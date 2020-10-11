module.exports = (sequelize, Sequelize) => {
  const ChatHistory = sequelize.define(
    "chathistory",
    {
      from: {
        type: Sequelize.STRING,
      },
      to: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      content: {
        type: Sequelize.STRING,
      },
      time: {
        type: Sequelize.STRING,
      },
      to_time: {
        type: Sequelize.STRING,
      },
      unread: {
        type: Sequelize.NUMBER,
      }
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  return ChatHistory;
};

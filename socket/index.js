const io = require('socket.io');
const db = require('../models');
const { QueryTypes } = require('sequelize');
const Users = db.users;
const ChatHistory = db.chathistory;
const sequelize = db.sequelize;

/**
 * Initialize when a connection is made
 * @param {SocketIO.Socket} socket
 */

function initSocket(client) {
  var signID;
  var target_id;

  client.on('sign-in', e => {
    signID = e.id;
    client.join(e.id);

    Users.findOne({
      where: {
        ID: e.id
      }
    })
      .then(data => {
        client.emit('sign-in-confirm', data.dataValues);
      })
      .catch(err => {
        client.emit('sign-error', err.message);
      });

    Users.update(
      {
        Active: 1
      },
      {
        where: { ID: e.id }
      }
    ).then(result => {
      client.broadcast.emit('user-active', e.id);
    });
  });

  client.on('load-chat-history', async e => {
    var selHistoryQuery = `SELECT * FROM chathistory WHERE (chathistory.from=${e.signedInUserId} AND chathistory.to=${e.targetUserId}) OR (chathistory.from=${e.targetUserId} AND chathistory.to=${e.signedInUserId})`;
    const records = await sequelize.query(selHistoryQuery, {
      type: QueryTypes.SELECT
    });
    client.emit('load-chat-history', records);

    var selDetailsQuery = `SELECT * FROM register WHERE (register.ID=${e.targetUserId})`;
    const detailsResult = await sequelize.query(selDetailsQuery, {
      type: QueryTypes.SELECT
    });
    client.emit('target-details', detailsResult[0]);

    var updateQuery = `UPDATE chathistory SET unread=0 WHERE (chathistory.from=${e.signedInUserId} AND chathistory.to=${e.targetUserId} AND chathistory.unread=1) OR (chathistory.from=${e.targetUserId} AND chathistory.to=${e.signedInUserId} AND chathistory.unread=1)`;
    await sequelize.query(updateQuery, {
      type: QueryTypes.SELECT
    });
  });

  client.on('message', e => {
    let targetId = e.to;
    let utcTimeString = new Date().toUTCString();

    client.emit('message', { ...e, time: utcTimeString });
    client.to(targetId).emit('message', { ...e, time: utcTimeString });

    chatHistory = new ChatHistory();
    chatHistory.to = e.to;
    chatHistory.from = e.from;
    chatHistory.time = utcTimeString;
    chatHistory.type = e.message.type;
    chatHistory.content = e.message.text;
    chatHistory.unread = 1;

    chatHistory.save((err, user) => {
      if (err) {
        client.emit('confirm-unread');
      } else {
        client.emit('confirm-read');
      }
    });
  });

  client.on('block-user', e => {
    Users.findOne({
      where: {
        ID: Number(e.signedInUserId)
      }
    })
      .then(data => {
        var blockListVal = data.dataValues.BlockList;
        if (
          data.dataValues.BlockList == null ||
          data.dataValues.BlockList == ''
        ) {
          blockListVal = e.targetUserId;
        } else {
          blockListVal = blockListVal + ',' + e.targetUserId;
        }

        Users.update(
          {
            BlockList: blockListVal
          },
          {
            where: { ID: Number(e.signedInUserId) }
          }
        )
          .then(result => {
            client.emit('block-user-success', e.targetUserId);
          })
          .catch(err => {
            client.emit('block-user-error', err.message);
          });
      })
      .catch(err => {
        client.emit('block-user-error', err.message);
      });
  });

  client.on('received-message-save', async e => {
    var updateQuery = `UPDATE chathistory SET unread=0 WHERE (chathistory.from=${e.from} AND chathistory.to=${e.to} AND chathistory.unread=1)`;
    await sequelize.query(updateQuery, {
      type: QueryTypes.SELECT
    });
  });

  client.on('disconnect', e => {
    Users.update(
      {
        Active: 0
      },
      {
        where: { ID: signID }
      }
    ).then(result => {
      client.broadcast.emit('in-active', signID);
    });
  });
}

module.exports = client => {
  io({ serveClient: false })
    .listen(client, { log: true })
    .on('connection', initSocket);
};

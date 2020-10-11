const jwt = require('jsonwebtoken');
const db = require('../../models');
const Users = db.users;
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;

const { QueryTypes } = require('sequelize');

module.exports = app => {
  app.get('/api/users', async (req, res) => {
    var blockQuery = `SELECT BlockList FROM register WHERE id=${req.query.id}`;
    const blockRecords = await sequelize.query(blockQuery, {
      type: QueryTypes.SELECT
    });
    var blockListStr = blockRecords[0].BlockList;

    var sqlQuery = `						
			SELECT aa.*, bb.sum_unread
			FROM (
				SELECT  *
				FROM    (
					SELECT  *, ROW_NUMBER() OVER (PARTITION BY uniId ORDER BY id DESC) rn
					FROM (
						SELECT a_register.Name, a_register.ID AS uniId, a_register.Gender, a_register.Avatar, a_register.Active, a_register.Country, a_register.Age, chathistory.*
						FROM (
							SELECT * 
							FROM register
							WHERE ID <> ${req.query.id} AND 
								register.ID NOT IN (${blockListStr ? blockListStr : req.query.id})
						) AS a_register
						LEFT JOIN chathistory
						ON (a_register.ID = chathistory.from AND chathistory.to=${
              req.query.id
            }) OR (a_register.ID = chathistory.to AND chathistory.from=${
      req.query.id
    } )
						ORDER BY chathistory.id ASC
						) AS temp
					) q
				WHERE   rn = 1
				ORDER BY
					uniId
				) AS aa
			LEFT JOIN (
				SELECT *, SUM(unread) AS sum_unread, MAX(time)
				FROM (
					SELECT b_register.Name, b_register.ID AS uniId, chathistory.*
					FROM (
						SELECT * 
						FROM register
						WHERE ID <> ${req.query.id} AND 
							register.ID NOT IN (${blockListStr ? blockListStr : req.query.id})
					) AS b_register
					LEFT JOIN chathistory
					ON b_register.ID = chathistory.from AND chathistory.to=${req.query.id}
					ORDER BY chathistory.id ASC
				) AS temp
				GROUP BY uniId
				ORDER BY id DESC
			) AS bb
			ON aa.uniId = bb.uniId
		`;
    const records = await sequelize.query(sqlQuery, {
      type: QueryTypes.SELECT
    });
    res.send({ users: records });
  });
};

var fs = require('fs');

const db = require('../../models');
const Users = db.users;

module.exports = app => {
  app.post('/api/profile/image', (req, res, next) => {
    let profileImage = req.files.file;
    let uploadDir = 'public/avatar/';

    let prevFileFullName = req.body.fileName;

    // Create directory for upload file when profile directory doesn't exist in public directory
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    // Delete prev file.
    if (fs.existsSync(`${uploadDir}${prevFileFullName}`)) {
      fs.unlink(`${uploadDir}${prevFileFullName}`, function () {
        // Get the file type of uploaded file.
        let fileType = profileImage.name.substring(
          profileImage.name.indexOf('.') + 1
        );

        profileImage.mv(`${uploadDir}${req.body.userId}.${fileType}`, function (
          err
        ) {
          if (err) {
            return res.status(500).send(err);
          }
          // When profile image's filetype changed, then should change token information
          Users.update(
            {
              Avatar: `${req.body.userId}.${fileType}`
            },
            {
              where: { ID: req.body.userId }
            }
          ).then(result => {
            return res.status(200).send({
              status: true,
              message: 'Updated profile image successfully',
              fileName: `${req.body.userId}.${fileType}`
            });
          });
        });
      });
    } else {
      console.log('File does not exist');
    }
  });
};

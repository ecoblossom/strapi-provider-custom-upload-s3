"use strict";

const AWS = require("aws-sdk");

module.exports = {
  init(config) {
    const S3 = new AWS.S3({
      apiVersion: "2006-03-01",
      ...config,
    });

    return {
      upload(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          const bucketPath = S3.config.bucketPath ?? "";
          const path = file.path ? `${bucketPath}${file.path}/` : "";
          let params = {
            Key: `${path}${file.hash}${file.ext}`,
            Body: Buffer.from(file.buffer, "binary"),
            ContentType: file.mime,
            ...customParams,
          };

          if (!S3.config.cdnUrl) {
            params.ACL = "public-read";
          }

          S3.upload(params, (err, data) => {
            if (err) {
              return reject(err);
            }

            if (S3.config.cdnUrl) {
              file.url = `${S3.config.cdnUrl}${data.Key}`;
            } else {
              file.url = data.Location;
            }

            resolve();
          });
        });
      },
      delete(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          const bucketPath = S3.config.bucketPath ?? "";
          const path = file.path ? `${bucketPath}${file.path}/` : "";
          S3.deleteObject(
            {
              Key: `${path}${file.hash}${file.ext}`,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              resolve();
            }
          );
        });
      },
    };
  },
};

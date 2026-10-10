// Shared JSON settings for every model:
// - send "id" instead of MongoDB's "_id" (the app already uses item.id)
// - never send "__v" or the password
const toJSON = {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.password;
    return ret;
  },
};

module.exports = toJSON;

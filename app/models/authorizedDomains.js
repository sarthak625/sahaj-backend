const mongoose = require('mongoose')

const AuthorizedDomainSchema = new mongoose.Schema(
  {
    domainList: {
      type: Array,
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)
module.exports = mongoose.model('AuthorizedDomain', AuthorizedDomainSchema)

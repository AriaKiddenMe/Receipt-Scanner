const bcrypt = require('bcryptjs')
const rounds = 10;

function hashing(password) {
    if ((password == null) || (typeof password != 'string')) {
        return false
    }
    password = password.trim()
    if ((password.length == 0)) {
        return false
    }
    const salt = bcrypt.genSaltSync(rounds)
    const hashCode = bcrypt.hashSync(password, salt)
    return hashCode
}
function verifyHash(input, storedHash) {
    if ((input == null) || ((typeof input != 'string'))) {
        return false
    }
    input = input.trim()
    if ((input.length == 0)) {
        return false
    }
    const result = bcrypt.compareSync(input, storedHash)
    return result
}
module.exports = {hashing, verifyHash}
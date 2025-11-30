// To enable hashing given a plaintext password and the generated hash value is then stored as part of the user record
// in the database when the account is first created. This is later used for verification purposes when the user is trying to
// login with an existing account. Ensures secure password storage. 

const bcrypt = require('bcryptjs')
const rounds = 10;

// Generates and returns a hash value based on the given plaintext password.
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
// Compares stored hashed password with the current hashed password for a user to verify login credentials.
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
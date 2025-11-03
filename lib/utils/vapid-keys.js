// Generate VAPID keys for push notifications
// Run this script once to generate your own VAPID keys

const webpush = require('web-push')

const vapidKeys = webpush.generateVAPIDKeys()

console.log('VAPID Keys Generated:')
console.log('Public Key:', vapidKeys.publicKey)
console.log('Private Key:', vapidKeys.privateKey)
console.log('')
console.log('Add these to your .env file:')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)

module.exports = vapidKeys
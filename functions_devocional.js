
const functions = require('firebase-functions');
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp();

exports.enviarDevocionalDiario = functions.region('southamerica-east1')
  .pubsub.schedule('0 7 * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    const db = admin.firestore();
    const usersSnap = await db.collection('users').where('notificationsEnabled', '==', true).get();
    
    const messages = [];
    usersSnap.forEach(doc => {
      const data = doc.data();
      if (data.fcmToken) {
        messages.push({
          token: data.fcmToken,
          notification: {
            title: 'Hora do seu devocional 🙏',
            body: 'Deus já preparou sua palavra de hoje.'
          },
          android: { priority: 'high' },
          apns: { payload: { aps: { sound: 'default' } } }
        });
      }
    });

    if (messages.length > 0) {
      return admin.messaging().sendAll(messages);
    }
    return null;
  });

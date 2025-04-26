
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const config = require('../config/config');
const httpStatus = require('http-status');
const logger = require('../config/logger');

// Google OAuth configuration
const googleConfig = {
  clientId: config.google.clientId,
  clientSecret: config.google.clientSecret,
  redirect: config.google.redirectUri
};

const defaultScope = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

function createConnection() {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
  );
}

function getConnectionUrl(auth) {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope
  });
}


const verifyGoogleToken = async (code) => {
    const oAuthClient = createConnection();
    
    try {
      // Exchange authorization code for tokens
      const { tokens } = await oAuthClient.getToken(code);
      const { id_token } = tokens;
      
      // Verify the ID token
      const client = new OAuth2Client(config.google.clientId);
      const ticket =  await client.verifyIdToken({
        idToken: id_token,
        audience: config.google.clientId
      });
      
      const payload = ticket.getPayload();    
      
      
      // Uncomment if you want to restrict to specific domain
      // if (payload.hd !== "schbang.com") {
      //   throw {
      //     statusCode: httpStatus.UNAUTHORIZED,
      //     message: "Unauthorized email domain"
      //   };
      // }
      
      return payload;
    } catch (error) {
      throw {
        statusCode: httpStatus.BAD_REQUEST,
        message: error.message || "Failed to verify Google token"
      };
    }
  };
  
  module.exports = {
    createConnection,
    getConnectionUrl,
    verifyGoogleToken
  };
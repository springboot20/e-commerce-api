const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const { StatusCodes } = require('http-status-codes');
const { ApiError } = require('../utils/api.error.js');
const expressHandlebars = require('nodemailer-express-handlebars');
const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule');

const OAuth2 = google.auth.OAuth2;

const isTokenExpired = (token) => {
  let currentTimestamps = Date.now();
  return currentTimestamps >= token.expiry_date;
};

const saveTokens = (tokens) => {
  const token_data = {
    access_token: tokens?.access_token,
    refresh_token: tokens?.refresh_token || process.env.REFRESH_TOKEN,
    expiry_date: tokens?.expiry_date,
  };

  fs.writeSync('tokens.json', JSON.stringify(token_data));
};

const loadTokens = () => {
  if (fs.existsSync('tokens.json')) {
    const token_data = fs.readFileSync('tokens.json');
    return JSON.parse(token_data);
  }
  return null;
};

const refreshAccessToken = async (refreshToken, clientId, clientSecret) => {
  const OAuth2Client = new OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground'
  );

  OAuth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  try {
    const { tokens } = await OAuth2Client.refreshAccessToken();
    OAuth2.setCredential(tokens);

    saveTokens(tokens);

    return tokens.access_token;
  } catch (error) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      `Error ocurred while refreshing access token: ${error}`
    );
  }
};

const createTransporter = async () => {
  const tokens = loadTokens();

  const OAuth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  OAuth2Client.setCredentials({
    access_token: tokens ? tokens?.access_token : process.env.ACCESS_TOKEN,
    refresh_token: tokens ? tokens?.refresh_token : process.env.REFRESH_TOKEN,
    token_type: 'Bearer',
    expiry_date: tokens ? tokens?.expiry_date : process.env.EXPIRY_DATE,
  });

  OAuth2Client.generateAuthUrl({
    scope: process.env.SCOPES,
    include_granted_scopes: true,
  });

  if (isTokenExpired(OAuth2Client.credentials)) {
    console.log('Access token expired Refreshing...');

    await refreshAccessToken(
      OAuth2Client.credentials.refresh_token,
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL,
      pass: process.env.EMAIL_HOST_PASSWORD,
      accessToken: OAuth2Client.credentials.access_token,
      refreshToken: OAuth2Client.credentials.refresh_token,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      pass: process.env.EMAIL_HOST_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // This line bypasses SSL certificate verification
    },
  });
};

const sendMail = async (email, subject, payload, template) => {
  try {
    const transporter = await createTransporter();

    transporter.use(
      'compile',
      expressHandlebars({
        viewEngine: {
          extName: '.hbs',
          partialsDir: path.resolve(__dirname, '../views/partials/'),
          layoutsDir: path.resolve(__dirname, '../views/layouts/'),
          defaultLayout: 'layout',
        },
        extName: '.hbs',
        viewPath: path.resolve(__dirname, '../views/partials/'),
      })
    );

    const options = () => {
      return {
        from: process.env.EMAIL,
        to: email,
        subject,
        template: template,
        context: payload,
      };
    };

    const info = await transporter.sendMail(options());
    console.log('Message Id : %s' + info.messageId);
  } catch (error) {
    throw error;
  }
};

module.exports = { sendMail };

schedule.scheduleJob('refresh oauth access token', 5 * 60 * 1000, async () => {
  try {
    await refreshAccessToken(
      process.env.REFRESH_TOKEN,
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET
    );
  } catch (error) {
    console.error('failed to refresh token during schedule job', error);
  }
});

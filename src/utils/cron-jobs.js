// Lib Imports.
import cron from 'node-cron';
import { Op } from 'sequelize';

// Local Imports.
import Registration from '../models/registration.model.js';
import User from '../models/user.model.js';

// Functions.
async function midnightDatabaseCleanup() {
  // Delete verified (but abandoned) registrations.
  try {
    await Registration.destroy({
      where: {
        isVerified: true,
        createdAt: {
          [Op.lte]: new Date(Date.now() - 60 * 60 * 1000),
        },
      },
    });
    console.log('\nRegistration Cleanup Cron Job Done.\n');
  } catch (error) {
    console.log('\nRegistration Cleanup Cron Job Error: \n', error);
  }

  // Clean user model of older action state.
  try {
    await User.update(
      {
        otp: null,
        otpExpires: null,
        otpAction: null,
        newEmail: null,
        canChangePassword: false,
      },
      {
        where: {
          otpExpires: {
            [Op.lt]: new Date(),
          },
        },
      }
    );
    console.log('\nUser Cleanup Cron Job Done.\n');
  } catch (error) {
    console.log('\nUser Cleanup Cron Job Error: \n', error);
  }
}

// Cron Jobs.
cron.schedule('0 0 * * *', midnightDatabaseCleanup);

import cron from 'node-cron';
import { carryForwardLeaves, createMonthly } from '../controllers/cron';

// Run every year - 1 Jan
cron.schedule('0 0 1 1 *', () => {
  carryForwardLeaves();
});

// Run every month
cron.schedule('0 0 1 * *', () => {
  createMonthly();
});

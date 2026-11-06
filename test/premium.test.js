const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const PremiumCode = require('../src/schema/premiumCode');
const PremiumSubscription = require('../src/schema/premiumSubscription');
const { isUserPremium, isGuildPremium, redeemPremiumCode } = require('../src/utils/premiumCheck');

test('Premium system lifecycle', async (t) => {
  // Connect in-memory / local mongo or mock if offline
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/together';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
  } catch (err) {
    t.diagnostic('Skipping live db test if local mongo is offline');
    return;
  }

  const testCode = 'TOGETHER-PREM-TEST-UNIT';
  const testUserId = '999888777666';

  // Cleanup test docs
  await PremiumCode.deleteOne({ code: testCode });
  await PremiumSubscription.deleteOne({ targetId: testUserId });

  // 1. Create a User Monthly code
  await PremiumCode.create({
    code: testCode,
    plan: 'user_monthly',
    scope: 'user',
    durationDays: 30,
    purchasedBy: testUserId,
    purchasedByName: 'TestBuyer',
    paymentId: 'pay_test_123',
    amountPaid: 149,
    currency: 'INR',
    invoiceId: 'INV-TEST-001'
  });

  // 2. Check initial premium is false
  const initialCheck = await isUserPremium(testUserId);
  assert.equal(initialCheck.isPremium, false);

  // 3. Redeem the code
  const redeemResult = await redeemPremiumCode(testCode, testUserId, 'TestBuyer');
  assert.equal(redeemResult.success, true);
  assert.equal(redeemResult.scope, 'user');
  assert.ok(redeemResult.expiresAt > Date.now());

  // 4. Check user is now premium
  const activeCheck = await isUserPremium(testUserId);
  assert.equal(activeCheck.isPremium, true);
  assert.equal(activeCheck.subscription.plan, 'user_monthly');

  // 5. Verify code cannot be redeemed twice
  await assert.rejects(
    async () => {
      await redeemPremiumCode(testCode, testUserId, 'TestBuyer');
    },
    /already been redeemed/i
  );

  // Cleanup
  await PremiumCode.deleteOne({ code: testCode });
  await PremiumSubscription.deleteOne({ targetId: testUserId });
  await mongoose.disconnect();
});


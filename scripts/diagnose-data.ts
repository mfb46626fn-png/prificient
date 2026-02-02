// Diagnostic script - uses fetch to call our own API instead of direct DB access
async function diagnoseData() {
    console.log('\n========================================');
    console.log('🔍 PRIFICIENT DATA DIAGNOSIS TOOL');
    console.log('========================================\n');

    // We'll need to create a simple API endpoint for this
    // For now, let's check the existing diagnosis endpoint

    console.log('📊 Checking diagnosis endpoint...');
    console.log('Please run this in the browser console on the prificient.com site while logged in:\n');

    console.log(`
fetch('/api/onboarding/diagnosis')
  .then(r => r.json())
  .then(d => {
    console.log('Revenue:', d.illusion?.revenue);
    console.log('Net Profit:', d.illusion?.realProfit);
    console.log('Sales Count:', d.illusion?.salesCount);
    console.log('Date Range:', d.dateRange);
    console.log('Has Enough Data:', d.hasEnoughData);
    console.log('Full Report:', JSON.stringify(d, null, 2));
  });
    `);
}

diagnoseData();

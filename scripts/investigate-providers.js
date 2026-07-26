const fs = require('fs');
const path = require('path');

// Mock the CandidatePaperProvider to log raw data
async function investigate() {
  const { CandidatePaperProvider } = require('./src/services/evidence/CandidatePaperProvider');
  const provider = new CandidatePaperProvider();
  
  const testText = `Lassa fever remains a major public health concern in West Africa, causing an estimated 100,000 to 300,000 infections and over 5,000 deaths annually.`;
  
  console.log('🔍 Investigating Provider Responses...\n');
  
  const results = await provider.getCandidates(testText);
  
  // Log raw provider data
  console.log('📊 RAW PROVIDER DATA:');
  console.log('=====================');
  
  // Check each provider's raw data
  if (results.federationMetrics) {
    console.log('\n📈 METRICS:');
    console.log(JSON.stringify(results.federationMetrics, null, 2));
  }
  
  // Log first paper from each provider
  const providers = ['CORE', 'OpenAlex', 'Unpaywall', 'Crossref'];
  providers.forEach(p => {
    const papers = results.filter(r => r.provider === p);
    if (papers.length > 0) {
      console.log(`\n📄 ${p} PAPER (first):`);
      console.log(`  Title: ${papers[0].title}`);
      console.log(`  Abstract: ${(papers[0].abstract || '').substring(0, 200)}...`);
      console.log(`  Concepts: ${(papers[0].concepts || []).join(', ')}`);
      console.log(`  Keywords: ${(papers[0].keywords || []).join(', ')}`);
    }
  });
  
  // Check for corruption patterns
  console.log('\n🔍 CORRUPTION CHECK:');
  console.log('===================');
  
  results.forEach((p, i) => {
    const title = p.title || '';
    const abstract = p.abstract || '';
    
    // Check for garbled text patterns
    const garbledPatterns = [
      /aavdriplig/,
      /bstsele/,
      /classimble/,
      /[A-Za-z]{10,}/
    ];
    
    let hasGarbled = false;
    garbledPatterns.forEach(pattern => {
      if (pattern.test(title) || pattern.test(abstract)) {
        hasGarbled = true;
      }
    });
    
    if (hasGarbled) {
      console.log(`⚠️ Paper ${i+1} (${p.provider}) has garbled text:`);
      console.log(`   Title: ${title.substring(0, 100)}`);
    }
  });
}

investigate().catch(console.error);

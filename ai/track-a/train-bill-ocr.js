/**
 * Bill OCR Training Script
 * Analyzes test bills to extract patterns and build optimized extraction rules
 */

const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const TEST_BILLS_DIR = path.join(__dirname, 'test_bills');
const OUTPUT_FILE = path.join(__dirname, 'trained-patterns.json');

// Get all image files
function getImageFiles() {
  const files = fs.readdirSync(TEST_BILLS_DIR);
  return files.filter(f => /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(f));
}

// Run OCR on an image
async function ocrImage(imagePath) {
  console.log(`\n📸 Processing: ${path.basename(imagePath)}`);
  console.log('   Running OCR...');
  
  const result = await Tesseract.recognize(imagePath, 'eng', {
    logger: m => {
      if (m.status === 'recognizing text') {
        process.stdout.write(`\r   Progress: ${Math.round(m.progress * 100)}%`);
      }
    }
  });
  
  console.log('\n   ✅ OCR Complete');
  return result.data.text;
}

// Extract all numbers from text
function extractAllNumbers(text) {
  const numbers = [];
  
  // Pattern 1: Numbers with commas (Indian format)
  const commaPattern = /(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)/g;
  let match;
  while ((match = commaPattern.exec(text)) !== null) {
    const value = parseFloat(match[1].replace(/,/g, ''));
    if (value >= 10 && value < 100000000) {
      numbers.push({ value, raw: match[1], index: match.index });
    }
  }
  
  return numbers.sort((a, b) => b.value - a.value);
}

// Find lines containing key patterns
function findKeyLines(text) {
  const lines = text.split('\n');
  const keyLines = [];
  
  const patterns = [
    { name: 'outstanding', regex: /outstanding/i },
    { name: 'final', regex: /final/i },
    { name: 'total', regex: /total/i },
    { name: 'amount', regex: /amount/i },
    { name: 'payable', regex: /payable/i },
    { name: 'balance', regex: /balance/i },
    { name: 'due', regex: /due/i },
    { name: 'net', regex: /net/i },
    { name: 'grand', regex: /grand/i },
    { name: 'bill', regex: /bill/i },
  ];
  
  lines.forEach((line, idx) => {
    patterns.forEach(p => {
      if (p.regex.test(line)) {
        const numbers = line.match(/[\d,]+(?:\.\d{1,2})?/g) || [];
        keyLines.push({
          lineNum: idx,
          pattern: p.name,
          line: line.trim(),
          numbers: numbers.map(n => parseFloat(n.replace(/,/g, '')))
        });
      }
    });
  });
  
  return keyLines;
}

// Interactive prompt
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// Main training function
async function trainOnBills() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('           BILL OCR TRAINING SCRIPT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\nThis script will analyze your test bills to learn patterns.\n');
  
  const imageFiles = getImageFiles();
  console.log(`Found ${imageFiles.length} bill images to process.\n`);
  
  const trainingData = [];
  
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const imagePath = path.join(TEST_BILLS_DIR, file);
    
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📄 Bill ${i + 1}/${imageFiles.length}: ${file}`);
    console.log('─'.repeat(60));
    
    // Run OCR
    const ocrText = await ocrImage(imagePath);
    
    // Show last 30 lines (usually contains total)
    const lines = ocrText.split('\n').filter(l => l.trim());
    console.log('\n📝 Last 20 lines of OCR text:');
    console.log('─'.repeat(40));
    lines.slice(-20).forEach((line, idx) => {
      console.log(`  ${lines.length - 20 + idx + 1}: ${line}`);
    });
    console.log('─'.repeat(40));
    
    // Extract key information
    const allNumbers = extractAllNumbers(ocrText);
    const keyLines = findKeyLines(ocrText);
    
    console.log('\n💰 Top 10 amounts found:');
    allNumbers.slice(0, 10).forEach((n, idx) => {
      console.log(`   ${idx + 1}. ₹${n.value.toLocaleString()} (raw: "${n.raw}")`);
    });
    
    console.log('\n🔑 Key lines found:');
    keyLines.slice(0, 8).forEach(kl => {
      console.log(`   [${kl.pattern}] "${kl.line.substring(0, 60)}..." → ${kl.numbers.join(', ')}`);
    });
    
    // Ask for correct amount
    const correctAmountStr = await prompt('\n❓ Enter the CORRECT final bill amount (or press Enter to skip): ');
    
    if (correctAmountStr.trim()) {
      const correctAmount = parseFloat(correctAmountStr.replace(/,/g, ''));
      
      // Find which line contains the correct amount
      let matchingLine = null;
      for (const kl of keyLines) {
        if (kl.numbers.includes(correctAmount)) {
          matchingLine = kl;
          break;
        }
      }
      
      trainingData.push({
        file,
        correctAmount,
        matchingPattern: matchingLine?.pattern || null,
        matchingLine: matchingLine?.line || null,
        allPatterns: keyLines.map(kl => kl.pattern),
        topAmounts: allNumbers.slice(0, 5).map(n => n.value),
        ocrTextLength: ocrText.length,
        lineCount: lines.length
      });
      
      console.log(`✅ Recorded: ₹${correctAmount.toLocaleString()}`);
      if (matchingLine) {
        console.log(`   Pattern: "${matchingLine.pattern}" → "${matchingLine.line.substring(0, 50)}..."`);
      }
    } else {
      console.log('⏭️  Skipped');
    }
  }
  
  // Analyze patterns
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('           TRAINING ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════');
  
  const patternCounts = {};
  trainingData.forEach(td => {
    if (td.matchingPattern) {
      patternCounts[td.matchingPattern] = (patternCounts[td.matchingPattern] || 0) + 1;
    }
  });
  
  console.log('\n📊 Pattern frequency for correct amounts:');
  Object.entries(patternCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([pattern, count]) => {
      console.log(`   ${pattern}: ${count} times (${Math.round(count / trainingData.length * 100)}%)`);
    });
  
  // Save training data
  const output = {
    trainedAt: new Date().toISOString(),
    billsProcessed: trainingData.length,
    patternPriority: Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([p]) => p),
    trainingData
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n💾 Training data saved to: ${OUTPUT_FILE}`);
  
  // Generate optimized extraction code
  generateOptimizedCode(output);
  
  console.log('\n✅ Training complete!');
}

// Generate optimized extraction code based on training
function generateOptimizedCode(trainingOutput) {
  const priority = trainingOutput.patternPriority;
  
  console.log('\n📝 Recommended extraction priority order:');
  priority.forEach((p, idx) => {
    console.log(`   ${idx + 1}. "${p}"`);
  });
  
  // Create the optimized extraction function
  const optimizedCode = `
// AUTO-GENERATED from training on ${trainingOutput.billsProcessed} bills
// Generated at: ${trainingOutput.trainedAt}
// Pattern priority: ${priority.join(' > ')}

const TRAINED_PATTERNS = ${JSON.stringify(priority)};

function findBillAmountTrained(text) {
  const lines = text.split('\\n');
  
  // Try patterns in trained priority order
  for (const pattern of TRAINED_PATTERNS) {
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (new RegExp(pattern, 'i').test(line)) {
        const numbers = line.match(/[\\d,]+(?:\\.\\d{1,2})?/g);
        if (numbers) {
          const value = parseFloat(numbers[numbers.length - 1].replace(/,/g, ''));
          if (value >= 10) {
            return { amount: value, pattern, line: line.trim() };
          }
        }
      }
    }
  }
  
  return { amount: null, pattern: null, line: null };
}
`;

  const codeFile = path.join(__dirname, 'trained-extractor.js');
  fs.writeFileSync(codeFile, optimizedCode);
  console.log(`\n📄 Optimized extractor saved to: ${codeFile}`);
}

// Run training
trainOnBills().catch(console.error);

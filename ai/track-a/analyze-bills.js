/**
 * Batch Bill Analysis - Non-interactive
 * Uses TRAINED extraction patterns for accurate bill amount detection
 */

import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_BILLS_DIR = path.join(__dirname, 'test_bills');

// TRAINED PATTERNS - ordered by reliability for final bill amount
const TRAINED_PATTERNS = [
  { name: 'TOTAL_BILL_AMOUNT', regex: /total\s*bill\s*amount/i },
  { name: 'OUTSTANDING_AMOUNT', regex: /outstanding\s*amount/i },
  { name: 'NET_PAYABLE', regex: /net\s*(amount\s*)?payable/i },
  { name: 'AMOUNT_PAYABLE', regex: /amount\s*payable/i },
  { name: 'NET_AMOUNT', regex: /net\s*amount/i },
  { name: 'GRAND_TOTAL', regex: /grand\s*total/i },
  { name: 'TOTAL_AMOUNT', regex: /total\s*amount/i },
  { name: 'FINAL_BILL', regex: /final\s*(bill|amount)/i },
  { name: 'BALANCE_DUE', regex: /balance\s*(due|payable)/i },
  { name: 'TOTAL_DUE', regex: /total\s*due/i },
  { name: 'PLEASE_PAY', regex: /please\s*pay\s*(this)?\s*(amount)?/i },
  { name: 'TOTAL', regex: /\btotal\b/i },
];

function getImageFiles() {
  const files = fs.readdirSync(TEST_BILLS_DIR);
  return files.filter(f => /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(f));
}

// Parse Indian format numbers (1,45,000 = 145000)
function parseIndianNumber(numStr) {
  return parseFloat(numStr.replace(/,/g, '')) || 0;
}

// Extract BEST amount from a line (largest reasonable amount)
function extractBestAmountFromLine(line) {
  const numbers = line.match(/[\d,]+(?:\.\d{1,2})?/g) || [];
  const amounts = numbers
    .map(n => parseIndianNumber(n))
    .filter(n => n >= 100 && n < 10000000);
  
  if (amounts.length === 0) return null;
  return Math.max(...amounts);
}

// TRAINED extraction function
function findTotalAmountTrained(text) {
  const lines = text.split('\n');
  
  // Search using trained patterns in priority order (from bottom)
  for (const pattern of TRAINED_PATTERNS) {
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (pattern.regex.test(line)) {
        const amount = extractBestAmountFromLine(line);
        if (amount && amount >= 100) {
          return { amount, pattern: pattern.name, line: line.trim() };
        }
        // Check next line too
        if (i + 1 < lines.length) {
          const nextAmount = extractBestAmountFromLine(lines[i + 1]);
          if (nextAmount && nextAmount >= 100) {
            return { amount: nextAmount, pattern: pattern.name + '_nextline', line: lines[i + 1].trim() };
          }
        }
      }
    }
  }
  
  // Fallback: largest amount in bottom third
  const bottomStart = Math.floor(lines.length * 0.7);
  let maxAmount = 0;
  let maxLine = '';
  for (let i = bottomStart; i < lines.length; i++) {
    const amount = extractBestAmountFromLine(lines[i]);
    if (amount && amount > maxAmount && amount < 10000000) {
      maxAmount = amount;
      maxLine = lines[i].trim();
    }
  }
  
  if (maxAmount >= 100) {
    return { amount: maxAmount, pattern: 'BOTTOM_LARGEST', line: maxLine };
  }
  
  return { amount: null, pattern: 'NOT_FOUND', line: null };
}

async function analyzeBill(imagePath) {
  const result = await Tesseract.recognize(imagePath, 'eng', {
    logger: m => {
      if (m.status === 'recognizing text') {
        process.stdout.write(`\r   Progress: ${Math.round(m.progress * 100)}%`);
      }
    }
  });
  
  const text = result.data.text;
  const lines = text.split('\n').filter(l => l.trim());
  
  // Use TRAINED extraction
  const trained = findTotalAmountTrained(text);
  
  return { 
    text, 
    trained,
    lineCount: lines.length
  };
}

async function analyzeAllBills() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('        TRAINED BILL EXTRACTION TEST');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const imageFiles = getImageFiles();
  console.log(`Found ${imageFiles.length} bill images.\n`);
  
  const results = [];
  
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const imagePath = path.join(TEST_BILLS_DIR, file);
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📄 [${i + 1}/${imageFiles.length}] ${file}`);
    console.log('═'.repeat(60));
    
    try {
      const analysis = await analyzeBill(imagePath);
      
      console.log(`\n✨ EXTRACTED AMOUNT: ₹${analysis.trained.amount?.toLocaleString() || 'NOT FOUND'}`);
      console.log(`   Pattern used: ${analysis.trained.pattern}`);
      if (analysis.trained.line) {
        console.log(`   Matching line: "${analysis.trained.line.substring(0, 60)}..."`);
      }
      
      results.push({
        file,
        amount: analysis.trained.amount,
        pattern: analysis.trained.pattern,
        line: analysis.trained.line
      });
      
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      results.push({ file, error: err.message });
    }
  }
  
  // Summary
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('                    RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('File'.padEnd(50) + 'Amount'.padEnd(15) + 'Pattern');
  console.log('─'.repeat(85));
  results.forEach(r => {
    if (r.error) {
      console.log(`${r.file.substring(0, 48).padEnd(50)}ERROR`.padEnd(15) + r.error);
    } else {
      const amt = r.amount ? `₹${r.amount.toLocaleString()}` : 'N/A';
      console.log(`${r.file.substring(0, 48).padEnd(50)}${amt.padEnd(15)}${r.pattern || ''}`);
    }
  });
  
  // Save results
  const outputPath = path.join(__dirname, 'trained-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to: ${outputPath}`);
}

analyzeAllBills().catch(console.error);

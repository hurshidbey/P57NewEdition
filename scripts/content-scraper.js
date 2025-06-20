#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs/promises';

async function scrapeContent(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    const content = await page.evaluate(() => {
      // Get title
      const title = document.title;
      
      // Get all visible text content
      const allText = document.body.innerText;
      
      // Try to extract structured content
      const sections = [];
      
      // Look for main content containers
      const containers = document.querySelectorAll('div[class*="t-container"], div[class*="t-col"], div[class*="t-text"]');
      
      containers.forEach((container, index) => {
        const text = container.innerText?.trim();
        if (text && text.length > 10) {
          sections.push({
            index,
            text,
            classes: container.className
          });
        }
      });
      
      // Get links
      const links = Array.from(document.querySelectorAll('a[href]')).map(link => ({
        text: link.innerText.trim(),
        href: link.href
      })).filter(link => link.text);
      
      return {
        title,
        allText,
        sections,
        links
      };
    });
    
    return content;
    
  } finally {
    await browser.close();
  }
}

const url = process.argv[2] || 'https://protokol57.tilda.ws/';
const content = await scrapeContent(url);

// Create markdown content
let markdown = `# ${content.title}\n\n`;

// Add main content
const cleanText = content.allText
  .replace(/\t+/g, ' ')
  .replace(/\n\s*\n/g, '\n\n')
  .trim();

// Split into paragraphs and clean up
const paragraphs = cleanText.split('\n\n').filter(p => p.trim().length > 0);

paragraphs.forEach(paragraph => {
  const text = paragraph.trim();
  if (text) {
    // Check if it looks like a heading (short, likely heading text)
    if (text.length < 80 && (
      text.includes('Sun\'iy') || 
      text.includes('Professional') ||
      text.includes('Boshlash') ||
      text.match(/^[A-Z].{5,40}[^.]$/)
    )) {
      markdown += `## ${text}\n\n`;
    } else {
      markdown += `${text}\n\n`;
    }
  }
});

// Add links section
if (content.links.length > 0) {
  markdown += `## Links\n\n`;
  content.links.forEach(link => {
    if (link.text && link.href) {
      markdown += `- [${link.text}](${link.href})\n`;
    }
  });
}

console.log(markdown);
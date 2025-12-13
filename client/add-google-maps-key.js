/**
 * Script đơn giản để thêm Google Maps API Key
 * Chạy: node add-google-maps-key.js
 */

const fs = require('fs');
const path = require('path');

const API_KEY = 'AIzaSyCVIUU1UvD4Z4jQdTU4EL69FgV9BvllfIA';

console.log('🔑 Adding Google Maps API Key...\n');

// Android
const androidManifestPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(androidManifestPath)) {
  let content = fs.readFileSync(androidManifestPath, 'utf8');
  
  if (content.includes('com.google.android.geo.API_KEY')) {
    content = content.replace(
      /android:value="[^"]*"/,
      `android:value="${API_KEY}"`
    );
    console.log('✅ Updated API key in AndroidManifest.xml');
  } else {
    content = content.replace(
      /(<application[^>]*>)/,
      `$1\n        <meta-data android:name="com.google.android.geo.API_KEY" android:value="${API_KEY}" />`
    );
    console.log('✅ Added API key to AndroidManifest.xml');
  }
  
  fs.writeFileSync(androidManifestPath, content, 'utf8');
} else {
  console.log('⚠️  AndroidManifest.xml not found. Run "npx expo prebuild" first.');
}

// iOS
const iosInfoPlistPath = path.join(__dirname, 'ios', 'Yummy', 'Info.plist');
if (fs.existsSync(iosInfoPlistPath)) {
  let content = fs.readFileSync(iosInfoPlistPath, 'utf8');
  
  if (content.includes('<key>GMSApiKey</key>')) {
    content = content.replace(
      /<key>GMSApiKey<\/key>\s*<string>[^<]*<\/string>/,
      `<key>GMSApiKey</key>\n\t<string>${API_KEY}</string>`
    );
    console.log('✅ Updated API key in Info.plist');
  } else {
    content = content.replace(
      /(\s*)<\/dict>/,
      `\t<key>GMSApiKey</key>\n\t<string>${API_KEY}</string>\n$1</dict>`
    );
    console.log('✅ Added API key to Info.plist');
  }
  
  fs.writeFileSync(iosInfoPlistPath, content, 'utf8');
} else {
  console.log('⚠️  Info.plist not found. Run "npx expo prebuild" first.');
}

console.log('\n✨ Done! Remember to rebuild your app.');



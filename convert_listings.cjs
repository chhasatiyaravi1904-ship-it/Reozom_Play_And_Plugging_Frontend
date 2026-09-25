const fs = require('fs');

const htmlContent = fs.readFileSync('src/views/listings/MyListingsView.html', 'utf8');

// Extract everything between <body> and </body>
const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) {
  console.error('No body found');
  process.exit(1);
}

let bodyContent = bodyMatch[1];

// Remove <script> tags from body content to avoid Vue compiler errors
bodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

// The generated HTML usually contains inline styles or SVGs, which are fine.
// Sometimes we need to escape {{ and }} if they are present in the text, but let's assume it's mostly structural HTML.

const vueComponent = `<template>
  <div class="my-listings-page">
    ${bodyContent}
  </div>
</template>

<script setup lang="ts">
// My Listings Management component
</script>

<style scoped>
</style>
`;

fs.writeFileSync('src/views/listings/MyListingsView.vue', vueComponent);
console.log('Successfully created MyListingsView.vue');

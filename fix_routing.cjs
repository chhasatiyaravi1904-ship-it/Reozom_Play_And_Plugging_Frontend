const fs = require('fs');
const file = 'C:/Users/Hetu/Desktop/Reozom_Play_Plugin/Frontend/src/views/LandingView.vue';
let content = fs.readFileSync(file, 'utf8');

// Replace specific Log In instances
content = content.replace(/onclick="openAuthModal\('Log In'\)"/g, '@click="$router.push(\'/auth/login\')"');

// Replace all other instances with Register
content = content.replace(/onclick="openAuthModal\([^)]+\)"/g, '@click="$router.push(\'/auth/register\')"');

fs.writeFileSync(file, content);
console.log('Fixed routing in LandingView');

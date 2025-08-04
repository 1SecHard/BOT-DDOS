const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');

// 🛡️ Token Bot របស់អ្នក (បើអាច, ត្រូវផ្ងុំដោយ dotenv នៅ production)
const token = '8153869983:AAH1u2Au0CfxxTHzjEUr9xFmHUp8LYqx1sI';

// 👑 បញ្ជី Admin និង Premium
const adminUsers = [7516008527]; // You
const premiumUsers = [7516008527]; // You

const bot = new TelegramBot(token, { polling: true });

function isAdmin(userId) {
  return adminUsers.includes(userId);
}

function isPremium(userId) {
  return premiumUsers.includes(userId) || isAdmin(userId);
}

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const command = msg.text.toLowerCase();
  const userId = msg.from.id;

  // 🔎 /id: បង្ហាញ User ID
  if (command === '/id') {
    bot.sendMessage(chatId, `🆔 ID របស់អ្នកគឺ: ${userId}`);
    return;
  }

  // ➕ /addpremium [user_id]
  if (command.startsWith('/addpremium')) {
    if (!isAdmin(userId)) {
      bot.sendMessage(chatId, '🚫 អ្នកមិនមែនជា admin ទេ។');
      return;
    }

    const args = command.split(' ');
    const newUserId = parseInt(args[1]);

    if (!newUserId || isNaN(newUserId)) {
      bot.sendMessage(chatId, '❌ ប្រើត្រឹមត្រូវ: /addpremium [user_id]');
      return;
    }

    if (premiumUsers.includes(newUserId)) {
      bot.sendMessage(chatId, 'ℹ️ អ្នកប្រើប្រាស់នេះមានសិទ្ធិ Premium រួចហើយ។');
    } else {
      premiumUsers.push(newUserId);
      bot.sendMessage(chatId, `✅ User ID ${newUserId} ត្រូវបានបន្ថែមទៅជា Premium!`);
    }
    return;
  }

  // ⚙️ /mix [url] [time] [thread] [rate]
  if (command.startsWith('/mix')) {
    if (!isPremium(userId)) {
      bot.sendMessage(chatId, '🚫 តែ Premium/Admin ប៉ុណ្ណោះអាចប្រើ /mix។');
      return;
    }

    const args = command.split(' ');
    const url = args[1];
    const time = args[2];
    const thread = args[3];
    const rate = args[4];

    if (args.length === 5 && url && time && thread && rate) {
      exec(`node mix.js ${url} ${time} ${thread} ${rate}`, (error, stdout, stderr) => {
        if (error || stderr) {
          console.error(error || stderr);
          bot.sendMessage(chatId, '⚠️ មានបញ្ហាក្នុងការដំណើរការ។');
          return;
        }
        bot.sendMessage(chatId, '✅ ដំណើរការ mix បានចាប់ផ្តើម។');
      });
    } else {
      bot.sendMessage(chatId, '❌ ប្រើត្រឹមត្រូវ៖ /mix [url] [time] [thread] [rate]');
    }
  }
});
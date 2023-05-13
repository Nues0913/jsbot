/**
 *node: 代表nodejs原生自帶的module
 *import syntax1 : import moduleName from 'module';
 *import syntax2 : import { export } from 'module';
 */
import dotenv from 'dotenv';
import fg from 'fast-glob'
import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';


// 加載根目錄.env文件
dotenv.config();
// 從環境變量中加載所需值
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// 創建一個discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
// Collection is a Map with additional utility methods in discord.js.
client.commands = new Collection();
// 直接使用client.commands也可以，但後面傳參時解析 Collection 會很麻煩，所以宣告一個array直接存command json data
let commands = [];


/**
 * 加載與註冊
 */
(async() => {

	const files = await fg('./commands/**/*.js')
	/**
	 * 加載檔案(指令)，使用fast-glob模組
	 */
	for (const file of files) {
		const command = await import(file);
		// 檢查模組內是否有所需回傳值(data 與 execute)
		if ('data' in command && 'execute' in command) {
			// .set(key, value) 方法會將一個鍵值對添加到 client.commands 的 Collection 實例中
			client.commands.set(command.data.name, command);
			// 直接讀collection類很麻煩，將鍵值對再次添加進一個array裡
			commands.push(command.data.toJSON());
		} else {
			
		}
	}
	/**
	 * 指令註冊
	 * 傳參也可以使用 client.commands，但要先解析真的很麻煩 :)
	 */
	// ()()立即調用一個匿名函式
	(async(commands) =>{
		try {
			// 處理API請求，與伺服器通訊並註冊command上去
			const rest = new REST({ version: '10' }).setToken(TOKEN);
			console.log('Started refreshing application (/) commands.');
			// 執行一個API的PUT請求(上傳指令)
			const data = await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
		} catch (error) {
			console.error(error);
		}
	})(commands);
})();
// 此時的 commands 依然為空陣列，應為其需等待兩個promise回應(line:35)
// console.log(commands)

// /**
//  * 不用fast-glob的方法
//  * 指令加載
//  * 坑，在ES環境(使用import的環境)中無預設的__dirname(當前文件位置)變數，請手動創建一個
//  */
// import fs from 'node:fs';
// import path from 'node:path';
// import { fileURLToPath } from "node:url";
// // 獲取文件路徑 e.g. c:\Users\潘振中\Nues\桌面\js\index.js
// const __filename = fileURLToPath(import.meta.url);
// // 獲取文件根目錄路徑 e.g. c:\Users\潘振中\Nues\桌面\js
// const __dirname = path.dirname(__filename);
// // 在路徑中加入commands資料夾 e.g. c:\Users\潘振中\Nues\桌面\js\commands
// const commandsPath = path.join(__dirname, 'commands');
// // 取得資料夾底下結尾為.js的檔案，return list
// const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
// // 遍歷commandFiles
// for (const file of commandFiles) {
// 	// 獲取文件路徑 e.g. c:\Users\潘振中\Nues\桌面\js\commands\ping.js
// 	const fileUrl = new URL('file:' + path.join(commandsPath, file));	
// 	// 動態載入模組
// 	const command = await import(fileUrl.href);
// 	// 檢查模組內是否有所需回傳值(data 與 execute)
// 	if ('data' in command && 'execute' in command) {
// 		// .set(key, value) 方法會將一個鍵值對添加到 client.commands 的 Collection 實例中
// 		client.commands.set(command.data.name, command);
// 		// 直接讀collection類很麻煩，將鍵值對再次添加進一個array裡
// 		commands.push(command.data.toJSON());
// 	} else {
// 		console.log(`[WARNING] The command at ${fileUrl.href} is missing a required "data" or "execute" property.`);
// 	}
// }
// /**
//  * 指令註冊
//  * 傳參也可以使用 client.commands，但要先解析真的很麻煩 :)
//  */
// // ()()立即調用一個匿名函式
// (async(commands) =>{
// 	try {
// 		// 處理API請求，與伺服器通訊並註冊command上去
// 		const rest = new REST({ version: '10' }).setToken(TOKEN);
// 		console.log('Started refreshing application (/) commands.');
// 		// 執行一個API的PUT請求(上傳指令)
// 		const data = await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
// 		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
// 	} catch (error) {
// 		console.error(error);
// 	}
// })(commands);




client.on('ready', () => {
  console.log(`🟢 Login as ${client.user.tag}!`);
});


/**
 * 指令調用
 */
// 偵測互動創建的發生
client.on('interactionCreate', async interaction => {
	// 若此互動不是斜線指令則跳出
	if (!interaction.isChatInputCommand()) return;
	// 宣告出觸發指令
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		// 找不到指令
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	try {
		// 傳interaction給指令定義的execute做後續動作
		await command.execute(interaction);
	} catch (error) {
		// 錯誤打印
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.login(TOKEN);
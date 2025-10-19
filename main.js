// Підключаємо вбудований модуль Node.js для роботи з файловою системою
const fs = require('fs'); // 

// Підключаємо сторонній модуль commander
const { program } = require('commander');

// ---- Налаштування аргументів командного рядка ----

program
  // --- Опції Частини 1 ---
  .requiredOption(
    '-i, --input <file>',
    'path to input json file' // [cite: 32]
  )
  .option(
    '-o, --output <file>',
    'path to output file' // [cite: 35]
  )
  .option(
    '-d, --display',
    'display result in console' // 
  )
  // --- Опції Частини 2 (Варіант 2) ---
  .option(
    '-t, --date', //  УВАГА: Прапор змінено на -t, щоб уникнути конфлікту з -d (--display)
    'Display date before info (FL_DATE)'
  )
  .option(
    '-a, --airtime <value>', // 
    'Display records with air time longer than specified (AIR_TIME)'
  );

// Парсимо аргументи, передані при запуску
program.parse(process.argv);

// Отримуємо значення опцій
const options = program.opts();

// ---- Перевірка помилок (Частина 1) ----

// 1. Перевірка обов'язкового параметра -i
// Commander з requiredOption робить це автоматично,
// але для кастомного повідомлення можна перевірити:
if (!options.input) {
  console.error('Please, specify input file'); // [cite: 37]
  process.exit(1);
}

// 2. Перевірка, чи існує вхідний файл
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file'); // [cite: 38]
  process.exit(1); // Виходимо з програми з кодом помилки
}

// ---- Читання та Обробка (Частина 2) ----

let fileContent;
try {
  // Використовуємо readFileSync, як вказано в завданні 
  fileContent = fs.readFileSync(options.input, 'utf-8');
} catch (error) {
  console.error(`Error reading input file: ${error.message}`);
  process.exit(1);
}

// 2. Парсимо JSON
let data;
try {
  data = JSON.parse(fileContent);
  // Переконуємося, що це масив (JSON може бути і об'єктом)
  if (!Array.isArray(data)) {
    throw new Error('Input JSON is not an array.');
  }
} catch (error) {
  console.error(`Error parsing JSON file: ${error.message}`);
  process.exit(1);
}

// 3. Обробляємо дані (фільтрація та форматування)
// Починаємо з повного масиву даних
let processedData = data;

// 3.1 Фільтруємо за опцією -a, --airtime 
if (options.airtime) {
  const minAirTime = parseFloat(options.airtime);

  if (isNaN(minAirTime)) {
    console.warn('Warning: Invalid value for --airtime. Ignoring filter.');
  } else {
    // .filter() створює новий масив, залишаючи тільки ті елементи,
    // для яких функція повертає true.
    processedData = processedData.filter(flight => {
      const flightAirTime = parseFloat(flight.AIR_TIME);
      // Перевіряємо, що AIR_TIME є числом і воно більше за задане
      return !isNaN(flightAirTime) && flightAirTime > minAirTime;
    });
  }
}

// 3.2 Форматуємо вивід 
// .map() перетворює кожен елемент масиву на новий (у нашому випадку - на рядок)
const outputLines = processedData.map(flight => {
  // Формуємо частину з датою, ТІЛЬКИ якщо задано опцію -t (--date) 
  const datePart = options.date ? `${flight.FL_DATE} ` : '';

  // Збираємо рядок згідно з прикладом: [ДАТА] ЧАС_У_ПОВІТРІ ВІДСТАНЬ
  return `${datePart}${flight.AIR_TIME} ${flight.DISTANCE}`;
});

// Об'єднуємо всі рядки в один, розділяючи їх символом нового рядка
const finalOutput = outputLines.join('\n');


// ---- Виведення результату (Частина 1) ----

// 1. Якщо ні -o, ні -d не задано, нічого не виводимо [cite: 39]
if (!options.output && !options.display) {
  process.exit(0);
}

// 2. Якщо задано -d (--display), виводимо в консоль 
if (options.display) {
  console.log(finalOutput);
}

// 3. Якщо задано -o (--output), записуємо у файл [cite: 35]
if (options.output) {
  try {
    // Використовуємо writeFileSync, як вказано в завданні 
    fs.writeFileSync(options.output, finalOutput);
    console.log(`Result successfully saved to ${options.output}`);
  } catch (error) {
    console.error(`Error writing to output file: ${error.message}`);
  }
}
// Якщо задані і -o, і -d, код виконає обидва блоки (і запис, і вивід) [cite: 40]
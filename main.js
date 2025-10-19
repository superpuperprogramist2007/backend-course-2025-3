// Підключаємо вбудований модуль Node.js для роботи з файловою системою
const fs = require('fs');

// Підключаємо сторонній модуль commander
const { program } = require('commander');

// ---- Налаштування аргументів командного рядка ----

program
  .requiredOption(
    '-i, --input <file>',
    'path to input json file' // Обов'язковий параметр 
  )
  .option(
    '-o, --output <file>',
    'path to output file' // Необов'язковий параметр 
  )
  .option(
    '-d, --display',
    'display result in console' // Необов'язковий параметр 
  );

// Налаштовуємо кастомну обробку помилки для відсутнього -i
program.on('--help', () => {
  console.log();
  console.log('Error handling:');
  console.log('  If -i is not specified: "Please, specify input file"');
  console.log('  If input file not found: "Cannot find input file"');
});

// Парсимо аргументи, передані при запуску
try {
  program.parse(process.argv);
} catch (error) {
  // Commander сам по собі виводить помилку про відсутні аргументи.
  // Але якщо ми хочемо *саме той* текст, ми можемо зробити так:
  if (error.code === 'commander.missingMandatoryOption') {
    console.error('Please, specify input file'); // 
  }
  process.exit(1);
}

// Отримуємо значення опцій
const options = program.opts();

// ---- Перевірка помилок ----

// 1. Перевірка, чи існує вхідний файл
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file'); // 
  process.exit(1); // Виходимо з програми з кодом помилки
}

// 2. Перевірка, чи потрібно щось виводити
// Якщо не задано ні -o, ні -d, програма нічого не робить і завершується. 
if (!options.output && !options.display) {
  // Нічого не робимо, просто виходимо
  process.exit(0);
}

// ---- Читання та Виведення (базове) ----
// Цей блок виконається, лише якщо задано -o або -d

let result; 
try {
  // Використовуємо readFileSync, як вказано в Частині 2 
  // Це необхідно, щоб мати "результат" для виведення
  result = fs.readFileSync(options.input, 'utf-8');
} catch (error) {
  console.error(`Error reading input file: ${error.message}`);
  process.exit(1);
}

// Логіка виведення, яка задовольняє умови [cite: 39, 40]

// 3. Якщо задано -d, виводимо в консоль
if (options.display) {
  console.log(result);
}

// 4. Якщо задано -o, записуємо у файл
if (options.output) {
  try {
    // Використовуємо writeFileSync 
    fs.writeFileSync(options.output, result);
    console.log(`Result successfully saved to ${options.output}`);
  } catch (error) {
    console.error(`Error writing to output file: ${error.message}`);
  }
}
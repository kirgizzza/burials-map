// netlify/functions/get-burials.js


// Подключаем хранилище Netlify Blobs
const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  // Настраиваем заголовки (чтобы не было проблем с запросами)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Если браузер проверяет доступность (preflight-запрос)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Открываем хранилище с именем "burials"
    const store = getStore('burials');
    
    // Пытаемся получить данные из хранилища
    let burials = await store.get('burials-data', { type: 'json' });
    
    // Если данных в хранилище нет, берём начальные из файла
    if (!burials) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../../public/burials-data.js');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      // Извлекаем массив из файла (он вида "const burials = [...]")
      const match = fileContent.match(/const burials = (\[[\s\S]*\]);/);
      if (match) {
        burials = eval('(' + match[1] + ')');
        // Сохраняем в хранилище для будущего использования
        await store.setJSON('burials-data', burials);
      }
    }
    
    // Возвращаем данные пользователю
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(burials || [])
    };
    
  } catch (error) {
    console.error('Ошибка:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Не удалось загрузить данные' })
    };
  }
};
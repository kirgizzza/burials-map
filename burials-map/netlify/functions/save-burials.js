// netlify/functions/save-burials.js

const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Разрешаем только POST-запросы (сохранение данных)
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Метод не поддерживается' })
    };
  }

  // Разрешаем preflight-запрос
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Получаем данные из запроса
    const burials = JSON.parse(event.body);
    
    // Открываем хранилище и сохраняем данные
    const store = getStore('burials');
    await store.setJSON('burials-data', burials);
    
    // Возвращаем успех
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Данные сохранены в облаке' })
    };
    
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Не удалось сохранить данные' })
    };
  }
};
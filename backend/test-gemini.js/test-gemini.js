import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function testGemini() {
  try {
    console.log('🧪 Testing Gemini API...');
    console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? 
      `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 
      '❌ NOT FOUND');

    const result = await model.generateContent("Привет! Скажи 'API работает!'");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success!');
    console.log('📝 Response:', text);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
  }
}

testGemini();
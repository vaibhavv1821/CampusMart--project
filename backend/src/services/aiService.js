const axios = require("axios");

const getAIPrice = async (productData) => {
  try {
    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/predict-price`,
      {
        title: productData.title,
        category: productData.category,
        condition: productData.condition,
        price: productData.price,
      },
      { timeout: 5000 }
    );

    return {
      aiPriceMin: response.data.min_price || null,
      aiPriceMax: response.data.max_price || null,
    };
  } catch (error) {
    console.log("AI Service unavailable, skipping price prediction");
    return { aiPriceMin: null, aiPriceMax: null };
  }
};

module.exports = { getAIPrice };
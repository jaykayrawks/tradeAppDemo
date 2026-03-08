function randomPrice(base = 100) {
  return +(base + Math.random() * 20 - 10).toFixed(2);
}

function generateHistoricalData(ticker) {
  const data = [];
  let price = randomPrice(100);

  for (let i = 0; i < 50; i++) {
    price += Math.random() * 4 - 2;
    data.push({
      timestamp: Date.now() - i * 60000,
      price: +price.toFixed(2)
    });
  }

  return data.reverse();
}

module.exports = { randomPrice, generateHistoricalData };

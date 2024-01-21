const { log } = require('console');
const fs = require('fs');
const productActions = require('../src/actions/productActions')

const dataFilePath = 'C:/Users/megaz/OneDrive/Pulpit/Backend/src/last_run_date.txt';
function runDailyJob() {
  const currentDate = new Date().toLocaleDateString();
  const lastRunDate = fs.readFileSync(dataFilePath, 'utf-8');
    
    console.log(lastRunDate);
  if (currentDate !== lastRunDate) {

    console.log('Uruchamiam zadanie raz dziennie.');
    productActions.updateProduct()
    fs.writeFileSync(dataFilePath, currentDate);
  } else {
    console.log('Zadanie zostało już uruchomione dzisiaj.');
  }
}

// Planowanie uruchomienia funkcji raz dziennie o godzinie 12:00



module.exports = {
    runDailyJob,
  };
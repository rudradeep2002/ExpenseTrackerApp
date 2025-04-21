const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  signDisplay: "always",
});

const list = document.getElementById("transactionList");
const form = document.getElementById("transactionForm");
const status = document.getElementById("status");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

form.addEventListener("submit", addTransaction);

function updateTotal() {
  const incomeTotal = transactions
   .filter((trx) => trx.type === "income")
   .reduce((total, trx) => total + trx.amount, 0);

  const expenseTotal = transactions
   .filter((trx) => trx.type === "expense")
   .reduce((total, trx) => total + trx.amount, 0);

  const balanceTotal = incomeTotal - expenseTotal;

  const expensePercentage = (expenseTotal / incomeTotal) * 100;

  if (incomeTotal > 0 && expensePercentage > 85) {
    alert("Control your expenses! You are spending too much !!");
  }

  balance.textContent = formatter.format(balanceTotal).substring(1);
  income.textContent = formatter.format(incomeTotal);
  expense.textContent = formatter.format(expenseTotal * -1);
}

function renderList() {
  list.innerHTML = "";
  status.textContent = "";
  if (transactions.length === 0) {
    status.textContent = "No transactions.";
    return;
  }

  transactions.forEach(({ id, name, amount, date, type }) => {
    const sign = "income" === type? 1 : -1;

    const li = document.createElement("li");

    li.innerHTML = `
      <div class="name">
        <h4>${name}</h4>
        <p>${new Date(date).toLocaleDateString()}</p>
      </div>

      <div class="amount ${type}">
        <span>${formatter.format(amount * sign)}</span>
      </div>

      <div class="action">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" onclick="deleteTransaction(${id})">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    `;

    list.appendChild(li);
  });
}

renderList();
updateTotal();

function deleteTransaction(id) {
  const index = transactions.findIndex((trx) => trx.id === id);
  transactions.splice(index, 1);

  updateTotal();
  saveTransactions();
  renderList();
}

function addTransaction(e) {
  e.preventDefault();

  const formData = new FormData(this);

  const newTransaction = {
    id: transactions.length + 1,
    name: formData.get("name"),
    amount: parseFloat(formData.get("amount")),
    date: new Date(formData.get("date")),
    type: "on" === formData.get("type")? "income" : "expense",
  };

  const balanceTotal = transactions
  .filter((trx) => trx.type === "income")
  .reduce((total, trx) => total + trx.amount, 0) -
   transactions
  .filter((trx) => trx.type === "expense")
  .reduce((total, trx) => total + trx.amount, 0);

  if (newTransaction.type === "expense" && newTransaction.amount > balanceTotal) {
    alert("Price is higher! Try to find an alternative at a lower price.");
    return;
  }

  transactions.push(newTransaction);

  updateTotal();
  saveTransactions();
  renderList();

  if (newTransaction.type === "expense") {
    const incomeTotal = transactions
    .filter((trx) => trx.type === "income")
    .reduce((total, trx) => total + trx.amount, 0);

    const expensePercentage = (newTransaction.amount / incomeTotal) * 100;
    if (incomeTotal > 0 && expensePercentage > 85) {
      alert("Expense exceeds 85% of the income!");
    }
  }
}

function saveTransactions() {
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  localStorage.setItem("transactions", JSON.stringify(transactions));
}

const exportButton = document.getElementById("exportButton");

exportButton.addEventListener("click", exportToPDF);


function exportToPDF() {
  const doc = new jsPDF();
  let y = 20;
  transactions.forEach(({ id, name, amount, date, type }) => {
    const sign = "income" === type? 1 : -1;
    doc.text(`${name} - ${new Date(date).toLocaleDateString()} - ${formatter.format(amount * sign)}`, 10, y);
    y = y + 10;
  });
  doc.save("transactions.pdf");
}

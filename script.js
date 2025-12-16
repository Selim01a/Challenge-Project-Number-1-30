// 1. Select DOM Elements
const addTransactionBtn = document.getElementById('addTransaction');
const customerNameInput = document.getElementById('customerName');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const typeInput = document.getElementById('type');
const paymentMethodInput = document.getElementById('paymentMethod');
const transactionList = document.getElementById('transaction-list');
const fullHistoryTable = document.getElementById('full-history-table');
const categoryInput = document.getElementById('category');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

const formatter = new Intl.NumberFormat('tr-TR', { //This is for currency formatting
    style: 'currency',
    currency: 'TRY',
});

//DOM means ; Document Object Model
//It is a representation of the HTML document as a tree structure where each element is a node in the tree.

//Modal means ; A modal is a pop-up window that appears on top of the main content of a web page.
//It is often used to display additional information or to prompt the user for input.


// Modal Elements
const modal = document.getElementById('history-modal');
const openHistoryBtn = document.getElementById('open-history-btn');
const closeHistoryBtn = document.getElementById('close-history-btn');

// 2. Initialize Data
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
let transactions = localStorageTransactions;
let isEditing = false;
let editId = null;

// 3. EVENT: Add OR Update Transaction
addTransactionBtn.addEventListener('click', function () {
    // A. Get values
    const customerName = customerNameInput.value.trim();
    const description = descriptionInput.value.trim();
    const amount = amountInput.value.trim();
    const date = dateInput.value.trim();
    const type = typeInput.value.trim();
    const paymentMethod = paymentMethodInput.value.trim();
    const category = categoryInput.value.trim();

    // B. Validate
    if (amount === "" || customerName === "" || description === "" || date === "" || type === "" || paymentMethod === "" || category === "") {
        alert('Please enter all fields');
        return;
    }

    // --- LOGIC FOR UPDATE VS ADD ---
    if (isEditing) {
        // UPDATE EXISTING ITEM
        transactions = transactions.map(t => {
            if (t.id === editId) {
                return {
                    id: editId, // Keep original ID
                    customerName,
                    description,
                    amount,
                    date,
                    type,
                    paymentMethod,
                    category
                };
            }
            return t;
        });

        // Reset Mode
        isEditing = false;
        editId = null;
        addTransactionBtn.textContent = "Add Transaction";
        addTransactionBtn.style.backgroundColor = ""; // Reset color

    } else {
        // CREATE NEW ITEM
        const transaction = {
            id: Date.now(),
            customerName,
            description,
            amount,
            date,
            type,
            paymentMethod,
            category
        };
        transactions.push(transaction);
    }
    // -------------------------------

    // D. Update Data & UI
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // We must refresh the whole list because we might have changed an item in the middle
    init();

    // F. Clear Inputs
    customerNameInput.value = "";
    descriptionInput.value = "";
    amountInput.value = "";
    dateInput.value = "";
});

// 4. FUNCTION: Add to List (Screen)
function addTransactionDOM(transaction) {
    const li = document.createElement('li');

    // NEW CLASS NAMES HERE:
    li.classList.add('transaction-item');
    li.classList.add(transaction.type === 'Income' ? 'plus' : 'minus');

    li.innerHTML = `
        <div class="transaction-info">
            <span style="font-weight:600;">${transaction.customerName}</span>
            <span style="font-size:0.8rem; color:#888;">${transaction.description} (${transaction.date})</span>
            <span style="font-size:0.8rem; color:#888;">${transaction.category}</span>
        </div>
        <div style="text-align:right;">
             <div class="transaction-amount">
                ${transaction.type === 'Income' ? '+' : '-'}${formatter.format(transaction.amount)}
            </div>
            <div style="margin-top:5px;">
                </div>
        </div>
    `;

    // Create Button Container within the right-side div
    const btnContainer = li.children[1].children[1];
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = "action-btn btn-edit"; // We will style this in CSS later
    editBtn.style.backgroundColor = "#3b82f6"; // Quick style (or add to CSS)

    editBtn.addEventListener('click', function () {
        // 1. Enter Edit Mode
        isEditing = true;
        editId = transaction.id;

        // 2. Load Data into Inputs
        customerNameInput.value = transaction.customerName;
        descriptionInput.value = transaction.description;
        amountInput.value = transaction.amount;
        dateInput.value = transaction.date;
        typeInput.value = transaction.type;
        paymentMethodInput.value = transaction.paymentMethod;

        // 3. Change Button Text
        addTransactionBtn.textContent = "Update Transaction";
        addTransactionBtn.style.backgroundColor = "#eab308"; // Yellow to signal change

        // 4. (Optional) Remove the item from the screen immediately 
        // to avoid confusion, or just scroll to top. 
        // Let's scroll to top so user sees the form.
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // HIDE Button
    const hideBtn = document.createElement('button');
    hideBtn.textContent = 'Hide';
    hideBtn.className = "action-btn btn-hide";
    hideBtn.addEventListener('click', () => li.remove());

    // DELETE Button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = "action-btn btn-delete";
    deleteBtn.addEventListener('click', function () {
        if (confirm("Are you sure?")) {
            li.classList.add('fall-out');

            // 2. Wait for animation to finish (500ms) before changing data
            li.addEventListener('animationend', function () {
                li.remove(); // Remove from HTML
                transactions = transactions.filter(t => t.id !== transaction.id); // Remove from Data
                localStorage.setItem('transactions', JSON.stringify(transactions)); // Save
                updateValue(); // Update Totals
                renderTable(); // Update Table
            });
        }
    });

    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(hideBtn);
    btnContainer.appendChild(deleteBtn);

    transactionList.appendChild(li);
}

// 5. FUNCTION: Update Totals
function updateValue() {
    const incomeValue = getFilteredTransactions()
        .filter(t => t.type === 'Income')
        .reduce((acc, t) => acc + parseInt(t.amount), 0);

    const expenseValue = getFilteredTransactions()
        .filter(t => t.type === 'Expense')
        .reduce((acc, t) => acc + parseInt(t.amount), 0);

    const balanceValue = incomeValue - expenseValue;

    document.getElementById('balance-display').style.color = balanceValue >= 0 ? 'green' : 'red';
    document.getElementById('balance-display').textContent = formatter.format(balanceValue);
    document.getElementById('income-value').textContent = formatter.format(incomeValue); // formatter giving us the $ sign and provides the correct formatting
    document.getElementById('expense-value').textContent = formatter.format(expenseValue);

    // Toggle Empty State Message
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        if (transactions.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
    }
}

// 6. FUNCTION: Render Table (Modal)
function renderTable(dataToRender = transactions) {
    const tableBody = document.getElementById('full-history-table');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    dataToRender.forEach(transaction => {
        const row = document.createElement('tr');

        // 1. Create the Data Columns (HTML)
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td><strong>${transaction.customerName}</strong></td>
            <td>${transaction.description}</td>
            <td>
                <span style="color:${transaction.type === 'Income' ? '+' : '-'}${formatter.format(transaction.amount)}}">
                    ${transaction.type}
                </span>
            </td>
            <td><strong>${transaction.type === 'Income' ? '+' : '-'}${formatter.format(transaction.amount)}</strong></td>
        `;

        // 2. Create the "Actions" Column (JavaScript)
        const actionTd = document.createElement('td');

        // --- Table EDIT Button ---
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'action-btn';
        editBtn.style.backgroundColor = '#3b82f6'; // Blue
        editBtn.style.marginRight = '5px';

        editBtn.addEventListener('click', () => {
            // A. Load data into form (Same as before)
            isEditing = true;
            editId = transaction.id;

            customerNameInput.value = transaction.customerName;
            descriptionInput.value = transaction.description;
            amountInput.value = transaction.amount;
            dateInput.value = transaction.date;
            typeInput.value = transaction.type;
            paymentMethodInput.value = transaction.paymentMethod;

            // B. Change Main Button
            addTransactionBtn.textContent = "Update Transaction";
            addTransactionBtn.style.backgroundColor = "#eab308";

            // C. CRITICAL: Close the modal so user can see the form!
            modal.classList.remove('show');

            // D. Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // --- Table DELETE Button ---
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'action-btn btn-delete';

        deleteBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to delete this from history?")) {
                // Remove from array
                transactions = getFilteredTransactions().filter(t => t.id !== transaction.id);
                // Save and Refresh everything
                localStorage.setItem('transactions', JSON.stringify(transactions));
                init(); // Re-renders list, table, and values
            }
        });

        // 3. Assemble
        actionTd.appendChild(editBtn);
        actionTd.appendChild(deleteBtn);
        row.appendChild(actionTd); // Add the action cell to the row

        tableBody.appendChild(row);
    });
}

// 7. Modal Logic
if (openHistoryBtn && modal && closeHistoryBtn) {
    openHistoryBtn.addEventListener('click', () => {
        modal.classList.add('show');
    });

    closeHistoryBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// 8. Initial Load
function init() {
    transactionList.innerHTML = ''; // Clear list to avoid duplicates on reload
    transactions.forEach(addTransactionDOM);
    updateValue();
    renderTable();
}

// SEARCH LOGIC
const searchInput = document.getElementById('search-input');

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();

    // Filter the global transactions array
    const filteredTransactions = getFilteredTransactions().filter(t => {
        return (
            t.customerName.toLowerCase().includes(searchTerm) ||
            t.description.toLowerCase().includes(searchTerm) ||
            t.category.toLowerCase().includes(searchTerm)
        );
    });

    // Re-render the table with ONLY the filtered data
    renderTable(filteredTransactions);
});

// 1. Check Local Storage on Load
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Change icon to Sun
}

// 2. Event Listener
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark'); // Save preference
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
});
// --- DATE FILTER LOGIC ---
const dateFilter = document.getElementById('date-filter');

function getFilteredTransactions() {
    const filterValue = dateFilter.value;

    // If "All Time", return everything
    if (filterValue === 'all') return transactions;

    const now = new Date();
    const cutoffDate = new Date();
    // Subtract days (7 or 30) from today
    cutoffDate.setDate(now.getDate() - parseInt(filterValue));

    // Return only items newer than the cutoff date
    return transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= cutoffDate;
    });
}

// Trigger updates when dropdown changes
dateFilter.addEventListener('change', () => {
    updateValue();
    renderChart();
});

init(); // Initialize on load
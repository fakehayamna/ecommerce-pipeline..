// pipeline.js
// Data Transformation Pipeline — ES6+ only, no loops

// ---------- 1. Reference Date  ----------
const TODAY = new Date("2025-02-01"); // fictional "today"

// ---------- 2. Helper: last 30 days check ----------
const isWithinLast30Days = (dateStr) => {
  const orderDate = new Date(dateStr);
  const diffInDays = (TODAY - orderDate) / (1000 * 60 * 60 * 24);
  return diffInDays >= 0 && diffInDays <= 30;
};

// ---------- 3. Helper: date format (DD-MMM-YYYY) ----------
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

// ---------- 4. Helper: currency format (PKR) ----------
const formatPKR = (amount) =>
  `Rs ${amount.toLocaleString("en-PK")}`;

// ---------- 5. MAIN PIPELINE ----------
const buildAnalyticsSummary = (orders) => {
  // Step A: Filter completed + last 30 days
  const filtered = orders.filter(
    (order) => order.status === "completed" && isWithinLast30Days(order.date)
  );

  // Step B: Calculate total value
  const totalValue = filtered.reduce((sum, o) => sum + o.amount, 0);

  // Step C: Format dates + amount
  const formatted = filtered.map((o) => ({
    ...o,
    date: formatDate(o.date),
    amountFormatted: formatPKR(o.amount)
  }));

  // Step D: Group by category using reduce
  const grouped = formatted.reduce((acc, order) => {
    acc[order.category] = acc[order.category] || [];
    acc[order.category].push(order);
    return acc;
  }, {});

  // Step E: Sort each category by revenue (descending)
  const sortedCategories = Object.entries(grouped).reduce(
    (acc, [category, items]) => {
      acc[category] = [...items].sort((a, b) => b.amount - a.amount);
      return acc;
    },
    {}
  );

  // Step F: Summary object
  return {
    generatedAt: formatDate(TODAY.toISOString().split("T")[0]),
    totalOrders: orders.length,
    completedOrders: filtered.length,
    totalRevenue: totalValue,
    totalRevenueFormatted: formatPKR(totalValue),
    categories: sortedCategories
  };
};

// ---------- 6. Run pipeline ----------
const summary = buildAnalyticsSummary(rawOrders);

// ---------- 7. Render to DOM ----------
const renderSummary = (data) => {
  const summaryEl = document.getElementById("summary");

  const stats = [
    { label: "Total Orders", value: data.totalOrders },
    { label: "Completed Orders", value: data.completedOrders },
    { label: "Total Revenue", value: data.totalRevenueFormatted },
    { label: "Generated On", value: data.generatedAt }
  ];

  summaryEl.innerHTML = stats
    .map(
      (s) => `
      <div class="stat-box">
        <span class="stat-label">${s.label}</span>
        <span class="stat-value">${s.value}</span>
      </div>`
    )
    .join("");

  const catEl = document.getElementById("categories");

  catEl.innerHTML = Object.entries(data.categories)
    .map(
      ([category, orders]) => `
      <div class="category-card">
        <div class="category-header">
          <h3>${category}</h3>
          <span class="badge">${orders.length} orders</span>
        </div>
        <ul class="order-list">
          ${orders
            .map(
              (o) => `
            <li>
              <span class="order-no">${o.orderNumber}</span>
              <span class="order-customer">${o.customer}</span>
              <span class="order-product">${o.product}</span>
              <span class="order-date">${o.date}</span>
              <span class="order-amount">${o.amountFormatted}</span>
            </li>`
            )
            .join("")}
        </ul>
      </div>`
    )
    .join("");
};

// ---------- 8. Kick off ----------
renderSummary(summary);
console.log(summary);
const STATS_URL =
  // "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/DEMO_R_D3DENS?lang=EN";
  "https://json-stat.org/samples/order.json";
var records = [];

async function loadData() {
  let response = await fetch(STATS_URL);
  let data = await response.json();
  records = data.size.map(dim => data.value.shift())
}

async function load() {
  await loadData();
  console.log(records);
  reset();
  displayTHead(rows[0]);
  displayCaption(records);
  displayTBody(records);
  displayGraphics("Total ticket", records);
  //displayGraphics("Tip", records);
}

function reset() {
  let weekdays = labels("Weekday", records);
  let genders = labels("Gender", records);
  let services = labels("Service", records);
  let smokers = labels("Smoker", records);
  let covers = labels("Number of covers", records);
  let ticketsRange = amountRange("Total ticket", records);
  let tipsRange = amountRange("Tip", records);
  displayWeekdaySelect(weekdays);
  displayCheckboxes("gender", genders);
  displayCheckboxes("service", services);
  displayCheckboxes("smoker", smokers);
  displayCheckboxes("covers", covers);
  displayAmountInputs("tickets", ticketsRange);
  displayAmountInputs("tip", tipsRange);
}

function convert(value) {
  let cleanedValue = value.replace(" ", "");
  return isNaN(cleanedValue) ? cleanedValue : +cleanedValue;
}

function labels(name, records) {
  return Array.from(new Set(records.map((record) => record[name]))).sort();
}

function amountRange(name, records) {
  const sortedRecords = records
    .map((record) => +record[name])
    .sort((a, b) => a - b);
  return {
    min: sortedRecords[0],
    max: sortedRecords[sortedRecords.length - 1],
  };
}

function displayAmountInputs(id, range /* [min, max] */) {
  const amountFieldset = document.querySelector(`#${id}`);
  amountFieldset.innerHTML = `
    <legend>${id}</legend>
    <input
        type="number"
        id="min-${id}"
        min="${range.min}"
        max="${range.max}"
        placeholder="Minimum value">
    <input type="number"
        id="max-${id}"
        min="${range.min}"
        max="${range.max}"
        placeholder="Minimum value">
    `;
}

function displayWeekdaySelect(labels) {
  const selectElement = document.querySelector("#weekdays");
  selectElement.innerHTML = `
    <option>All</option>
    <option>
        ${labels.join("</option><option>")}
    </option>
    `;
}

function displayCheckboxes(name, labels) {
  const fieldsetElement = document.querySelector(`#${name}`);
  fieldsetElement.innerHTML = `
    <legend>${name}</legend>
    ${labels.map(displayLabel(name)).join("")}
    `;
}

function displayLabel(name) {
  return (label) => `
    <input type="checkbox" 
           name="${name}"
           id="${label.toString().toLowerCase()}"
           value="${label}">
    <label for="${label.toString().toLowerCase()}">${label}</label>
    `;
}

function filter() {
  const filteredRecords = records
    .filter(filterWeekday)
    .filter(filterCheckboxes("Gender"))
    .filter(filterCheckboxes("Service"))
    .filter(filterCheckboxes("Smoker"))
    .filter(filterCheckboxes("Number of covers"))
    .filter(filterAmount("Total ticket"))
    .filter(filterAmount("Tip"));

  displayCaption(filteredRecords);
  displayTBody(filteredRecords);
  displayGraphics(filteredRecords);
}

function filterWeekday(record) {
  const value = document.querySelector("#weekdays").value;
  return value === "All" || record["Weekday"] === value;
}

function filterCheckboxes(name) {
  let id = name === "Number of covers" ? "covers" : name.toLowerCase();
  return (record) => {
    const checkedElements = Array.from(
      document.querySelectorAll(`#${id} input`)
    );
    const checkedValues = checkedElements
      .filter((elem) => elem.checked)
      .map((elem) => (id === "covers" ? +elem.value : elem.value));

    return checkedValues.length === 0 || checkedValues.includes(record[name]);
  };
}

function filterAmount(name) {
  let id = name === "Total ticket" ? "tickets" : name.toLowerCase();
  return (record) => {
    const minValue = +document.querySelector(`#min-${id}`).value;
    const maxValue = +document.querySelector(`#max-${id}`).value;

    return (
      (minValue === 0 || record[name] >= minValue) &&
      (maxValue === 0 || record[name] <= maxValue)
    );
  };
}

function displayCaption(records) {
  let captionElement = document.querySelector("#tips caption");
  captionElement.innerHTML = `
    <p>Number of records: ${records.length}</p>
    `;
}

function displayTHead(headerRow) {
  const tHead = document.querySelector("#tips thead");
  tHead.innerHTML = `
    <tr>
        <th>${headerRow
      .map(
        (col) => `${col}
        <span onclick="compare('${col}', 1, this)">&#x2b06;</span>
        <span onclick="compare('${col}', -1, this)">&#x2b07;</span>
        `
      )
      .join("</th><th>")}</th>
    </tr>
    `;
}

function compare(col, dir, target) {
  records.sort((recA, recB) =>
    recA[col] > recB[col] ? dir : recA[col] === recB[col] ? 0 : -dir
  );
  filter();
  highlight(target);
}

function highlight(target) {
  sortSpans = document.querySelectorAll("th span");
  for (const span of sortSpans) {
    span.style.color = "gray";
  }
  target.style.color = "black";
}

function displayTBody(records) {
  const tBody = document.querySelector("#tips tbody");
  tBody.innerHTML = `
    <tr>
        ${records
      .map(
        (record) => `<td>${Object.values(record).join("</td><td>")}</td>`
      )
      .join("</tr><tr>")}
    </tr>
    `;
}

function displayGraphics(name, records) {
  const ctx = document.getElementById("myChart");
  const amounts = records.map((record) => record[name]);
  const chartData = amounts.reduce(
    (acc, cv) => {
      if (cv > 0 && cv <= 10) {
        acc[0] = acc[0] + 1;
      } else if (cv > 10 && cv <= 20) {
        acc[1] = acc[1] + 1;
      } else if (cv > 20 && cv <= 30) {
        acc[2] = acc[2] + 1;
      } else if (cv > 30 && cv <= 40) {
        acc[3] = acc[3] + 1;
      } else if (cv > 40 && cv <= 50) {
        acc[4] = acc[4] + 1;
      } else {
        acc[5] = acc[5] + 1;
      }

      return acc;
    },
    [0, 0, 0, 0, 0, 0]
  );
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["]0,10]", "]10,20]", "]20,30]", "]30,40]", "]40,50]", "]50,60]"],
      datasets: [
        {
          label: "# of Tickets",
          data: chartData,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Kept for the record but not used
/*
There are 3 ways to use the For loop:
1. for(initialize; continuation_condition; increment)
2. for(const value of list) ==> take each value from the list
3. for(const index in list) ==> take every index from the list
*/
/*
<table>
    <thead>
    <tr>
        <th>Col 1</th>
        <th>Col 2</th>
        <th>Col 3</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>Cell 1,1</td>
        <td>Cell 1,2</td>
        <td>Cell 1,3</td>
    </tr>
    <tr>
        <td>Cell 2,1</td>
        <td>Cell 2,2</td>
        <td>Cell 2,3</td>
    </tr>
    <tr>
        <td>Cell 3,1</td>
        <td>Cell 3,2</td>
        <td>Cell 3,3</td>
    </tr>
    </tbody>
</table>
*/
async function load2() {
  let data = await fetch(STATS_URL)
    .then((resp) => resp.text())
    .then((text) => text.split("\n"))
    .then((rows) => rows.map((row) => row.split(",")));
  console.log(data);
  return data;
}

function row2Cells(row) {
  return row.split(",");
}

function rows2Cells(rows) {
  for (
    let i = 0; // Initialization step
    i < rows.length; // Continuation condition
    i = i + 1 // Incrementation step
  ) {
    rows[i] = rows[i].split(",");
  }

  return rows;
}

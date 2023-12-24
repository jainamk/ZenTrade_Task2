const fileInput = document.getElementById("inputFile");
const process = document.getElementById("processData");
let data = []
function disableFunc(val) {
    const disableClass = document.querySelectorAll(".disable")
    disableClass.forEach(ele => ele.disabled = val)
}

fileInput.addEventListener("change", function (event) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
                const content = e.target.result;
                if (fileExtension === 'json') {
                    disableFunc(true);
                    // fetchJSONData();
                } else if (fileExtension === 'csv') {
                    disableFunc(false);
                    // fetchCSVData();
                }
                process.addEventListener("click", function (event) {

                    const displayOpt = document.getElementById('displayOptions');
                    displayOpt.innerHTML = `
                    <div>
                     <label for="availableFields">Available Fields</label>
                        <select id="availableFields" multiple></select>
                    </div>

                    <button onclick="toSelect()">>></button>
                    <button onclick="toDisplay()">&lt;&lt;</button>
                    <div>
                        <label for="displayFields">Fields to Display</label>
                        <select id="displayFields" multiple></select>
                    </div>
                    `
                    if (fileExtension === 'json') {
                        fetchJSONData(content);
                    } else if (fileExtension === 'csv') {
                        const delimiter = document.getElementById('delimiter').value;
                        const encoding = document.getElementById('encoding').value;
                        let hasHeader = document.getElementById('hasHeader').value;
                        if (hasHeader === 'true')
                            hasHeader = true;
                        else
                            hasHeader = false;
                        fetchCSVData(content, delimiter, encoding, hasHeader);
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }
        reader.readAsText(selectedFile)
    }
});

function addToDisplayOption(data) {
    const availableFields = document.getElementById('availableFields');

    if (data && data.count && data.products) {
        const arr = Object.values(data)
        const prod = Object.values(arr[1])
        const attrs = Object.keys(prod[0]);
        // console.log(fields);
        attrs.forEach(attr => {
            const option = document.createElement('option');
            option.value = attr;
            option.text = attr;
            availableFields.add(option);
        });
    } else {
        console.error('Invalid data format. Expected "products" property in the data.');
    }
}

function fetchJSONData(content) {
    // console.log(content);
    try {

        data = JSON.parse(content)
        addToDisplayOption(data);
        // displayData(parsedContent);

        // document.getElementById("displayButton").addEventListener("click", displayData(parsedContent));
    } catch (error) {
        console.error(error);
    }
}

function fetchCSVData(content, delimiter, encoding, hasHeader) {
    // console.log(hasHeader);
    Papa.parse(content, {
        header: hasHeader,
        delimiter: delimiter,
        encoding: encoding,
        complete: function (results) {
            const csvData = results.data;
            // console.log(csvData);
            // Update displayData based on the parsed CSV data
            data = { count: csvData.length, products: csvData };
            addToDisplayOption(data);
            displayData();
        },
        error: function (error) {
            console.error('Error parsing CSV:', error.message);
        },
    });
}

function toSelect() {
    move("availableFields", "displayFields")
}

function toDisplay() {
    move('displayFields', 'availableFields');
}

function move(from, to) {
    const from1 = document.getElementById(from);
    const to1 = document.getElementById(to);

    Array.from(from1.selectedOptions).forEach(option => {
        to1.add(option);
    });

}

function displayData() {

    const prodTable = document.getElementById('prodTable');
    prodTable.innerHTML = `  <table id="productTable">
    <thead>
      <tr>

      </tr>
    </thead>
    <tbody id="productList"></tbody>
  </table>`

  const displayFields = document.getElementById('displayFields');
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    if (data && data.count && data.products) {
        const productsArray = Object.values(data.products);

        if (productsArray.length > 0) {
            productsArray.sort((a, b) => b.popularity - a.popularity);

            const headerRow = productTable.tHead.insertRow();
            Array.from(displayFields.options).forEach(fieldOption => {
                const headerCell = document.createElement('th');
                headerCell.textContent = fieldOption.value[0].toUpperCase() + fieldOption.value.slice(1);
                headerRow.appendChild(headerCell);
            });

            productsArray.forEach(product => {
                const row = productList.insertRow();
                let idx = 0;

                Array.from(displayFields.options).forEach(fieldOption => {
                    const field = fieldOption.value;
                    row.insertCell(idx).textContent = product[field];
                    idx++;
                });
            });
        } else {
            productList.innerHTML = 'EMPTY';
        }

    } else {
        console.error('Invalid data');
    }
}

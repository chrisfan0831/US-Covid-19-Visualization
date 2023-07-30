// Load the CSV data
d3.csv("data/us.csv").then((data) => {

  // Set up the dimensions of the chart
  const margin = { top: 20, right: 100, bottom: 30, left: 100 };
  const width = 1000 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Convert string dates to actual date objects
  const dateParser = d3.timeParse("%Y-%m-%d");
  data.forEach((d) => {
    d.date = dateParser(d.date);
    d.cases = +d.cases; // Convert to numbers
    d.deaths = +d.deaths;
  });

  // Create an SVG element within the #chart div
  const svgCases = d3.select("#line-chart-cases")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Create an SVG element within the #chart div
  const svgDeaths = d3.select("#line-chart-deaths")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Create scales for x and y axes
  const xScale = d3.scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([0, width]);

  const yScaleCases = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => d.cases)])
    .range([height, 0]);

  const yScaleDeaths = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => d.deaths)])
    .range([height, 0]);

  // Create x and y axes
  const xAxis = d3.axisBottom(xScale);
  const yAxisCases = d3.axisLeft(yScaleCases);
  const yAxisDeaths = d3.axisRight(yScaleDeaths);

  // Append x and y axes to the SVG
  svgCases.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svgCases.append("g")
    .call(yAxisCases);

  svgDeaths.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svgDeaths.append("g")
    .attr("transform", "translate(0, " + width + ", 0)")
    .call(yAxisDeaths);

  // Create the line generators
  const lineCases = d3.line()
    .x((d) => xScale(d.date))
    .y((d) => yScaleCases(d.cases));

  const lineDeaths = d3.line()
    .x((d) => xScale(d.date))
    .y((d) => yScaleDeaths(d.deaths));

  // Append the lines to the SVG
  svgCases.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 1)
    .attr("d", lineCases);

  svgDeaths.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1)
    .attr("d", lineDeaths);

  // Add tooltips
  const tooltipCases = d3.select("#line-chart-cases")
    .append("div")
    .attr("class", "tooltip-line-chart")
    .style("opacity", 0);

  const tooltipDeaths = d3.select("#line-chart-deaths")
  .append("div")
  .attr("class", "tooltip-line-chart")
  .style("opacity", 0);

  svgCases.selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", 3)
    .attr("cx", (d) => xScale(d.date))
    .attr("cy", (d) => yScaleCases(d.cases))
    .style("fill", "blue")
    .on("mouseover", (event, d) => {
      tooltipCases.transition()
        .duration(200)
        .style("opacity", 1);
      tooltipCases.html("Date: " + d.date.toISOString().slice(0, 10) + "<br> Cases: " + d.cases)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY) - 30 + "px");
    })
    .on("mouseout", () => {
      tooltipCases.transition()
        .duration(500)
        .style("opacity", 0);
    });

  svgDeaths.selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", 3)
    .attr("cx", (d) => xScale(d.date))
    .attr("cy", (d) => yScaleDeaths(d.deaths))
    .style("fill", "red")
    .on("mouseover", (event, d) => {
      tooltipDeaths.transition()
        .duration(200)
        .style("opacity", 1);
      tooltipDeaths.html("Date: " + d.date.toISOString().slice(0, 10) + "<br> Deaths: " + d.deaths)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY) -30 + "px");
    })
    .on("mouseout", () => {
      tooltipDeaths.transition()
        .duration(500)
        .style("opacity", 0);
    });
});

/////////////////////////////////////BAR CHARTS/////////////////////////////////////////////////

// Load the CSV data
d3.csv("data/us-states.csv").then((data) => {
  // Set up the dimensions of the chart
  const margin = { top: 20, right: 100, bottom: 80, left: 100 };
  const width = 1000 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Convert string dates to actual date objects
  const dateParser = d3.timeParse("%Y-%m-%d");
  data.forEach((d) => {
    d.date = dateParser(d.date);
    d.cases = +d.cases; // Convert to numbers
    d.deaths = +d.deaths;
  });

  // Get unique dates for date selection
  const uniqueDates = [...new Set(data.map((d) => d.date))];

  // Create date selection bar
  const dateSelect = d3.select("#date-select");
  dateSelect.selectAll("option")
    .data(uniqueDates)
    .enter()
    .append("option")
    .text((d) => d.toISOString().slice(0, 10))
    .attr("value", (d) => d.toISOString().slice(0, 10)); // Set the value attribute for each option

  const maxCasesValue = d3.max(data, (d) => d.cases);
  const maxDeathsValue = d3.max(data, (d) => d.deaths);

  // Function to update the cases bar chart based on the selected date
  function updateCasesChart(selectedDate) {
    const filteredData = data.filter((d) => d.date.getTime() === selectedDate.getTime());

    // Create scales for x and y axes
    const xScale = d3.scaleBand()
      .domain(filteredData.map((d) => d.state))
      .range([0, width])
      .padding(0.1);

    const yScaleCases = d3.scaleLinear()
      .domain([0, maxCasesValue])
      .range([height, 0]);

    // Create x and y axes
    const xAxisCases = d3.axisBottom(xScale);
    const yAxisCases = d3.axisLeft(yScaleCases);

    // Create SVG element for cases bar chart
    const svgCases = d3.select("#bar-chart-cases")
      .selectAll("svg")
      .data([null])
      .join("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Remove any existing bars
    svgCases.selectAll(".bar").remove();

    // Create bars for cases
    const barsCases = svgCases.selectAll(".bar")
      .data(filteredData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.state))
      .attr("y", (d) => yScaleCases(d.cases))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScaleCases(d.cases))
      .attr("fill", "blue"); // Fill cases bars with blue color

    // Add tooltips for cases bars
    barsCases.on("mouseover", (event, d) => {
      const tooltip = d3.select("#tooltip");

      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`<strong>${d.state}</strong><br>Cases: ${d.cases}`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    });

    barsCases.on("mouseout", () => {
      const tooltip = d3.select("#tooltip");
      tooltip.transition().duration(500).style("opacity", 0);
    });

    // Append x and y axes to the SVG for cases
    svgCases.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisCases)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svgCases.append("g")
      .call(yAxisCases);
  }

  // Function to update the deaths bar chart based on the selected date
  function updateDeathsChart(selectedDate) {
    const filteredData = data.filter((d) => d.date.getTime() === selectedDate.getTime());

    // Create scales for x and y axes
    const xScale = d3.scaleBand()
      .domain(filteredData.map((d) => d.state))
      .range([0, width])
      .padding(0.1);

    const yScaleDeaths = d3.scaleLinear()
      .domain([0, maxDeathsValue])
      .range([height, 0]);

    // Create x and y axes
    const xAxisDeaths = d3.axisBottom(xScale);
    const yAxisDeaths = d3.axisLeft(yScaleDeaths);

    // Create SVG element for deaths bar chart
    const svgDeaths = d3.select("#bar-chart-deaths")
      .selectAll("svg")
      .data([null])
      .join("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Remove any existing bars
    svgDeaths.selectAll(".bar").remove();

    // Create bars for deaths
    const barsDeaths = svgDeaths.selectAll(".bar")
      .data(filteredData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.state))
      .attr("y", (d) => yScaleDeaths(d.deaths))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScaleDeaths(d.deaths))
      .attr("fill", "red"); // Fill deaths bars with red color

    // Add tooltips for deaths bars
    barsDeaths.on("mouseover", (event, d) => {
      const tooltip = d3.select("#tooltip");

      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`<strong>${d.state}</strong><br>Deaths: ${d.deaths}`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    });

    barsDeaths.on("mouseout", () => {
      const tooltip = d3.select("#tooltip");
      tooltip.transition().duration(500).style("opacity", 0);
    });
    // Append x and y axes to the SVG for deaths
    svgDeaths.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisDeaths)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svgDeaths.append("g")
      .call(yAxisDeaths);
  }

  // Set the default date 
  const defaultDate = dateParser("2022-01-01");
  dateSelect.property("value", defaultDate.toISOString().slice(0, 10));

  // Initial update of the charts with the default date
  updateCasesChart(defaultDate);
  updateDeathsChart(defaultDate);

  // Add event listener to update the charts on date selection change
  dateSelect.on("change", function () {
    const selectedDate = dateParser(this.value);
    updateCasesChart(selectedDate);
    updateDeathsChart(selectedDate);
  });

  let updateInterval;

//  // Function to automate the date selection and chart updates
//   function automateCharts() {
//     const startDate = new Date(document.getElementById("date-select").value);
//     const endDate = d3.max(data, (d) => d.date); // Get the latest date from the data

//     let currentDate = startDate;
//     const interval = 10; // Time interval between date changes in milliseconds

//     // Update the date selection and charts at the specified interval
//     updateInterval = setInterval(() => {
//       if (currentDate <= endDate) {
//         // Update the date selection
//         document.getElementById("date-select").valueAsDate = currentDate;

//         // Update the charts
//         updateCasesChart(currentDate);
//         updateDeathsChart(currentDate);

//         // Increment the current date
//         currentDate.setDate(currentDate.getDate() + 1);
//       } else {
//         // Stop the automated updates when the end date is reached
//         clearInterval(updateInterval);

//         // Enable the "Automate" button
//         document.getElementById("automate-button").disabled = false;
//         // Disable the "Stop" button
//         document.getElementById("stop-button").disabled = true;
//       }
//     }, interval);

//     // Disable the "Automate" button
//     document.getElementById("automate-button").disabled = true;
//     // Enable the "Stop" button
//     document.getElementById("stop-button").disabled = false;
//   }

//   // Function to stop the automated updates
//   function stopAutomateCharts() {
//     // Clear the interval to stop automated updates
//     clearInterval(updateInterval);

//     // Enable the "Automate" button
//     document.getElementById("automate-button").disabled = false;
//     // Disable the "Stop" button
//     document.getElementById("stop-button").disabled = true;

//     // Update the charts once the automation is stopped
//     const selectedDate = new Date(document.getElementById("date-select").value);
//     updateCasesChart(selectedDate);
//     updateDeathsChart(selectedDate);
//   }

//   // Event listener for the "Automate" button
//   document.getElementById("automate-button").addEventListener("click", automateCharts);

//   // Event listener for the "Stop" button
//   document.getElementById("stop-button").addEventListener("click", stopAutomateCharts);
});





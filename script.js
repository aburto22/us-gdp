function getQuarter(str) {
  const rgx = /(\d{4})-(\d{2})-\d{2}/;
  const results = str.match(rgx);
  const year = Number(results[1]);
  const month = Number(results[2]);
  if (month <= 2) return "Q1 " + year;
  else if (month <= 5) return "Q2 " + year;
  else if (month <= 8) return "Q3 " + year;
  else return "Q4 " + year;
}

const w = 850;
const h = 500;
const paddingX = 100;
const paddingY = 40;

const svg = d3
  .select("main")
  .append("svg")
  .attr("width", w)
  .attr("height", h)
  .attr("viewBox", `0 0 ${w} ${h}`);
//.style("background-color", "white");

fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
)
  .then((res) => res.json())
  .then((json) => {
    const parseTime = d3.timeParse("%Y-%m-%d");
    const formatTime = d3.timeFormat("%Y-%m-%d");

    const dataset = json.data.map((d) => [parseTime(d[0]), d[1]]);

    const max = d3.max(dataset, (d) => d[1]);

    const yScale = d3
      .scaleLinear()
      .domain([0, max])
      .range([h - paddingY, paddingY])
      .nice();

    const xScale = d3
      .scaleTime()
      .domain([dataset[0][0], dataset[dataset.length - 1][0]])
      .range([paddingX, w - paddingX]);

    const dataWidth = (w - 2 * paddingX) / dataset.length;

    svg
      .selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("data-date", (d) => formatTime(d[0]))
      .attr("data-gdp", (d) => d[1])
      .attr("width", (d, i) => dataWidth)
      .attr("height", (d, i) => yScale(0) - yScale(d[1]))
      .attr("x", (d, i) => xScale(d[0]))
      .attr("y", (d, i) => yScale(d[1]))
      .on("mouseover", function () {
        const info = [
          d3.select(this).attr("data-date"),
          d3.select(this).attr("data-gdp"),
        ];

        tooltip
          .attr("data-date", info[0])
          .selectAll("text")
          .data(info)
          .attr("fill", "black")
          .text((val, i) => {
            if (i == 0) {
              return getQuarter(val);
            } else {
              return "$" + Intl.NumberFormat().format(val) + " billion USD";
            }
          });

        const tooltipTextWidth = Number(
          document.querySelector("#tooltip-1").getBBox().width
        );

        tooltip.select("rect").attr("width", tooltipTextWidth + 35);

        tooltip.interrupt().transition().duration(100).style("opacity", 1);
      })
      .on("mouseout", function () {
        tooltip
          .attr("data-date", "")
          .interrupt()
          .transition()
          .duration(100)
          .style("opacity", 0);
      });

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => "$" + Intl.NumberFormat().format(d));

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${h - paddingY})`)
      .call(xAxis);

    svg
      .append("text")
      .attr("x", w / 2)
      .attr("y", h - paddingY + 40)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text("Year");

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${paddingX}, 0)`)
      .call(yAxis);

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${30}, ${h / 2}) rotate(-90)`)
      .attr("font-weight", "bold")
      .text("GDP (in billion USD)");

    const tooltip = svg
      .append("g")
      .attr("transform", "translate(250, 150)")
      .attr("id", "tooltip")
      .attr("fill", "rgba(255, 190, 10, 0.95)")
      .style("opacity", 0);

    tooltip
      .append("rect")
      .attr("width", 165)
      .attr("height", 50)
      .attr("rx", 10)
      .attr("ry", 10);

    tooltip
      .append("text")
      .attr("x", 15)
      .attr("y", 22)
      .attr("id", "tooltip-0")
      .attr("fill", "white")
      .attr("font-weight", "bold");

    tooltip
      .append("text")
      .attr("id", "tooltip-1")
      .attr("x", 15)
      .attr("y", 40)
      .attr("fill", "white");

    svg.on("mousemove", function (e) {
      const mouse = d3.pointer(e);
      tooltip.attr(
        "transform",
        `translate(${mouse[0] - 80}, ${mouse[1] - 75})`
      );
    });
  });

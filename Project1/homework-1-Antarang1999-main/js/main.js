// Hint: This is a good place to declare your global variables
var male_data 
var female_data
var svg    
var width
var height
var margin
var innerWidth
var innerHeight
var previous_country = ''; // used for animation 

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
   // Hint: create or set your svg element inside this function
    svg  = d3.select('#svg');
    
    width = +svg.style('width').replace('px','');
    height = +svg.style('height').replace('px','');

   margin = { top:70, bottom: 50, right: 40, left: 130 };
   innerWidth = width - margin.left - margin.right;
   innerHeight = height - margin["top"] - margin.bottom;
    

   // This will load your two CSV files and store them into two arrays.
   Promise.all([d3.csv('data/females_data.csv'),d3.csv('data/males_data.csv')])
        .then(function (values) {
            console.log('loaded females_data.csv and males_data.csv');
            female_data = values[0];
            male_data = values[1];

          // Hint: This is a good spot for doing data wrangling
          const  selectedCountries = ['Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina']; 
          
            female_data = female_data.map(row => {
              const countryData = { Year: row.Year};
              selectedCountries.forEach(country => {
                countryData[country] = +row[country];
              });
              return countryData;
            });


            male_data = male_data.map(row => {
              const countryData = { Year: row.Year};
              selectedCountries.forEach(country => {
                countryData[country] = +row[country];
              });
              return countryData;
            });
        
            drawLolliPopChart();

        });
});

// Use this function to draw the lollipop chart.
function drawLolliPopChart() {
    console.log('trace:drawLollipopChart()');
    


    const xAttrib = d3.select('#countryDropdown').property('value');
    var yearData = female_data.map(row => row.Year);
    // Parse year values and calculate oldest and latest dates
    var parsedYears = yearData.map(year => parseInt(year));
    var oldestYear = Math.min(...parsedYears);
    var latestYear = Math.max(...parsedYears);
    
    oldestYear -= 1;
    latestYear += 1;

    var max = 0;
    if (d3.max(female_data, d=>d[xAttrib]) > d3.max(male_data, d=> d[xAttrib])){
     max =  d3.max(female_data, d=>d[xAttrib])
    }

    else{ 
      max =  d3.max(male_data, d=>d[xAttrib])
    }
   
    const xScale =  d3.scaleTime()
                    .domain([new Date(oldestYear, 0, 1), new Date(latestYear, 0, 1)])
                    .range([0,innerWidth]);

    
    const yScale = d3.scaleLinear()
                    .domain([0 , max])
                    .range([innerHeight,0]);

    
    
    svg.select('g').remove();
    svg.selectAll('.legend').remove();
    
    const g = svg.append('g')
    .attr('transform', 'translate('+margin.left+' , '+margin.top+')') ;
  
    // circles and lines with animation using join 

    g.selectAll('.f-line')
    .data(female_data)
    .join(
      enter => enter.append('line')
      .attr('x1',  d => xScale(new Date(d.Year, 0, 1)) + 10)
      .attr('x2',  d => xScale(new Date(d.Year, 0, 1)) + 10)
      .attr('y1', innerHeight) 
      .attr('y2', d => {
        if(previous_country !== ''){
          return  yScale(d[previous_country]);
        }
        else{
           return yScale(d[xAttrib]);
        }
      })
                    .style('stroke', 'magenta')  
                    .call(enter => enter.transition()
                                         .attr('y2', d=>yScale(d[xAttrib])))
                      
    )
   
    g.selectAll('.m-line')
    .data(male_data)
    .join(
      enter => enter.append('line')
      .attr('x1',  d => xScale(new Date(d.Year, 0, 1)) )
      .attr('x2',  d => xScale(new Date(d.Year, 0, 1)) )
      .attr('y1', innerHeight) 
      .attr('y2', d => {
        if(previous_country !== ''){
          return  yScale(d[previous_country]);
        }
        else{
           return yScale(d[xAttrib]);
        }
      })
                    .style('stroke', 'green')  
                    .call(enter => enter.transition()
                                       .attr('y2', d=>yScale(d[xAttrib])))                 
    )
   
    g.selectAll('.f-circle')
      .data(female_data)
      .join(
        enter => enter.append('circle')
                      .attr('cx',  d => xScale(new Date(d.Year, 0, 1)) + 10)
                      .attr('cy', d => {
                        if(previous_country !== ''){
                          return  yScale(d[previous_country]);
                        }
                        else{
                           return yScale(d[xAttrib]);
                        }
                      })
                        .attr('r',5)
                      .attr('fill','magenta')
                      .call(enter => enter.transition()
                                         .attr('cy', d=>yScale(d[xAttrib])))                     
      )


      g.selectAll('.m-circle')
      .data(male_data)
      .join(
        enter => enter.append('circle')
                      .attr('cx',  d => xScale(new Date(d.Year, 0, 1)) )
                      .attr('cy', d => {
                        if(previous_country !== ''){
                          return  yScale(d[previous_country]);
                        }
                        else{
                           return yScale(d[xAttrib]);
                        }
                      })
                      .attr('r',5)
                      .attr('fill','green')
                      .call(enter => enter.transition() 
                                          .attr('cy', d=>yScale(d[xAttrib])))                   
      )

      previous_country = xAttrib; 
  
// Label for x and y axis 
    
    const yAxis = d3.axisLeft(yScale);
    g.append('g').call(yAxis);

    const xAxis = d3.axisBottom(xScale);
    g.append('g').call(xAxis)
                      .attr('transform',`translate(0,${innerHeight})`);
    g.append('text')
          .attr('x',innerWidth/2)
          .attr('y',innerHeight+40)
          .style('font-weight', 'bold')
          .text('Year');

    g.append('text')
       .attr('transform','rotate(-90)')
       .attr('y','-40px')
       .attr('x',-innerHeight/2)
       .style('text-anchor','middle')
       .style('font-weight', 'bold')
       .text('Employment Rate');


    //adding legends for the given data

    const femaleLegend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${innerWidth},20)`); 
    
    femaleLegend.append('rect')
        .attr('x', 0)
        .attr('y', -5)
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', 'magenta');
    
    femaleLegend.append('text')
        .attr('x', 15) 
        .attr('y', 5)  
        .style('font-weight', 'bold') 
        .style('font-size','12px') 
        .text('Female Employment Rate');

    const maleLegend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${innerWidth },40)`); 
    
    maleLegend.append('rect')
        .attr('x', 0)
        .attr('y', -5) 
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', 'green');
    
    maleLegend.append('text')
        .attr('x', 15) 
        .attr('y', 5)  
        .style('font-weight', 'bold') 
        .style('font-size','12px')
        .text('Male Employment Rate');

}


// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};
//const NUM_EXAMPLES = 250;

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = MAX_WIDTH/2 - 10, graph_1_height = 350;
let graph_2_width = MAX_WIDTH/2 - 10, graph_2_height = 330;
let graph_3_width = MAX_WIDTH/2 , graph_3_height = 660;

// GRAPH 1: number of titles per genre on netflix - barplot: toggle between movies, tv, and overall
let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height) 
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
let countRef = svg.append("g");

function setData(attr){
    d3.csv("../data/netflix.csv").then(function(data) {
        // Clean and strip desired amount of data for barplot
        data = getGenreData(data,attr); 
        const NUM_EXAMPLES = data.length

        let toDeleteText = svg.selectAll("text")
        toDeleteText.remove()
        let x = d3.scaleLinear()
            .domain([0,d3.max(data,function(d){ return d.count;})])
            .range([0,(graph_1_width - margin.left - margin.right)]);

        let y = d3.scaleBand()
            .domain(data.map(x => x.genre))
            .range([0,(graph_1_height - margin.top - margin.bottom)])
            .padding(0.1);  // Improves readability
        
        // Add y-axis label
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

        let toDelete = svg.selectAll("rect")
        toDelete.remove()
        let bars = svg.selectAll("rect").data(data);

        //Defining color scale
        let color = d3.scaleOrdinal()
            .domain(data.map(function(d) { return d.genre }))
            .range(d3.quantize(d3.interpolateHcl("#b81d24", "#FE1F2B"), NUM_EXAMPLES));

        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("fill", function(d) { return color(d.genre) }) 
            .attr("x", x(0))
            .attr("y", function(d){ return y(d.genre)})              
            .attr("width", function(d) { return x(d.count);})
            .attr("height",  y.bandwidth());   
        
        let toDeleteCnt = countRef.selectAll("text")
        toDeleteCnt.remove()
        let counts = countRef.selectAll("text").data(data);

        counts.enter()
            .append("text")
            .merge(counts)
            .attr("x", function(d){ return 5 + x(d.count)})       
            .attr("y", function(d){ return 11 + y(d.genre)}) 
            .style("text-anchor", "start")
            .style("font-size",11)
            .text(function(d){return d.count.toString()});  


        // x-axis label
        svg.append("text")
            .attr("transform", `translate(${(graph_1_width - margin.left - margin.right)/2},${graph_1_height - margin.bottom - margin.top + 15})`)  
            .style("text-anchor", "middle")
            .style("font-weight", 'bold')
            .text("Count");

        // y-axis label
        svg.append("text")
            .attr("transform", `translate(-140,${(graph_1_height - margin.top - margin.bottom)/2 - 5})`)   
            .style("text-anchor", "middle")
            .style("font-weight", 'bold')
            .text("Genre");
    let additionText = ""
    if (attr == "all"){
        additionText = "Top 20 Overall"
    } else {
        additionText = attr + "s"
    }   

        // Chart title
        svg.append("text")
            .attr("transform", `translate(${(graph_1_width - margin.left - margin.right)/2},${margin.top - 60})`)      
            .style("text-anchor", "middle")
            .style("font-size", 20)
            .style("font-weight", 'bold')
            .text("Top Genres Viewed on Netflix" + " - " + additionText);
    });
}

setData("all")

function getGenreData(data,attr) {
    let genre_dict = {}
    if (attr == "all") {
        for (let i = 0; i < data.length; i++){
            genre = data[i].listed_in
            genre = genre.split(', ')
            for (let j = 0; j < genre.length; j++){
                if (genre[j] in genre_dict){
                    genre_dict[genre[j]].count = genre_dict[genre[j]].count + 1
                } else {
                    genre_dict[genre[j]] = {count: 1, genre: genre[j]}
                }
            }
        }
        genre_array = []
        for (item in genre_dict){
            genre_array.push(genre_dict[item])
        }
        genre_array.sort((a,b) => b.count - a.count)
        return genre_array.slice(0,19)
    } else {
        for (let i = 0; i < data.length; i++){
            genre = data[i].listed_in
            type = data[i].type
            genre = genre.split(', ')
            if (type == attr){
                for (let j = 0; j < genre.length; j++){
                    if (genre[j] in genre_dict){
                        genre_dict[genre[j]].count = genre_dict[genre[j]].count + 1
                    } else {
                        genre_dict[genre[j]] = {count: 1, genre: genre[j]}
                    }
                }
            }
        }
        genre_array = []
        for (item in genre_dict){
            genre_array.push(genre_dict[item])
        }
        genre_array.sort((a,b) => b.count - a.count)
        return genre_array
    }
}

// GRAPH 2: average runtime of movies by release year, scatterplot with lines, tooltip for value
let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height) 
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
let countRef2 = svg2.append("g");
let div = d3.select("#graph2").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

d3.csv("../data/netflix.csv").then(function(data) {
    // Clean and strip desired amount of data for barplot
    data = getRuntimeByYearData(data); 
    const NUM_EXAMPLES_2 = data.length

    let x = d3.scaleLinear()
        .domain([d3.min(data,function(d){return d.year;}),d3.max(data,function(d){ return d.year;})])
        .range([0,(graph_1_width - margin.left - margin.right)]);

    let y = d3.scaleLinear()
        .domain([d3.max(data, function(d){ return d.total/d.count;}) + 10,0])
        .range([0,(graph_2_height - margin.top - margin.bottom)])
        //.padding(0.1);  // Improves readability
    
    // Add y-axis label
    svg2.append("g")
        .call(d3.axisLeft(y)); //.tickSize(0).tickPadding(10));
    svg2.append("g")
        .attr("transform", `translate(0,250)`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));


    svg2.append("path")
        .datum(data)
        .attr("fill","none")
        .attr("stroke","#b81d24")
        .attr("stroke-width",1.5)
        .attr("d", d3.line()
            .x(function(d) {return x(d.year)})
            .y(function(d) {return y(d.total/d.count)}))
    svg2.append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("cx", function(d){return x(d.year)})
            .attr("cy", function(d){return y(d.total/d.count)})
            .attr("r", 5)
            .attr("fill", "#b81d24")
            .on("mouseover", function(d) {		
                div.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                div.html("Year: " + d.year + "<br/>"  + "Runtime: " + (d.total/d.count).toFixed(2) + " min.")	
                    .style("left", (d3.event.pageX + 28) + "px")		
                    .style("top", (d3.event.pageY - 80) + "px")
                    .style("background-color", "#f78d92")
                    .style("position", "absolute")
                    .style("text-align", "center")
                    .style("min-width", "60px")			
                    .style("min-height", "28px")				
                    .style("padding", "3px")
                    .style("font", "12px sans-serif")				
                    .style("border-radius", "8px");	
                })					
            .on("mouseout", function(d) {		
                div.transition()		
                    .duration(500)		
                    .style("opacity", 0);	
            });

    // x-axis label
    svg2.append("text")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right)/2},${graph_2_height - margin.bottom - margin.top + 28})`)  
        .style("text-anchor", "middle")
        .style("font-weight", 'bold')
        .text("Release Year");

    // y-axis label
    svg2.append("text")
        .attr("transform", `translate(-95,${(graph_2_height - margin.top - margin.bottom)/2})`)   
        .style("text-anchor", "middle")
        .style("font-weight", 'bold')
        .text("Ave. Runtime (min.)");

    // Chart title
    svg2.append("text")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right)/2},${margin.top - 55})`)      
        .style("text-anchor", "middle")
        .style("font-size", 20)
        .style("font-weight", 'bold')
        .text("Average Runtime of Movies by Release Year");
});

function getRuntimeByYearData(data) {
    let runtime_dict = {}
    let runtime_array = []
    for (let i = 0; i < data.length; i++){
        if (data[i].type == 'Movie'){
            duration = parseInt(data[i].duration.replace(' min',''),10)
            rel_year = parseInt(data[i].release_year,10)
            country = data[i].country
            if (rel_year in runtime_dict){
                runtime_dict[rel_year].total = runtime_dict[rel_year].total + duration;
                runtime_dict[rel_year].count = runtime_dict[rel_year].count + 1;
            } else {
                runtime_dict[rel_year] = {year: rel_year, total: duration, count: 1};
            }
        }
    }
    for (item in runtime_dict){
         runtime_array.push(runtime_dict[item])
    }
    runtime_array.sort((a,b) => a.year - b.year)
    return runtime_array
}

function getRuntimeByCountryData(data) {
    let country_dict = {}
    let country_array = []
    for (let i = 0; i < data.length; i++){
        if (data[i].type == 'Movie'){
            duration = parseInt(data[i].duration.replace(' min',''),10)
            country = data[i].country
            if (country in country_dict){
                country_dict[country].total = country_dict[country].total + duration;
                country_dict[country].count = country_dict[country].count + 1;
            } else {
                country_dict[country] = {country: country, total: duration, count: 1};
            }
        }
    }
    for (item in country_dict){
         country_array.push(country_dict[item])
    }
    runtime_array.sort((a,b) => a.country - b.country)
    return runtime_array
}
// GRAPH 3: connections between actor: a flow chart where each actor is a node, and a link refers to a movie they both acted in, tooltip showing actors name

let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height) 
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

let countRef3 = svg3.append("g");

let div2 = d3.select("#graph3").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

d3.json("../data/networkdata.json").then(function(data) {
    let link = svg3.append("g")
                    .attr("class","links")
                    .selectAll("line")
                    .data(data.links)
                    .enter()
                    .append("line")
                    .style("stroke", "#aaa")
    let node = svg3.append("g")
                    .attr("class","nodes")
                    .selectAll("g")
                    .data(data.nodes)
                    .enter()
                    .append("g")
                    .append("circle")
                        .attr("r",5)
                        .style("fill","#E50914")
                        .on("mouseover", function(d) {		
                            div2.transition()		
                                .duration(200)		
                                .style("opacity", .9);		
                            div2.html(d.name)	
                                .style("left", (d3.event.pageX - 710) + "px")		
                                .style("top", (d3.event.pageY - 98) + "px")
                                .style("background-color", "#f78d92")
                                .style("position", "absolute")
                                .style("text-align", "center")
                                .style("min-width", "60px")			
                                .style("min-height", "20px")				
                                .style("padding", "3px")
                                .style("font", "12px sans-serif")				
                                .style("border-radius", "8px");	
                            })					
                        .on("mouseout", function(d) {		
                            div2.transition()		
                                .duration(500)		
                                .style("opacity", 0);	
                        });
                        
    node.append("text").text(function(d){return d.name})
    
    let simulation = d3.forceSimulation(data.nodes)
                        .force("link", d3.forceLink()
                            .id(function(d) { return d.id; })
                            .links(data.links))
                        .force("charge", d3.forceManyBody().strength(-1))
                        .force("center", d3.forceCenter(graph_3_width / 2 - 150, graph_3_height / 2))
    simulation.nodes(data.nodes).on("tick", ticked);
    simulation.force("link").links(data.links);

    function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function (d) { return d.x = Math.max(-150, Math.min(d.x,graph_3_width - 200)); })
        .attr("cy", function(d) { return d.y = Math.max(-10, Math.min(d.y, graph_3_height - 45)); });
    }

    // Chart title
    svg3.append("text")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right)/2},${margin.top - 60})`)      
        .style("text-anchor", "middle")
        .style("font-size", 20)
        .style("font-weight", 'bold')
        .text("Actors in Movies Together - 2019 (Non-International)");
});

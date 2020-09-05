// Set the dimensions of the canvas / graph
var margin = {top: 5, right: 30, bottom: 50, left: 70};
var revealIdentity = false;
var aData = [];

var svg = d3.select("svg"),
    width = +document.getElementById("mainBody").offsetWidth-margin.left-margin.right,
    height = +svg.attr("height")-margin.top-margin.bottom;

svg = svg.append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Parse the date / time
var parseTime = d3.timeParse("%m/%d/%y");

// Set the ranges
var x = d3.scaleTime().range([0, width-margin.left*2]);
var xNew = d3.scaleTime().range([0, width/2-margin.left]);

var y = d3.scaleLinear().range([height, 0]);
var yAxis= d3.scaleLinear().range([height, 0]);
var yP1= d3.scaleLinear().range([height*1.7, 0]);


// Define the line
var valueline = d3.line()
    .curve(d3.curveMonotoneX)
    .x(function(d) {
        if (document.getElementById("checkboxP1").checked)
            return xNew(d.date);
        else
            return x(d.date); })
    .y(function(d) { return y(d.score); });

// Student info data  
var data2 = {};
var groupCount = [{},{},{},{}];
d3.csv("data/Students.csv", function(error, data_) {
    data_.forEach(function(d) {
        if (data2[d.Email]==undefined)
            data2[d.Email] = {};
        data2[d.Email] =d;

    });
    main();
})

// Force-directed layout
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("link", d3.forceLink().distance(1).strength(1))
    .force("charge", d3.forceManyBody().strength(-0.1));
//    .force("center", d3.forceCenter(width / 2, height / 2));
var simulationP1 = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("link", d3.forceLink().distance(1).strength(1))
    .force("charge", d3.forceManyBody().strength(-0.1));
var simulationP2 = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("link", d3.forceLink().distance(1).strength(1))
    .force("charge", d3.forceManyBody().strength(-0.1));

var color = d3.scaleOrdinal(d3.schemeCategory10);
var radius = 8;

var node, link;
var nodeP1, linkP1, link01;
var nodeP2, linkP2, link02;
var nodeImage, nodeImageP1;

var dur = 400;  // animation duration


// Force-directed layout
var nodes=[];
var links=[];
var nodesP1=[];
var linksP1=[];
var nodesP2=[];
var linksP2=[];
var startDate = new Date("9/2/2020");
var today = d3.timeDay(Math.min(new Date(),new Date("12/11/2020")));

function getCategoty(str){
    if (str==="PhD")
        return 3;
    else if (new RegExp(/MSSE/g).test(str))
        return 2;
    else if (new RegExp(/MSCS/g).test(str))
        return 1;
    else
        return 0;
}
var data = {};



function main(){
    d3.csv("data/participation.csv", function(error, data_) {
        data_.forEach(function(d) {
            data[d.Email] = {array:d3.entries(d).filter(d=>+new Date(d.key)).map(object=>{
                return {date: new Date(object.key),score:+object.value}
            })};
            data[d.Email].array.name = data2[d.Email]['Fullname'];
            data[d.Email].array.studentTalk = +data2[d.Email].StudentTalk;
            data[d.Email].array.studentReport = +data2[d.Email].StudentReport;
            data[d.Email].array.nickname =data2[d.Email].Nickname;
            data[d.Email].array.group = getCategoty(data2[d.Email].Program);
            data[d.Email].array.image = data2[d.Email].Photoname;
            data[d.Email].array.P1_code = +(data2[d.Email].P1_code);
            data[d.Email].array.P1_talk = +(data2[d.Email].P1_talk);
            data[d.Email].array.P1_report = +(data2[d.Email].P1_report);
            data[d.Email].array.P1_survey = +(data2[d.Email].P1_survey);
            data[d.Email].array.P2_code = +(data2[d.Email].P2_code);
            data[d.Email].array.P2_talk = +(data2[d.Email].P2_talk);
            data[d.Email].array.P2_report = +(data2[d.Email].P2_report);
            data[d.Email].array.P2_review = +(data2[d.Email].P2_review);
            data[d.Email].array.P2_reviewForOthers = +(data2[d.Email].P2_reviewForOthers);
            data[d.Email].array.P2_group_score = +(data2[d.Email].P2_group_score);
            data[d.Email].array.index = data[d.Email].array.length-1;
        });

        // Accumulate values
        for (var key in data){
            var arr = data[key].array;
            for (var i=0; i< arr.length; i++){
                if (i>0)
                    arr[i].score+=arr[i-1].score;
                arr.score= arr[i].score;  // Copy the final score to array
                arr.date = arr[i].date;
            }
        }

        // Make a new array

        for (var key in data){
            var arr = data[key].array
            aData.push(arr);
            // count group (students by program)
            if (groupCount[arr.group].count==undefined)
                groupCount[arr.group].count=0;
            groupCount[arr.group].count++;
            groupCount[arr.group].program = data2[key].Program;
        }
        // Scale the range of the data
        x.domain([startDate,today]);
        xNew.domain([startDate,today]);
        y.domain([0, 15]);
        yAxis.domain([0, 0.15]);
        yP1.domain([0, 25]);


        // Search student nicknam
        var optArray =[];
        for (var student in data2) {
            optArray.push(data2[student].Nickname);
        }
        optArray = optArray.sort();
        $(function () {
            $("#search").autocomplete({
                source: optArray
            });
        });

        /* groupCount.sort(function(a,b){
           if (a.program<b.program)
             return 1;
           else
             return -1;
         })*/
        // Draw color legend *************************
        svg.append("line")
            .attr("class", "legendLine10")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .style("stroke-dasharray", ("3, 3"))
            .attr("x1", 200)
            .attr("y1", y(10))
            .attr("x2", x(today))
            .attr("y2", y(10));

        svg.selectAll(".legendCircle")
            .data(groupCount).enter()
            .append("circle")
            .attr("class", "legendCircle")
            .attr("stroke", function(d,i) {
                return color(i);
            })
            .attr("stroke-width", 1)
            .attr("fill", function(d,i) {
                return color(i);
            })
            .attr("cx", 60)
            .attr("cy", function(d, i){ return 30+20*i})
            .attr("r", 7)
            .on("mouseover", mouseoverLegend)
            .on("mouseout", mouseoutLegend);

        svg.selectAll(".legendLine")
            .data(groupCount).enter()
            .append("line")
            .attr("class", "legendLine")
            .attr("stroke", function(d,i) {
                return color(i);
            })
            .attr("stroke-width", 1)
            .attr("fill", "#fff")
            .attr("x1", 40)
            .attr("y1", function(d, i){ return 30+20*i})
            .attr("x2", 62)
            .attr("y2", function(d, i){ return 30+20*i});

        svg.selectAll(".legendText")
            .data(groupCount).enter()
            .append("text")
            .attr("class", "legendText")
            .style("font-size", "15px")
            .attr("text-anchor", "left")
            .attr("fill", function(d,i) {return color(i); })
            .attr("x", 62+radius)
            .attr("y", function(d, i){ return 36+20*i})
            .text(function(d){
                return d.program + " ("+d.count+" students)"})
            .on("mouseover", mouseoverLegend)
            .on("mouseout", mouseoutLegend);

        function mouseoverLegend(d1){
            svg.selectAll(".legendText")
                .attr("fill-opacity", function (d2){
                    return d1.program==d2.program ? 1 : 0.1; });
            svg.selectAll(".legendLine")
                .attr("stroke-opacity", function (d2){
                    return d1.program==d2.program ? 1 : 0.1; });
            svg.selectAll(".legendCircle")
                .attr("fill-opacity", function (d2){
                    return d1.program==d2.program ? 1 : 0.1; });
            svg.selectAll(".lineGraph")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){
                    return getCategoty(d1.program)==d2.group ? 1 : 0.05; });
            svg.selectAll(".nodeImage")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){
                    return getCategoty(d1.program)==d2.group ? 1 : 0.05; })
                .attr("fill-opacity", function (d2){
                    return getCategoty(d1.program)==d2.group ? 1 : 0.1; });
            svg.selectAll(".nodeImageP1")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){
                    if (!document.getElementById("checkboxP1").checked) return 0;
                    return getCategoty(d1.program)==d2.group ? 1 : 0.05; })
                .attr("fill-opacity", function (d2){
                    if (!document.getElementById("checkboxP1").checked) return 0;
                    return getCategoty(d1.program)==d2.group ? 1 : 0.1; });
            svg.selectAll(".nodeCircle")
                .transition().duration(dur)
                .attr("fill-opacity", function (d2){
                    return getCategoty(d1.program)==d2.group ? 1 : 0.1; });
            if (document.getElementById("checkboxP1").checked) {
                svg.selectAll(".nodeP1")
                    .transition().duration(dur)
                    .attr("stroke-opacity", function (d2){
                        return getCategoty(d1.program)==d2.group ? 1 : 0.05; })
                    .attr("fill-opacity", function (d2){
                        return getCategoty(d1.program)==d2.group ? 1 : 0.1; });

                svg.selectAll(".nodeP2")
                    .transition().duration(dur)
                    .attr("stroke-opacity", function (d2){
                        return getCategoty(d1.program)==d2.group ? 1 : 0.05; })
                    .attr("fill-opacity", function (d2){
                        return getCategoty(d1.program)==d2.group ? 1 : 0.1; });

            }
            else{
                svg.selectAll(".nodeP1")
                    .transition().duration(dur)
                    .attr("fill-opacity", 0);
                svg.selectAll(".nodeP2")
                    .transition().duration(dur)
                    .attr("fill-opacity", 0);

            }
            svg.selectAll(".links")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){ return getCategoty(d1.program)==d2.source.group ? 1 : 0.1; });
            svg.selectAll(".linksP1")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){ return getCategoty(d1.program)==d2.source.group ? 1 : 0.1; });
            svg.selectAll(".links01")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){ return getCategoty(d1.program)==d2.source.group ? 1 : 0.1; });
            svg.selectAll(".linksP2")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){ return getCategoty(d1.program)==d2.source.group ? 1 : 0.1; });
            svg.selectAll(".links02")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){ return getCategoty(d1.program)==d2.source.group ? 1 : 0.1; });

        }
        function mouseoutLegend(d1){
            svg.selectAll(".legendText")
                .attr("fill-opacity", 1);
            svg.selectAll(".legendLine")
                .attr("stroke-opacity", 1);
            svg.selectAll(".legendCircle")
                .attr("fill-opacity", 1);
            svg.selectAll(".lineGraph")
                .transition().duration(dur)
                .attr("stroke-opacity", 1);
            svg.selectAll(".nodeImage")
                .transition().duration(dur)
                .attr("stroke-opacity", 1)
                .attr("fill-opacity", 1);
            svg.selectAll(".links")
                .transition().duration(dur)
                .attr("stroke-opacity", 1);
            svg.selectAll(".nodeCircle")
                .transition().duration(dur)
                .attr("fill-opacity", 1);

            if (document.getElementById("checkboxP1").checked){
                svg.selectAll(".nodeImageP1")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1)
                    .attr("fill-opacity", 1);
                svg.selectAll(".nodeP1")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1)
                    .attr("fill-opacity", 1);
                svg.selectAll(".linksP1")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1);
                svg.selectAll(".links01")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1);
                svg.selectAll(".nodeImageP2")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1)
                    .attr("fill-opacity", 1);
                svg.selectAll(".nodeP2")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1)
                    .attr("fill-opacity", 1);
                svg.selectAll(".linksP2")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1);
                svg.selectAll(".links02")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1);

            }
        }
        // Draw title *******************************
        svg.append("text")
            .attr("class", "title")
            .style("font-size", "25px")
            .attr("text-anchor", "left")
            .attr("fill", "#000")
            .attr("x", margin.left+230)
            .attr("y", 20)
            .text("Class participation graph");

        // Draw Label for yAxis *******************************
        svg.append("text")
            .attr("class", "title")
            .style("font-size", "17px")
            .attr("text-anchor", "middle")
            .attr("fill", "#000")
            .attr("x", width/2-100)
            .attr("y", height+40)
            .text("Date");

        svg.selectAll(".lineGraph")
            .data(aData).enter()
            .append("path")
            .attr("class", "lineGraph")
            .attr("stroke-width", 1)
            .attr("stroke", function(d) {
                return color(d.group);
            })
            .attr("d", function(d) {
                return valueline(d);
            });

        // Add the x Axis
        svg.append("g")
            .attr("class", "xAxis")
            .style("font-size", "14px")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the y Axis
        svg.append("g")
            .style("font-size", "14px")
            .call(d3.axisLeft(yAxis).ticks(12, "%"));

        // Append xAxis label
        svg.append("text")
            .style("fill", "black")
            .style("font-size", "17px")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(-52,"+height/2+") rotate(-90)")
            .text("Percentage of participations in student's final grade");

        for (var i=0; i<aData.length;i++){
            var nod1 = {};
            nod1.name = aData[i].name;
            nod1.nickname = aData[i].nickname;
            nod1.group = aData[i].group;
            nod1.score = aData[i].score;
            nod1.date = aData[i].date;
            nod1.image = aData[i].image;
            nodes.push(nod1);

            var nod2 = {};
            nod2.name = aData[i].name;
            nod2.nickname = aData[i].nickname;
            nod2.group = aData[i].group;
            nod2.score = aData[i].score;
            nod2.date = aData[i].date;
            nod2.studentTalk = aData[i].studentTalk;
            nod2.studentReport = aData[i].studentReport;
            nod2.image = aData[i].image;
            nodes.push(nod2);

            var lin = {};
            lin.source = nod1;
            lin.target = nod2;
            lin.group = nod1.group;
            links.push(lin);

            // PROJECT 1
            var nodeP11 = {};
            nodeP11.name = aData[i].name;
            nodeP11.nickname = aData[i].nickname;
            nodeP11.group = aData[i].group;
            nodeP11.score = aData[i].score;
            nodeP11.P1_code = aData[i].P1_code;
            nodeP11.P1_talk = aData[i].P1_talk;
            nodeP11.P1_report = aData[i].P1_report;
            nodeP11.P1_survey = aData[i].P1_survey;
            nodeP11.date = aData[i].date;
            nodeP11.image = aData[i].image;
            nodesP1.push(nodeP11);

            var nodeP12 = {};
            nodeP12.name = aData[i].name;
            nodeP12.nickname = aData[i].nickname;
            nodeP12.group = aData[i].group;
            nodeP12.score = aData[i].score;
            nodeP12.P1_code = aData[i].P1_code;
            nodeP12.P1_talk = aData[i].P1_talk;
            nodeP12.P1_report = aData[i].P1_report;
            nodeP12.P1_survey = aData[i].P1_survey;
            nodeP12.date = aData[i].date;
            nodeP12.image = aData[i].image;
            nodesP1.push(nodeP12);

            var linP1 = {};
            linP1.source = nodeP11;
            linP1.target = nodeP12;
            linP1.group = nodeP11.group;
            linksP1.push(linP1);

            // PROJECT 2
            var nodeP21 = {};
            nodeP21.name = aData[i].name;
            nodeP21.nickname = aData[i].nickname;
            nodeP21.group = aData[i].group;
            nodeP21.score = aData[i].score;
            nodeP21.P2_code = aData[i].P2_code;
            nodeP21.P2_talk = aData[i].P2_talk;
            nodeP21.P2_report = aData[i].P2_report;
            nodeP21.P2_review = aData[i].P2_review;
            nodeP21.P2_reviewForOthers = aData[i].P2_reviewForOthers;
            nodeP21.date = aData[i].date;
            nodeP21.image = aData[i].image;
            nodesP2.push(nodeP21);

            var nodeP22 = {};
            nodeP22.name = aData[i].name;
            nodeP22.nickname = aData[i].nickname;
            nodeP22.group = aData[i].group;
            nodeP22.score = aData[i].score;
            nodeP22.P2_code = aData[i].P2_code;
            nodeP22.P2_talk = aData[i].P2_talk;
            nodeP22.P2_report = aData[i].P2_report;
            nodeP22.P2_review = aData[i].P2_review;
            nodeP22.P2_reviewForOthers = aData[i].P2_reviewForOthers;
            nodeP22.date = aData[i].date;
            nodeP22.image = aData[i].image;
            nodesP2.push(nodeP22);

            var linP2 = {};
            linP2.source = nodeP21;
            linP2.target = nodeP22;
            linP2.group = nodeP21.group;
            linksP2.push(linP2);

        }

        // Compute the summary
        var countA =0;
        var countB =0;
        var countC =0;
        for (var i=0;i<nodesP2.length;i=i+2){
            var p0 = nodes[i].score;
            if (p0>10)
                p0=10;
            var p1 = nodesP1[i].P1_code+nodesP1[i].P1_talk+nodesP1[i].P1_report+nodesP1[i].P1_survey;
            var p2 = nodesP2[i].P2_code+nodesP2[i].P2_talk+nodesP2[i].P2_report
                +nodesP2[i].P2_review+nodesP2[i].P2_reviewForOthers;
            var studentChoice =  nodes[i+1].studentTalk +nodes[i+1].studentReport;

            var sum= p0+p1+p2+studentChoice;
            var finalGrade = " ";
            if (sum>=95){
                countA++;
                finalGrade = "A+";
            }
            else if (sum>=90){
                finalGrade = "A ";
                countA++;
            }
            else if (sum>=85){
                finalGrade = "A-";
                countA++;
            }
            else if (sum>=80){
                finalGrade = "B+";
                countB++;
            }
            else if (sum>=75){
                finalGrade = "B";
                countB++;
            }
            else if (sum>=70){
                finalGrade = "B-";
                countB++;
            }
            else if (sum>=50){
                countC++;
                finalGrade = "C";
            }
            nodes[i].finalScore = sum;
            nodes[i].finalLetter = finalGrade;
            nodes[i+1].finalScore = sum;
            nodes[i+1].finalLetter = finalGrade;

            console.log( finalGrade+ " "+nodesP1[i].name+" sum="+sum);
        }
        console.log("countA="+countA+" countB="+countB +" countC="+countC);
        link = svg.selectAll(".links")
            .data(links)
            .enter().append("line")
            .attr("class", "links")
            .attr("stroke", function(d){
                return color(d.group);
            })
            .attr("stroke-width",0.5);
        linkP1 = svg.selectAll(".linksP1")
            .data(linksP1)
            .enter().append("line")
            .attr("class", "linksP1")
            .attr("stroke", function(d){
                return color(d.group);
            })
            .attr("stroke-width",0.5);

        linkP2 = svg.selectAll(".linksP2")
            .data(linksP2)
            .enter().append("line")
            .attr("class", "linksP2")
            .attr("stroke", function(d){
                return color(d.group);
            })
            .attr("stroke-width",0.5);


        link01 = svg.selectAll(".links01")
            .data(links)
            .enter().append("line")
            .attr("class", "links01")
            .attr("stroke", function(d){ return color(d.group);})
            .attr("stroke-width",0.5);

        link02 = svg.selectAll(".links02")
            .data(links)
            .enter().append("line")
            .attr("class", "links02")
            .attr("stroke", function(d){ return color(d.group);})
            .attr("stroke-width", function(d){
                // console.log(d.source.name);
                return d.source.name=="Sara Sartoli" ? 0 : 0.5;
            });


        node = svg.selectAll(".nodeCircle")
            .data(nodes)
            .enter().append("circle")
            .attr("class","nodeCircle")
            .attr("r", function(d,i) {
                if (i%2==0)
                    return 0;
                else
                    return radius+1;
            })
            .attr("fill", function(d,i) {
                if (i%2==0)
                    return "#110";
                else
                    return color(d.group);
            })
            .on("mouseover", mouseoverNode)
            .on("mouseout", mouseoutNode)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        nodeP1 = svg.selectAll(".nodeP1")
            .data(nodesP1)
            .enter().append("circle")
            .attr("class","nodeP1")
            .attr("r", function(d,i) {
                if (i%2==0)
                    return 0;
                else
                    return radius+1;
            })
            .attr("fill", function(d,i) {
                if (i%2==0)
                    return "#110";
                else
                    return color(d.group);
            })
            .on("mouseover", mouseoverNode)
            .on("mouseout", mouseoutNode)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        nodeP2 = svg.selectAll(".nodeP2")
            .data(nodesP2)
            .enter().append("circle")
            .attr("class","nodeP2")
            .attr("r", function(d,i) {
                if (i%2==0)
                    return 0;
                else
                    return radius+1;
            })
            .attr("fill", function(d,i) {
                if (i%2==0)
                    return "#110";
                else
                    return color(d.group);
            })
            .on("mouseover", mouseoverNode)
            .on("mouseout", mouseoutNode)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));


        for (var i=0;i<nodes.length;i++){
            var imgurl = "http://wallpapers.androlib.com/wallicons/wallpaper.big-pqC.cs.png"
            var defs = svg.append("defs").attr("id", "imgdefs")
            var catpattern = defs.append("pattern")
                .attr("id", "catpattern"+i)
                .attr("height", 1)
                .attr("width", 1)
                .attr("x", "0")
                .attr("y", "0")

            /*catpattern.append("image")
                 .attr("x", 0)
                 .attr("y", 0)
                 .attr("height", radius*2)
                 .attr("width", radius*2)
                 .attr("xlink:href", "../photos/"+nodes[i].image.trim())*/
        }


        if (revealIdentity){
            nodeImageP1 = svg.selectAll(".nodeImageP1")
                .data(nodesP1).enter()
                .append("circle")
                .attr("class", "nodeImageP1")
                .attr("r", radius)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .style("fill", function(d,i) {
                    if (i%2==1)
                        return "url(#catpattern"+i+")";
                    else
                        return "none";

                })
                .attr("stroke-width",2)
                .attr("stroke", function(d,i) {
                    if (i%2==0)
                        return "none";
                    else
                        return color(d.group);
                })
                .on("mouseover", mouseoverNode)
                .on("mouseout", mouseoutNode)
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            nodeImage = svg.selectAll(".nodeImage")
                .data(nodes).enter()
                .append("circle")
                .attr("class", "nodeImage")
                .attr("r", radius)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .style("fill", function(d,i) {
                    if (i%2==1)
                        return "url(#catpattern"+i+")";
                    else
                        return "none";
                })
                .attr("stroke-width",2)
                .attr("stroke", function(d,i) {
                    if (i%2==0)
                        return "none";
                    else
                        return color(d.group);
                })
                .on("mouseover", mouseoverNode)
                .on("mouseout", mouseoutNode)
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            nodeImage.append("title")
                .text(function(d) { return d.name; });
        }
        else{
            node.append("title")
                .text(function(d) { return d.nickname; });
            nodeP1.append("title")
                .text(function(d) { return d.nickname; });
            nodeP2.append("title")
                .text(function(d) { return d.nickname; });
        }





        fadeP1();


        simulation
            .nodes(nodes)
            .on("tick", ticked);
        simulation.force("link")
            .links(links);
        simulation.force("collide", d3.forceCollide(function(d,i){
            if (i%2==0)
                return 0;
            else
                return radius+1;
        }));
        simulation.alpha(0.25);


        simulationP1
            .nodes(nodesP1)
            .on("tick", tickedP1);
        simulationP1.force("link")
            .links(linksP1);
        simulationP1.force("collide", d3.forceCollide(function(d,i){
            if (i%2==0)
                return 0;
            else
                return radius+1;
        }));

        simulationP2
            .nodes(nodesP2)
            .on("tick", tickedP2);
        simulationP2.force("link")
            .links(linksP2);
        simulationP2.force("collide", d3.forceCollide(function(d,i){
            if (i%2==0)
                return 0;
            else
                return radius+1;
        }));


    });
}

function ticked() {
    for (var i=0;i<nodes.length;i=i+2){
        if (document.getElementById("checkboxP1").checked &&
            nodes[i].name.indexOf("Manasa")<0 && nodes[i].name.indexOf("Paul")<0)
            nodes[i].x = xNew(today);
        else
            nodes[i].x = x(nodes[i].date);
        nodes[i].y = y(nodes[i].score);
    }
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    if (revealIdentity){
        nodeImage
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }
}

function tickedP1() {
    for (var i=0;i<nodesP1.length;i=i+2){
        if (document.getElementById("checkboxP1").checked){
            nodesP1[i].x = width*0.63;
            nodesP1[i].y = yP1(nodesP1[i].P1_code+nodesP1[i].P1_talk+nodesP1[i].P1_report);
        }
        else{
            nodesP1[i].x = x(nodesP1[i].date);
            nodesP1[i].y = y(nodesP1[i].score);
        }

    }
    linkP1
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    link01
        .attr("x1", function(d,i) { return nodes[i*2+1].x; })
        .attr("y1", function(d,i) { return nodes[i*2+1].y; })
        .attr("x2", function(d,i) { return nodesP1[i*2+1].x; })
        .attr("y2", function(d,i) { return nodesP1[i*2+1].y; });

    nodeP1
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    if (revealIdentity){
        nodeImageP1
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }
}

function tickedP2() {
    for (var i=0;i<nodesP2.length;i=i+2){
        if (document.getElementById("checkboxP1").checked){
            nodesP2[i].x = width*0.8;
            var yy = nodesP2[i].P2_code+nodesP2[i].P2_talk+nodesP2[i].P2_report
                +nodesP2[i].P2_review;
            nodesP2[i].y = yP1(yy*22/27);  // 35% compared to 20%
        }
        else{
            nodesP2[i].x = x(nodesP2[i].date);
            nodesP2[i].y = y(nodesP2[i].score);
        }

    }
    linkP2
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    link02
        .attr("x1", function(d,i) { return nodesP1[i*2+1].x; })
        .attr("y1", function(d,i) { return nodesP1[i*2+1].y; })
        .attr("x2", function(d,i) { return nodesP2[i*2+1].x; })
        .attr("y2", function(d,i) { return nodesP2[i*2+1].y; });

    nodeP2
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
}

function showP1(){

    // This is to make sure that all object are reset to opacity =1
    var obj ={};
    obj.nickname = nodes[0].nickname;
    obj.index = nodes[0].index;
    obj.name = nodes[0].name;
    mouseoutNode(obj);

    // Add the x Axis
    if (document.getElementById("checkboxP1").checked){
        svg.selectAll(".xAxis").remove();
        svg.selectAll(".legendLine10")
            .attr("stroke-opacity", 0);
        svg.selectAll(".lineGraph")
            .attr("stroke-width",0.5);
        svg.append("g")
            .attr("class", "xAxis")
            .style("font-size", "14px")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xNew));
        svg.selectAll(".nodeImageP1")
            .transition().duration(400)
            .attr("fill-opacity",1)
            .attr("stroke-opacity",1);

        svg.selectAll(".nodeImageP1")
            .transition().duration(400)
            .attr("fill-opacity",function(d){
                return (d.name.indexOf("Manasa")<0 && d.name.indexOf("Paul")<0)? 1 : 0;})
            .attr("stroke-opacity",function(d){
                return (d.name.indexOf("Manasa")<0 && d.name.indexOf("Paul")<0)? 1 : 0;});
        svg.selectAll(".links01")
            .transition().duration(400)
            .attr("stroke-opacity",function(d){
                return (d.source.name.indexOf("Manasa")<0 && d.source.name.indexOf("Paul")<0)? 1 : 0;
            });

        // Project 2
        svg.selectAll(".links02")
            .transition().duration(400)
            .attr("stroke-opacity",1);   // 2018 Tommy

        // Project 3
        svg.selectAll(".links03")
            .transition().duration(400)
            .attr("stroke-opacity",1); // 2018 Tommy


        if (!revealIdentity){
            svg.selectAll(".nodeP1")
                .transition().duration(400)
                .attr("fill-opacity",1);
            svg.selectAll(".nodeP2")
                .transition().duration(400)
        }



        // Draw grade axis ***********
        var aGrades = [20, 16, 12, 8];
        var aText = ["A", "B", "C", "D", "F"];
        for (var i=0; i<aGrades.length-1;i++){
            svg.append("line")
                .attr("class", "lineGradeP1")
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .attr("x1", width*0.99)
                .attr("y1", yP1(aGrades[i])-80)
                .attr("x2", width*0.99)
                .attr("y2", yP1(aGrades[i+1]+0.3)-80);
            svg.append("line")
                .attr("class", "lineGradeP1")
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .attr("x1", width*0.98)
                .attr("y1", yP1(aGrades[i])-80)
                .attr("x2", width*0.99)
                .attr("y2", yP1(aGrades[i])-80);
            svg.append("line")
                .attr("class", "lineGradeP1")
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .attr("x1", width*0.98)
                .attr("y1", yP1(aGrades[i+1]+0.3)-80)
                .attr("x2", width*0.99)
                .attr("y2", yP1(aGrades[i+1]+0.3)-80);
            svg.append("text")
                .attr("class", "textGradeP1")
                .style("font-size", "18px")
                .attr("text-anchor", "start")
                .attr("fill", "#000")
                .attr("x", width*0.99+4)
                .attr("y", (yP1(aGrades[i])+yP1(aGrades[i+1]))/2-80)
                .text(aText[i]);
        }
    }
    else{
        fadeP1();
    }
    simulation.restart();
    simulation.alpha(0.3);
    simulationP1.restart();
    simulationP1.alpha(0.3);
    simulationP2.restart();
    simulationP2.alpha(0.3);
    svg.selectAll(".lineGraph")
        .transition().duration(300)
        .attr("d", function(d) {
            return valueline(d);
        });
}

function fadeP1(){
    svg.selectAll(".xAxis").remove();
    svg.selectAll(".legendLine10")
        .attr("stroke-opacity", 1);
    svg.selectAll(".lineGraph")
        .attr("stroke-width",1);
    svg.append("g")
        .attr("class", "xAxis")
        .style("font-size", "14px")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    svg.selectAll(".nodeImageP1")
        .transition().duration(1500)
        .attr("fill-opacity",0)
        .attr("stroke-opacity",0);
    svg.selectAll(".nodeP1")
        .transition().duration(1500)
        .attr("fill-opacity",0);
    svg.selectAll(".linksP1")
        .transition().duration(1500)
        .attr("stroke-opacity",0);
    svg.selectAll(".lineGradeP1")
        .transition().duration(1500)
        .remove();
    svg.selectAll(".textGradeP1")
        .transition().duration(1500)
        .remove();
    // Project 2
    svg.selectAll(".nodeImageP2")
        .transition().duration(1500)
        .attr("fill-opacity",0)
        .attr("stroke-opacity",0);
    svg.selectAll(".nodeP2")
        .transition().duration(1500)
        .attr("fill-opacity",0);
    svg.selectAll(".linksP2")
        .transition().duration(1500)
        .attr("stroke-opacity",0);
    svg.selectAll(".lineGradeP2")
        .transition().duration(1500)
        .remove();

}



function searchNode() {
    //searchTerm = document.getElementById('search').value;
    var obj ={};
    obj.nickname = document.getElementById('search').value;
    for (var i=0;i<nodes.length;i++){
        if (obj.nickname==nodes[i].nickname && nodes[i].index!=undefined){
            obj.index = nodes[i].index;
            obj.name = nodes[i].name;
        }
    }
    mouseoutNode(obj);
    mouseoverNode(obj);

}


function mouseoverNode(d1){
    //if (d1.P1_code!=undefined && !document.getElementById("checkboxP1").checked)
    //   return;
    svg.selectAll(".lineGraph")
        .transition().duration(dur)
        .attr("stroke-opacity", function (d2){ return d1.name==d2.name ? 1 : 0.05; });
    svg.selectAll(".nodeImage")
        .transition().duration(dur)
        .attr("stroke-opacity", function (d2){ return d1.name==d2.name ? 1 : 0.05; })
        .attr("fill-opacity", function (d2){ return d1.name==d2.name ? 1 : 0.1; });
    if (revealIdentity){
        svg.selectAll(".nodeImageP1")
            .transition().duration(dur)
            .attr("stroke-opacity", function (d2){
                if (!document.getElementById("checkboxP1").checked) return 0;
                return d1.name==d2.name ? 1 : 0.05; })
            .attr("fill-opacity", function (d2){
                if (!document.getElementById("checkboxP1").checked) return 0;
                return d1.name==d2.name ? 1 : 0.1; });
        svg.selectAll(".nodeCircle")
            .transition().duration(dur)
            .attr("fill-opacity", 0);
    }
    else{
        //debugger;
        svg.selectAll(".nodeCircle")
            .transition().duration(dur)
            .attr("stroke-opacity", function (d2){
                //  if (!document.getElementById("checkboxP1").checked) return 0;
                return d1.name==d2.name ? 1 : 0.05; })
            .attr("fill-opacity", function (d2){
                //  if (!document.getElementById("checkboxP1").checked) return 0;
                return d1.name==d2.name ? 1 : 0.1; });
        if (document.getElementById("checkboxP1").checked){
            svg.selectAll(".nodeP1")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){
                    //  if (!document.getElementById("checkboxP1").checked) return 0;
                    return d1.name==d2.name ? 1 : 0.05; })
                .attr("fill-opacity", function (d2){
                    //  if (!document.getElementById("checkboxP1").checked) return 0;
                    return d1.name==d2.name ? 1 : 0.1; });

            // Project 2
            svg.selectAll(".nodeP2")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){
                    //  if (!document.getElementById("checkboxP1").checked) return 0;
                    return d1.name==d2.name ? 1 : 0.05; })
                .attr("fill-opacity", function (d2){
                    //  if (!document.getElementById("checkboxP1").checked) return 0;
                    return d1.name==d2.name ? 1 : 0.1; });

        }

    }

    svg.selectAll(".links")
        .transition().duration(dur)
        .attr("stroke-opacity", function (d2){ return d1.name==d2.source.name ? 1 : 0.1; });
    svg.selectAll(".linksP1")
        .transition().duration(dur)
        .attr("stroke-opacity", function (d2){
            if (!document.getElementById("checkboxP1").checked) return 0;
            return d1.name==d2.source.name ? 1 : 0.1; });
    svg.selectAll(".links01")
        .transition().duration(dur)
        .attr("stroke-opacity", function (d2){
            if (!document.getElementById("checkboxP1").checked) return 0;
            return d1.name==d2.source.name ? 1 : 0.1; });

    svg.selectAll(".linksP2")
        .transition().duration(dur)
        .attr("stroke-opacity", function (d2){
            if (!document.getElementById("checkboxP1").checked) return 0;
            return d1.name==d2.source.name ? 1 : 0.1; });
    svg.selectAll(".links02")
        .transition().duration(dur)
        .attr("stroke-opacity", function (d2){
            if (!document.getElementById("checkboxP1").checked) return 0;
            return d1.name==d2.source.name ? 1 : 0.1; });
    if (document.getElementById("checkboxP1").checked){
        textP1(d1.index);
    }
    textContribution(d1.index);
}

function textContribution(index){
    svg.append("text")
        .attr("class", "textContribution")
        .style("font-size", "13px")
        .attr("text-anchor", "left")
        .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
        .attr("fill", "#000")
        .attr("x", radius+nodes[index].x)
        .attr("y", nodes[index].y+3)
        .text("Participation: "+nodes[index].score+"%");

    if (nodes[index].studentTalk>0){
        svg.append("text")
            .attr("class", "textStudentTalk")
            .style("font-size", "13px")
            .attr("text-anchor", "left")
            .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
            .attr("fill", "#000")
            .attr("x", radius+nodes[index].x)
            .attr("y", nodes[index].y+20)
            .text("SC Talk: "+nodes[index].studentTalk+"%");
    }
    else{
        svg.append("text")
            .attr("class", "textStudentTalk")
            .style("font-size", "13px")
            .attr("text-anchor", "left")
            .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
            .attr("fill", "#00f")
            .attr("x", radius+nodes[index].x)
            .attr("y", nodes[index].y+20)
            .text("SC Talk: not yet presented");

    }
    if (nodes[index].studentReport>=0){
        svg.append("text")
            .attr("class", "textStudentReport")
            .style("font-size", "13px")
            .attr("text-anchor", "left")
            .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
            .attr("fill", "#000")
            .attr("x", radius+nodes[index].x)
            .attr("y", nodes[index].y+35)
            .text("SC Report: "+nodes[index].studentReport+"%");
    }


    svg.append("text")
        .attr("class", "textFinal")
        .style("font-size", "14px")
        .attr("text-anchor", "left")
        .style("text-shadow", "1px 1px 0 rgba(0, 0, 0")
        .attr("fill", "#f00")
        .attr("x", radius+nodes[index].x)
        .attr("y", nodes[index].y+55)
        .text("Final grade: "+nodes[index].finalLetter);
    svg.append("text")
        .attr("class", "textFinal")
        .style("font-size", "14px")
        .attr("text-anchor", "left")
        .style("text-shadow", "1px 1px 0 rgba(0, 0, 0")
        .attr("fill", "#a00")
        .attr("x", radius+nodes[index].x+60)
        .attr("y", nodes[index].y+70)
        .text(nodes[index].finalScore+"%");
}

function textP1(index){
    svg.append("text")
        .attr("class", "textP1")
        .style("font-size", "13px")
        .attr("text-anchor", "middle")
        .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
        .attr("fill", "#000")
        .attr("x", radius+nodesP1[index].x)
        .attr("y", nodesP1[index].y-12)
        .text("Code: "+nodesP1[index].P1_code+"%");
    svg.append("text")
        .attr("class", "textP1")
        .style("font-size", "13px")
        .attr("text-anchor", "middle")
        .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
        .attr("fill", "#000")
        .attr("x", radius+nodesP1[index].x+26)
        .attr("y", nodesP1[index].y+3)
        .text("Talk: "+nodesP1[index].P1_talk+"%");
    svg.append("text")
        .attr("class", "textP1")
        .style("font-size", "13px")
        .attr("text-anchor", "middle")
        .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
        .attr("fill", "#000")
        .attr("x", radius+nodesP1[index].x)
        .attr("y", nodesP1[index].y+18)
        .text("Report: "+nodesP1[index].P1_report+"%");

    svg.append("text")
        .attr("class", "textP1")
        .style("font-size", "13px")
        .attr("text-anchor", "middle")
        .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
        .attr("fill", "#000")
        .attr("x", radius+nodesP1[index].x)
        .attr("y", nodesP1[index].y+33)
        .text("P1 Survey: "+nodesP1[index].P1_survey+"%");

    // Project 2
    svg.append("text")
        .attr("class", "textP2")
        .style("font-size", "13px")
        .attr("text-anchor", "middle")
        .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
        .attr("fill", "#000")
        .attr("x", radius+nodesP2[index].x+12)
        .attr("y", nodesP2[index].y-12)
        .text("Code: "+nodesP2[index].P2_code+"%");
    svg.append("text")
        .attr("class", "textP2")
        .style("font-size", "13px")
        .attr("text-anchor", "middle")
        .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
        .attr("fill", "#000")
        .attr("x", radius+nodesP2[index].x+26)
        .attr("y", nodesP2[index].y+3)
        .text("Talk: "+nodesP2[index].P2_talk+"%");
    svg.append("text")
        .attr("class", "textP2")
        .style("font-size", "13px")
        .attr("text-anchor", "middle")
        .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
        .attr("fill", "#000")
        .attr("x", radius+nodesP2[index].x+5)
        .attr("y", nodesP2[index].y+18)
        .text("Report: "+nodesP2[index].P2_report+"%");
    svg.append("text")
        .attr("class", "textP2")
        .style("font-size", "13px")
        .attr("text-anchor", "middle")
        .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
        .attr("fill", "#000")
        .attr("x", radius+nodesP2[index].x+5)
        .attr("y", nodesP2[index].y+33)
        .text("P2 Review Teammates: "+nodesP2[index].P2_review+"%");

    svg.append("text")
        .attr("class", "textP2")
        .style("font-size", "13px")
        .attr("text-anchor", "middle")
        .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
        .attr("fill", "#000")
        .attr("x", radius+nodesP2[index].x+5)
        .attr("y", nodesP2[index].y+48)
        .text("P2 Review Others: "+nodesP2[index].P2_reviewForOthers+"%");
}

function mouseoutNode(d1){
    svg.selectAll(".lineGraph")
        .transition().duration(dur)
        .attr("stroke-opacity", 1);
    svg.selectAll(".nodeImage")
        .transition().duration(dur)
        .attr("stroke-opacity", 1)
        .attr("fill-opacity", 1); ;
    svg.selectAll(".nodeCircle")
        .transition().duration(dur)
        .attr("stroke-opacity", 1)
        .attr("fill-opacity", 1);

    if (document.getElementById("checkboxP1").checked){
        svg.selectAll(".nodeP1")
            .transition().duration(dur)
            .attr("stroke-opacity", 1)
            .attr("fill-opacity", 1);
        svg.selectAll(".nodeP2")
            .transition().duration(dur)
            .attr("stroke-opacity", 1)
            .attr("fill-opacity", 1);
    }
    svg.selectAll(".links")
        .transition().duration(dur)
        .attr("stroke-opacity", 1);
    if (document.getElementById("checkboxP1").checked){
        svg.selectAll(".linksP1")
            .transition().duration(dur)
            .attr("stroke-opacity", 1);
        svg.selectAll(".linksP2")
            .transition().duration(dur)
            .attr("stroke-opacity", 1);

        svg.selectAll(".nodeImageP1")
            .transition().duration(400)
            .attr("fill-opacity",function(d){
                return (d.name.indexOf("Manasa")<0 && d.name.indexOf("Paul")<0)? 1 : 0;})
            .attr("stroke-opacity",function(d){
                return (d.name.indexOf("Manasa")<0 && d.name.indexOf("Paul")<0)? 1 : 0;});
        svg.selectAll(".links01")
            .transition().duration(400)
            .attr("stroke-opacity",function(d){
                return (d.source.name.indexOf("Manasa")<0 && d.source.name.indexOf("Paul")<0)? 1 : 0;
            });
        svg.selectAll(".links02")
            .transition().duration(400)
            .attr("stroke-opacity",function(d){
                return (d.source.name.indexOf("Manasa")<0 && d.source.name.indexOf("Paul")<0)? 1 : 0;
            });
        svg.selectAll(".links03")
            .transition().duration(400)
            .attr("stroke-opacity",function(d){
                return (d.source.name.indexOf("Manasa")<0 && d.source.name.indexOf("Paul")<0)? 1 : 0;
            });
    }
    svg.selectAll(".textP1").remove();
    svg.selectAll(".textP2").remove();
    svg.selectAll(".textContribution").remove();
    svg.selectAll(".textStudentTalk").remove();
    svg.selectAll(".textStudentReport").remove();
    svg.selectAll(".textFinal").remove();
}
function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

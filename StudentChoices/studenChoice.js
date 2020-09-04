lastTime = new Date('8/30/2020');
let key = ['ID','Timestamp','Your name','Your topic','Schedule','Image'];
Promise.all([d3.csv('../grade/data/Students.csv')
,d3.csv('CS4331 and CS5331_ Student choice (Responses) - Form Responses 1.csv')])
.then(function(dataRaw){
    // date for highlight
    let limit_time = new Date();

    let data = dataRaw[1];
    let notPresentyet = data.filter(d=>(d.date=new Date(d['Schedule']+'/2020 16:55'), d.date>=limit_time));
    let thresholdDate = new Date(+d3.min(notPresentyet,d=>d.date));
    console.log(thresholdDate)
    thresholdDate.setHours(16);
    debugger
    notPresentyet.filter(d=>d.date<=thresholdDate).forEach(d=>d.isHighlight = true);

    let dataPeople = dataRaw[0];
    let people={};
    dataPeople.forEach(d=>people[d.Email.toLowerCase()]=d);
    // Student miss profile
    data.filter(d=>!people[d['Email Address'].toLowerCase()])

    //sort by presentation day
    data.sort((a,b)=>a.date-b.date);
    //adjust image link
    data.forEach(d=>d['Image']=d['Image']===''?'':`http://drive.google.com/uc?export=view&id=${d['Image'].split('id=')[1]}`)

    data.forEach((d,i)=>d.ID=i+1)
    let interested_level = d3.scaleLinear().domain([0,4]) .range(["white", "#6ece58"]);
    let approve = new RegExp('Approve');
    let dataCell = d3.select('#currentTopic tbody').selectAll('tr').data(data)
        .join('tr')
        .classed('highlight',d=>d.isHighlight)
        .style('background-color',d=>approve.test(d['Professor'])?interested_level(d['Interested level']):(d['Professor']==''?'#ddd':'#ffc4c4'))
        .selectAll('td')
        .data(d=>key.map(k=>({key:k, value: d[k], data:d})))
        .join('td')
        .text(d=>d.value);
    dataCell
        .filter(d=>d.key==="Image")
        .text(()=>'')
        .selectAll('a')
            .data(d=>d.value?[d]:[])
            .join('a')
            .attr('href',d=>d.data['Link']===''?'#':d.data['Link'])
            .selectAll('img')
            .data(d=>[d])
                .join('img')
                .style('width','200px')
                .attr("src", function(d){
                    // return d.value===''?"https://via.placeholder.com/300x200":d.value;
                    return d.value;
                })
                // .on("error", function(d){
                //     this.setAttribute("href", "https://via.placeholder.com/300x100");
                // })

});

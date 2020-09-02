lastTime = new Date('8/30/2020');
let key = ['ID','Timestamp','Your name','Your topic','Schedual','Image','Professor'];
d3.csv('CS4331 and CS5331_ Student choice (Responses) - Form Responses 1.csv').then(function(dataRaw){
    let data = dataRaw;
    data.forEach((d,i)=>d.ID=i+1)
    let interested_level = d3.scaleLinear().domain([0,4]) .range(["white", "#6ece58"]);
    let approve = new RegExp('Approve');
    d3.select('#currentTopic tbody').selectAll('tr').data(data)
        .join('tr')
        .style('background-color',d=>approve.test(d['Professor'])?interested_level(d['Interested level']):(d['Professor']==''?'#ddd':'#ffc4c4'))
        .selectAll('td')
        .data(d=>key.map(k=>d[k]))
        .join('td')
        .text(d=>d);

});

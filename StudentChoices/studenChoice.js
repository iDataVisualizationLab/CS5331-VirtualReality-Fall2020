lastTime = new Date('8/30/2020');
let key = ['Timestamp','Your name','Your topic','Professor']
// let key = ['Your name','Your topic','Note','Scheduled','Link','Report']
d3.csv('CS4331 and CS5331_ Student choice (Responses) - Form Responses 1.csv').then(function(dataRaw){
    let data = dataRaw;
    let interested_level = d3.scaleOrdinal(d3.schemeBlues);
    d3.select('#currentTopic tbody').selectAll('tr').data(data)
        .join('tr')
        .style('background-color',d=>d['Professor']==='Approve'?(d['Interested level']?interested_level(d['Interested level']):null):'#ffc4c4')
        .selectAll('td')
        .data(d=>key.map(k=>d[k]))
        .join('td')
        .text(d=>d)
});

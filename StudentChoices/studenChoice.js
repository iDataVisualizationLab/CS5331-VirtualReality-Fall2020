lastTime = new Date('8/30/2020');
let key = ['Your name','Your topic','Scheduled','Link','Report']
d3.csv('Student choice.csv').then(function(dataRaw){
    let data = dataRaw.filter(e=>e.Approved);
    d3.select('#currentTopic tbody').selectAll('tr').data(data)
        .join('tr')
        .selectAll('td')
        .data(d=>key.map(k=>d[k]))
        .join('td')
        .text(d=>d)
});

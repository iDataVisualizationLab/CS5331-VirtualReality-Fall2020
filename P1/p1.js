lastTime = new Date('8/30/2020');
let key = ['id','name','demo','githubURL','screenshot'];
Promise.all([d3.csv('../grade/data/Students.csv')
,d3.csv('mongo-p1.csv')])
.then(function(dataRaw){
    // date for highlight
    let limit_time = new Date();

    let data = dataRaw[1];
    debugger
    let notPresentyet = data.filter(d=>(d.date=new Date(d['Schedule']+' 16:55'), d.date>=limit_time));
    let thresholdDate = new Date(+d3.min(notPresentyet,d=>d.date));
    console.log(thresholdDate)

    thresholdDate.setHours(16);
    debugger
    notPresentyet.filter(d=>d.date<=thresholdDate).forEach(d=>d.isHighlight = true);

    let dataPeople = dataRaw[0];
    let people={};
    dataPeople.forEach(d=>people[d.Fullname.toLowerCase()]=d);
    // Student miss profile
    // data.filter(d=>!people[d['Email Address'].toLowerCase()])
    //mapping people and presentation
    data.forEach(d=>{
    d['Student Image']= '../photos/'+(people[d['name'].toLowerCase()]||{})['Photoname'];});


    //sort by presentation day
    data.sort((a,b)=>a.date-b.date);
    //adjust image link
    data.forEach(d=>d['screenshot']=d['screenshot']===''?'':`http://drive.google.com/uc?export=view&id=${d['screenshot'].split('id=')[1]}`)

    data.forEach((d,i)=>d.ID=i+1)
    let dataCell = d3.select('#currentTopic tbody').selectAll('tr').data(data)
        .join('tr')
        .classed('pluse-red',d=>d.isHighlight)
        .style('background-color',d=>d.url!==''?null:'#ffc4c4')
        .selectAll('td')
        .data(d=>key.map(k=>({key:k, value: d[k], data:d})))
        .join('td')
        .text(d=>d.value);
    dataCell .filter(d=>(d.key==="demo" ||d.key==='githubURL')&&d.value!=='')
        .text(()=>'')
        .selectAll('a')
        .data(d=>d.value?[d]:[])
        .join('a')
        .attr('href',d=>d.data['Link']===''?'#':d.value)
        .attr('target','_blank').text(d=>d.key)
    dataCell
        .filter(d=>d.key==="name")
        .classed('name',true)
        .html(d=>`<img class="avatar" src="${d.data['Student Image']}"></img>${d.value}`)
    dataCell
        .filter(d=>d.key==="screenshot")
        .text(()=>'')
        .selectAll('a')
        .data(d=>d.value?[d]:[])
        .join('a')
        .attr('href',d=>d.data['Link']===''?'#':d.data['url'])
        .attr('target','_blank')
        .selectAll('img')
        .data(d=>[d])
        .join('img')
        .style('width','200px')
        .attr("src", function(d){
            // return d.value===''?"https://via.placeholder.com/300x200":d.value;
            return d.value;
        })
});

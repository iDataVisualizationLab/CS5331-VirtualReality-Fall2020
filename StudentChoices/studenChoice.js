lastTime = new Date('8/30/2020');
let key = ['ID','Timestamp','Your name','Program','Your topic','Schedule','Presentation video','Image'];
Promise.all([d3.json("https://cs5331-vr-fall202.herokuapp.com/students")
,d3.csv('CS4331 and CS5331_ Student choice (Responses) - Form Responses 1.csv'),d3.json('https://cs5331-vr-fall202.herokuapp.com/scores/abovelimit?project=StudentChoice')])
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

    let highlightID = dataRaw[2];
    let dataPeople = dataRaw[0];
    let people={};
    dataPeople.forEach(d=>{
        people[d.Email.toLowerCase()]=d;
        d.isabove10 = highlightID.find(id=>d.id===id);
    });
    // Student miss profile
    // data.filter(d=>!people[d['Email Address'].toLowerCase()])
    //mapping people and presentation
    data.forEach(d=>{
        const p = people[d['Email Address'].toLowerCase()]||{};
        d.isabove10 = p.isabove10;
        d['Program'] = p.Level??'--no data--';
        d['Student Image']= '../photos/'+p['Photoname'];
    });


    //sort by presentation day
    data.sort((a,b)=>a.id-b.id);
    //adjust image link
    data.forEach(d=>d['Image']=d['Image']===''?'':`http://drive.google.com/uc?export=view&id=${d['Image'].split('id=')[1]}`)

    data.forEach((d,i)=>d.ID=i+1)
    let interested_level = d3.scaleLinear().domain([0,4]) .range(["white", "#6ece58"]);
    let approve = new RegExp('Approve');
    let dataCell = d3.select('#currentTopic tbody').selectAll('tr').data(data)
        .join('tr')
        .classed('pluse-red',d=>d.isHighlight)
        .style('background-color',d=>{
            if ((d.isabove10 && d.ID!==44 && d.ID!==6) || d.ID===12|| d.ID===35)
                return '#96c6ee';
            // return approve.test(d['Professor'])?interested_level(d['Interested level']):(d['Professor']==''?'#ddd':'#ffc4c4')
        })
        .selectAll('td')
        .data(d=>key.map(k=>({key:k, value: d[k], data:d})))
        .join('td')
        .text(d=>d.value);

    dataCell
        .filter(d=>d.key==="Presentation video")
        .html(d=>d.data['Presentation video']?`<a href="${d.value}">${d.data['Schedule']}</a> pass: ${d.data['Pass']} <br></br>${(new RegExp('skip').test(d.data['Presentation time'])?'':' at ')+d.data['Presentation time']}`:'')
    dataCell
        .filter(d=>d.key==="Your name")
        .classed('name',true)
        .html(d=>`<img class="avatar" src="${d.data['Student Image']}"></img>${d.value}`)
    dataCell
        .filter(d=>d.key==="Image")
        .text(()=>'')
        .selectAll('a')
        .data(d=>d.value?[d]:[])
        .join('a')
        .attr('href',d=>d.data['Link']===''?'#':d.data['Link'])
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

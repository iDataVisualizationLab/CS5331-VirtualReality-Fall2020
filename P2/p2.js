lastTime = new Date('8/30/2020');
// let key = ['id','name','abstract',['url','githubURL'],'comment','screenshot','note'];
let key = ['id','name','abstract',['url','githubURL'],'comment','note'];
function replaceString(key){
    switch (key) {
        case 'demo':
            return 'demo link';
        case 'url':
            return 'demo url';
        case 'githubURL':
            return 'github link';
        default:
            return key;
    }
}

Promise.all([d3.json("https://cs5331-vr-fall202.herokuapp.com/students")
    ,d3.csv('P2_group.csv'),d3.json('data/midFeedback.json')])
    .then(function(dataRaw){
        // date for highlight
        let limit_time = new Date();

        let data = dataRaw[1];

        let notPresentyet = data.filter(d=>(d.date=new Date(d['Schedule']+' 16:55'), d.date>=limit_time));
        let thresholdDate = new Date(+d3.min(notPresentyet,d=>d.date));
        console.log(thresholdDate)

        thresholdDate.setHours(16);

        notPresentyet.filter(d=>d.date<=thresholdDate).forEach(d=>d.isHighlight = true);

        let dataPeople = dataRaw[0].filter(d=>+d.onclass);
        let people={};
        dataPeople.forEach(d=>people[d.id]=d);
        // Student miss profile
        // data.filter(d=>!people[d['Email Address'].toLowerCase()])
        //mapping people and presentation
        data.forEach(d=>{
            d.members = d.members.split(',');
            d['Student Image']= d.members.map(id=>'../photos/'+(people[id]||{})['Photoname']);});

        debugger
        let comments = d3.nest().key(d=>d.presenter_id).map(dataRaw[2].filter(d=>d.comment!=="" && (!new RegExp(/hardship|same question/i).test(d.comment))))

        //sort by presentation day
        data.sort((a,b)=>a.date-b.date);
        //adjust image link
        data.forEach(d=>d['screenshot']=d['screenshot']===''?'':`http://drive.google.com/uc?export=view&id=${d['screenshot'].split('id=')[1]}`)

        data.forEach((d,i)=>{
            d.ID=i+1;
            d.abstract = `<div style="max-height: 220px; overflow-y: auto">${d.abstract}</div>`
            d.comment = '<div style="max-height: 220px; overflow-y: auto">'+(comments.get(d.ID)??[]).map(d=>`<p>- ${d.comment}</p>`).join('')+'</div>';
        });


        let dataCell = d3.select('#currentTopic tbody').selectAll('tr').data(data)
            .join('tr')
            .classed('pluse-red',d=>d.isHighlight)
            // .style('background-color',d=>d.url!==''?null:'#ffc4c4')
            .selectAll('td')
            .data(d=>key.map(k=>({key:k, value:k.map?k.map(e=>d[e]): d[k], data:d})))
            .join('td')
            .html(d=>d.value);
        dataCell .filter(d=>(d.key.map || d.key==="demo" || d.key==="url" ||d.key==='githubURL')&&d.value!=='')
            .text(()=>'')
            .html(d=>(d.key.map?d.value:[d.value]).filter(v=>v!=='').map((v,i)=>`
            <a href="${v!==''?v:'#'}" target="_blank">${replaceString(d.key[i])}</a>
            `).join(', '))

        dataCell
            .filter(d=>d.key==="id")
            .classed('name',true)
            .html(d=>`${d.value}. <span style="font-weight: bold">${d.data.name}</span>`)
        dataCell
            .filter(d=>d.key==="name")
            .html(d=>`
            ${d.data['Student Image'].map((img,i)=>`<img class="avatar" src="${img}"></img> ${people[d.data.members[i]].Fullname} 
 <button type="button" class="btn btn-outline-primary copybtn btn-sm" data-toggle="tooltip" title="Copy to clipboard"  data-clipboard-text="${people[d.data.members[i]].Email}"><svg width=".8em" height=".8em" viewBox="0 0 1024 896" class="bi bi-bookmarks" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path xmlns="http://www.w3.org/2000/svg" d="M128 768h256v64H128v-64z m320-384H128v64h320v-64z m128 192V448L384 640l192 192V704h320V576H576z m-288-64H128v64h160v-64zM128 704h160v-64H128v64z m576 64h64v128c-1 18-7 33-19 45s-27 18-45 19H64c-35 0-64-29-64-64V192c0-35 29-64 64-64h192C256 57 313 0 384 0s128 57 128 128h192c35 0 64 29 64 64v320h-64V320H64v576h640V768zM128 256h512c0-35-29-64-64-64h-64c-35 0-64-29-64-64s-29-64-64-64-64 29-64 64-29 64-64 64h-64c-35 0-64 29-64 64z"/>
</svg></button>`).join('<br>')}`)
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
        clipboardDemos = new ClipboardJS('.copybtn');
        clipboardDemos.on('success',function(e){e.clearSelection();
        d3.select(e.trigger).attr('data-original-title','Copied!');
        $(e.trigger).tooltip('show');
            d3.select(e.trigger).attr('data-original-title','Copy to clipboard');
        });
        // clipboardDemos.on('error',function(e){showTooltip(e.trigger,fallbackMessage(e.action));});
        $('[data-toggle="tooltip"]').tooltip();
});
function copyToCLipboard(nodeClass){
        var emailLink = document.querySelector(nodeClass);
        var range = document.createRange();
        range.selectNode(emailLink);
        window.getSelection().addRange(range);
        // Now that we've selected the anchor text, execute the copy command
    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copy email command was ' + msg);
    } catch(err) {
        console.log('Oops, unable to copy');
    }
    window.getSelection().removeAllRanges();
}

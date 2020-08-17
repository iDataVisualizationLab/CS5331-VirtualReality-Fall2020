var cars = [{name: "A", value: 111}, {name:"B", value: 12}
        , {name: "C", value: 3}];


        cars.sort( function(a, b){
            if (a.value>b.value)
            return 1;
          else
            return -1;
        });

        console.log("My array: " ,cars);

        debugger;

        //cars[10] =100;
        var text = "<ul>";
        for (var i=0; i<cars.length;i++){
            text+="<li>"+cars[i].value+"</li>";
        }
        text += "</ul>";

    document.getElementById("item").innerHTML = text;